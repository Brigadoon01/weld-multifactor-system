import type { Experiment, ScoreResult, ScoringWeights } from "./types";

export const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));

export function corrosionScore(rate: number | null, ceiling = 5, target = 2) {
  if (rate === null || !Number.isFinite(rate)) return null;
  return clamp(((ceiling - rate) / (ceiling - target)) * 100);
}

export function hardnessScore(experiment: Experiment, allowableSpread = 50) {
  const values = Object.values(experiment.hardness).filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  if (values.length < 3) return null;
  const spread = Math.max(...values) - Math.min(...values);
  return clamp(100 - (spread / allowableSpread) * 100);
}

export function scoreExperiment(
  experiment: Experiment,
  weights: ScoringWeights,
  corrosionCeiling: number,
  allowableHardnessSpread: number,
): ScoreResult {
  const factors = {
    corrosion: corrosionScore(experiment.corrosionRate, corrosionCeiling),
    hardness: hardnessScore(experiment, allowableHardnessSpread),
    microstructure: experiment.microstructureScore,
  };
  const entries = Object.entries(factors) as Array<[keyof ScoringWeights, number | null]>;
  const available = entries.filter(([, score]) => score !== null);
  const completedFactors = available.length;
  const weightedTotal = available.reduce((sum, [key, score]) => sum + (score ?? 0) * weights[key], 0);
  const availableWeight = available.reduce((sum, [key]) => sum + weights[key], 0);
  const allFactorsPresent = completedFactors === entries.length;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return {
    ...factors,
    composite: allFactorsPresent && totalWeight === 100 ? weightedTotal / 100 : null,
    provisional: availableWeight > 0 ? weightedTotal / availableWeight : null,
    completedFactors,
    totalFactors: entries.length,
  };
}

export function calculateCorrosionRate(
  initialMass: number | null,
  finalMass: number | null,
  areaMm2: number,
  durationDays: number,
) {
  if (
    initialMass === null ||
    finalMass === null ||
    areaMm2 <= 0 ||
    durationDays <= 0 ||
    initialMass < finalMass
  ) {
    return null;
  }
  const massLossMg = (initialMass - finalMass) * 1000;
  return (massLossMg / areaMm2 / durationDays) * 365;
}

export function qualityIssues(experiment: Experiment) {
  const issues = [...experiment.sourceWarnings];
  if (experiment.corrosionRate === null) issues.push("No corrosion rate has been recorded.");
  if (hardnessScore(experiment) === null) issues.push("A three-zone hardness profile is required for the hardness factor.");
  if (experiment.microstructureScore === null)
    issues.push("No rubric score has been assigned to the available microstructural evidence.");
  return [...new Set(issues)];
}
