export type Process = "SMAW" | "GMAW" | "Control";
export type EvidenceStatus = "complete" | "partial" | "missing";

export interface HardnessProfile {
  baseMetal?: number;
  haz?: number;
  fusionZone?: number;
}

export interface Experiment {
  id: string;
  specimen: string;
  process: Process;
  current: number | null;
  travelSpeed: number | null;
  initialMass: number | null;
  finalMass: number | null;
  massLossPercent: number | null;
  corrosionRate: number | null;
  finalMeasurementDay: number | null;
  ocpMonitoredToDay: number | null;
  microstructureStatus: EvidenceStatus;
  microstructureScore: number | null;
  microstructureNote: string;
  hardness: HardnessProfile;
  visualInspection: string;
  sourceWarnings: string[];
}

export interface ScoringWeights {
  corrosion: number;
  hardness: number;
  microstructure: number;
}

export interface ScoreResult {
  corrosion: number | null;
  hardness: number | null;
  microstructure: number | null;
  composite: number | null;
  provisional: number | null;
  completedFactors: number;
  totalFactors: number;
}
