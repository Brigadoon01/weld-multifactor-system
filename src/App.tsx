import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { defaultWeights, sourceExperiments } from "./data";
import {
  calculateCorrosionRate,
  calculateMassLossPercent,
  corrosionScore,
  hardnessScore,
  qualityIssues,
  scoreExperiment,
} from "./scoring";
import type { EvidenceStatus, Experiment, Process, ScoringWeights } from "./types";
import { OcpChart } from "./components/OcpChart";
import { MassLossChart } from "./components/MassLossChart";
import { EdsChart } from "./components/EdsChart";
import { PerformanceRadar } from "./components/PerformanceRadar";
import { AddWeldModal } from "./components/AddWeldModal";
import { ComparisonModal } from "./components/ComparisonModal";
import { Modal } from "./components/Modal";
import {
  IconDashboard,
  IconTests,
  IconCorrosion,
  IconEvidence,
  IconScores,
  IconExport,
  IconCompare,
  IconPlus,
  IconArrowRight,
  IconLineChart,
  IconScale,
  IconPrinter,
  IconInbox,
  IconTrash,
} from "./components/Icons";

type View = "overview" | "registry" | "corrosion" | "evidence" | "scoring" | "report";

const STORAGE_KEY = "weldscope-research-lab-v8";

const navigation: Array<{ id: View; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Dashboard", icon: <IconDashboard size={17} /> },
  { id: "registry", label: "Tests", icon: <IconTests size={17} /> },
  { id: "corrosion", label: "Corrosion", icon: <IconCorrosion size={17} /> },
  { id: "evidence", label: "Evidence", icon: <IconEvidence size={17} /> },
  { id: "scoring", label: "Scores", icon: <IconScores size={17} /> },
  { id: "report", label: "Export", icon: <IconExport size={17} /> },
];

const sourceNotice = "Your data stays in this browser.";

const formatRate = (value: number | null) => (value === null ? "—" : `${value.toFixed(2)} mg/mm²/yr`);
const formatPercent = (value: number | null) => (value === null ? "—" : `${value.toFixed(2)}%`);
const formatScore = (value: number | null) => (value === null ? "—" : Math.round(value).toString());
const numericValue = (value: string) => (value.trim() === "" ? null : Number(value));

function statusLabel(status: EvidenceStatus) {
  if (status === "complete") return "Complete";
  if (status === "partial") return "Partial";
  return "Missing";
}

function useStoredExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return sourceExperiments;
      const parsed = JSON.parse(stored) as { experiments?: Experiment[] };
      return Array.isArray(parsed.experiments) ? parsed.experiments : sourceExperiments;
    } catch {
      return sourceExperiments;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ experiments }));
  }, [experiments]);

  return [experiments, setExperiments] as const;
}

function MetricCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "accent" | "warning";
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function StatusPill({ status }: { status: EvidenceStatus }) {
  return <span className={`status status--${status}`}>{statusLabel(status)}</span>;
}

function ProcessMark({ process }: { process: Process }) {
  return <span className={`process-mark process-mark--${process.toLowerCase()}`}>{process}</span>;
}

function ScoreBar({ score, muted = false }: { score: number | null; muted?: boolean }) {
  return (
    <div className={`score-bar ${muted ? "score-bar--muted" : ""}`} aria-label={`Score ${formatScore(score)} out of 100`}>
      <span style={{ width: `${score ?? 0}%` }} />
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
        <IconInbox size={32} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  const [experiments, setExperiments] = useStoredExperiments();
  const [activeView, setActiveView] = useState<View>("overview");
  const [selectedId, setSelectedId] = useState("smaw-170");
  const [weights, setWeights] = useState<ScoringWeights>(defaultWeights);
  const [corrosionCeiling, setCorrosionCeiling] = useState(40);
  const [hardnessSpreadLimit, setHardnessSpreadLimit] = useState(50);
  const [importMessage, setImportMessage] = useState("");
  const [corrosionChartTab, setCorrosionChartTab] = useState<"ocp" | "massLoss">("ocp");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareConditionA, setCompareConditionA] = useState<string | undefined>(undefined);
  const [compareConditionB, setCompareConditionB] = useState<string | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  const handleOpenCompare = (condA?: string, condB?: string) => {
    setCompareConditionA(condA || selectedId);
    setCompareConditionB(condB || (selectedId === "smaw-170" ? "control" : "smaw-170"));
    setIsCompareModalOpen(true);
  };

  const handleAddNewWeld = (newExp: Experiment) => {
    setExperiments((prev) => [newExp, ...prev]);
    setSelectedId(newExp.id);
    setActiveView("overview");
  };

  const handleDeleteExperiment = (idToDelete: string) => {
    const updated = experiments.filter((e) => e.id !== idToDelete);
    setExperiments(updated);
    if (selectedId === idToDelete) {
      setSelectedId(updated[0]?.id ?? "");
    }
    if (compareConditionA === idToDelete) {
      setCompareConditionA(updated[0]?.id ?? undefined);
    }
    if (compareConditionB === idToDelete) {
      setCompareConditionB(updated[1]?.id ?? updated[0]?.id ?? undefined);
    }
    setConfirmDeleteId(null);
  };

  const experimentToDelete = experiments.find((e) => e.id === confirmDeleteId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeView]);

  const selected = experiments.find((experiment) => experiment.id === selectedId) ?? experiments[0];
  const welds = experiments.filter((experiment) => experiment.process !== "Control");
  const scores = useMemo(
    () =>
      new Map(
        experiments.map((experiment) => [
          experiment.id,
          scoreExperiment(experiment, weights, corrosionCeiling, hardnessSpreadLimit),
        ]),
      ),
    [experiments, weights, corrosionCeiling, hardnessSpreadLimit],
  );
  const orderedByCorrosion = [...welds].sort(
    (left, right) => (left.corrosionRate ?? Number.MAX_VALUE) - (right.corrosionRate ?? Number.MAX_VALUE),
  );
  const corrosionLeader = orderedByCorrosion[0];
  const corrosionLeaderScore = corrosionLeader ? scores.get(corrosionLeader.id) : undefined;
  const orderedByComposite = [...welds].sort(
    (left, right) => (scores.get(right.id)?.composite ?? 0) - (scores.get(left.id)?.composite ?? 0),
  );
  const compositeLeader = orderedByComposite[0];
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const missingFactorCount = welds.reduce(
    (count, experiment) => count + (scores.get(experiment.id)?.totalFactors ?? 0) - (scores.get(experiment.id)?.completedFactors ?? 0),
    0,
  );

  const updateExperiment = (id: string, patch: Partial<Experiment>) => {
    setExperiments((current) => current.map((experiment) => {
      if (experiment.id !== id) return experiment;
      const updated = { ...experiment, ...patch };
      if ("initialMass" in patch || "finalMass" in patch) {
        updated.massLossPercent = calculateMassLossPercent(updated.initialMass, updated.finalMass);
      }
      return updated;
    }));
  };

  const updateHardness = (id: string, key: keyof Experiment["hardness"], value: string) => {
    const experiment = experiments.find((item) => item.id === id);
    if (!experiment) return;
    updateExperiment(id, {
      hardness: { ...experiment.hardness, [key]: numericValue(value) ?? undefined },
    });
  };

  const resetResearchData = () => {
    setExperiments(sourceExperiments);
    setWeights(defaultWeights);
    setCorrosionCeiling(40);
    setHardnessSpreadLimit(50);
    setSelectedId("smaw-170");
    setImportMessage("Restored the report-backed starter dataset.");
  };

  const downloadFile = (name: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    downloadFile(
      "weldscope-research-data.json",
      JSON.stringify(
        { exportedAt: new Date().toISOString(), experiments, weights, corrosionCeiling, hardnessSpreadLimit },
        null,
        2,
      ),
      "application/json",
    );
  };

  const exportCsv = () => {
    const header = [
      "Specimen",
      "Process",
      "Current A",
      "Travel speed mm s",
      "Mass loss percent",
      "Corrosion rate mg mm2 yr",
      "Final measurement day",
      "Microstructure status",
      "Microstructure score",
      "Base metal BHN",
      "HAZ BHN",
      "Fusion zone BHN",
    ];
    const rows = experiments.map((experiment) => [
      experiment.specimen,
      experiment.process,
      experiment.current ?? "",
      experiment.travelSpeed ?? "",
      experiment.massLossPercent ?? "",
      experiment.corrosionRate ?? "",
      experiment.finalMeasurementDay ?? "",
      experiment.microstructureStatus,
      experiment.microstructureScore ?? "",
      experiment.hardness.baseMetal ?? "",
      experiment.hardness.haz ?? "",
      experiment.hardness.fusionZone ?? "",
    ]);
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    downloadFile(
      "weldscope-experiment-registry.csv",
      [header, ...rows].map((row) => row.map(quote).join(",")).join("\n"),
      "text/csv;charset=utf-8",
    );
  };

  const importResearchData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          experiments?: Experiment[];
          weights?: ScoringWeights;
          corrosionCeiling?: number;
          hardnessSpreadLimit?: number;
        };
        if (!Array.isArray(parsed.experiments)) throw new Error("No experiment registry found.");
        setExperiments(parsed.experiments);
        if (parsed.weights) setWeights(parsed.weights);
        if (typeof parsed.corrosionCeiling === "number") setCorrosionCeiling(parsed.corrosionCeiling);
        if (typeof parsed.hardnessSpreadLimit === "number") setHardnessSpreadLimit(parsed.hardnessSpreadLimit);
        setSelectedId(parsed.experiments[0]?.id ?? "");
        setImportMessage(`Loaded ${parsed.experiments.length} local experiment records.`);
      } catch {
        setImportMessage("That file is not a compatible WeldScope JSON export.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const openExperiment = (id: string, destination: View = "evidence") => {
    setSelectedId(id);
    setActiveView(destination);
  };

  const renderOverview = () => (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">AISI 304 weld comparison</span>
          <h1>Weld results at a glance</h1>
          <p>Choose a condition to view its measurements, evidence, and score.</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            <button
              className="primary-button"
              onClick={() => setIsAddModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconPlus size={16} /> Add Your Own Weld Coupon
            </button>
            <button
              className="secondary-button"
              onClick={() => handleOpenCompare()}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconCompare size={16} /> Side-by-Side Comparison
            </button>
          </div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Research overview">
        <MetricCard label="Tests" value={`${welds.length}`} detail="SMAW and GMAW conditions" />
        <MetricCard
          label="Best corrosion result"
          value={formatRate(corrosionLeader?.corrosionRate ?? null)}
          detail={corrosionLeader ? corrosionLeader.specimen : "No result yet"}
          tone="accent"
        />
        <MetricCard label="Missing score inputs" value={`${missingFactorCount}`} detail="Complete these to unlock final scores" tone="warning" />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--wide">
          <div className="panel-heading">
            <div>
              <h2>Corrosion rate</h2>
            </div>
            <span className="unit-label">Lower is better • mg/mm²/yr</span>
          </div>
          <div className="rate-chart" role="img" aria-label="Bar chart comparing penetration rates by weld condition">
            {orderedByCorrosion.map((experiment) => {
              const rate = experiment.corrosionRate ?? 0;
              const width = Math.min((rate / corrosionCeiling) * 100, 100);
              return (
                <button key={experiment.id} className="rate-row" onClick={() => openExperiment(experiment.id, "corrosion")}>
                  <span className="rate-row__label">
                    <ProcessMark process={experiment.process} />
                    <b>{experiment.current} A</b>
                  </span>
                  <span className="rate-row__track"><i style={{ width: `${width}%` }} /></span>
                  <strong>{rate.toFixed(2)}</strong>
                </button>
              );
            })}
          </div>
          <details className="data-note"><summary>About these results</summary><p>One coupon was tested per condition, so the comparison is indicative rather than conclusive.</p></details>
        </article>

        <article className="panel decision-panel">
          <h2>Best observed result</h2>
          <div className="decision-outcome">
            <strong>{corrosionLeader?.specimen ?? "No condition"}</strong>
            <p>{formatRate(corrosionLeader?.corrosionRate ?? null)}</p>
          </div>
          <p className="compact-copy">
            {corrosionLeaderScore?.composite === null
              ? "Complete the missing inputs to calculate its final score."
              : `Composite score: ${formatScore(corrosionLeaderScore?.composite ?? null)} / 100.`}
          </p>
          <button
            className="text-action"
            onClick={() => openExperiment(corrosionLeader?.id ?? selectedId)}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            View condition <IconArrowRight size={14} />
          </button>
        </article>
      </section>
    </>
  );

  const renderRegistry = () => (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Weld conditions</span>
          <h1>Tests</h1>
          <p>Add, review, benchmark, or open a condition.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="secondary-button"
            onClick={() => handleOpenCompare()}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IconCompare size={14} /> Compare Conditions
          </button>
          <button
            className="primary-button"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IconPlus size={14} /> Add condition
          </button>
        </div>
      </section>
      <section className="panel table-panel">
        {experiments.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <EmptyState
              title="No weld conditions"
              text="All weld conditions have been removed. Add your own weld condition or restore the default starter data."
            />
            <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                className="primary-button"
                onClick={() => setIsAddModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <IconPlus size={14} /> Add Your Weld
              </button>
              <button className="secondary-button" onClick={resetResearchData}>
                Restore Starter Research Data
              </button>
            </div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Current</th>
                  <th>Travel speed</th>
                  <th>Mass loss</th>
                  <th>Corrosion rate</th>
                  <th>Final reading</th>
                  <th>Evidence</th>
                  <th aria-label="Actions" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((experiment) => (
                  <tr key={experiment.id} className={experiment.id === selected?.id ? "is-selected" : ""}>
                    <td><ProcessMark process={experiment.process} /><strong>{experiment.current ? ` ${experiment.current} A` : " Reference"}</strong></td>
                    <td>{experiment.current ? `${experiment.current} A` : "—"}</td>
                    <td>{experiment.travelSpeed ? `${experiment.travelSpeed.toFixed(2)} mm/s` : "—"}</td>
                    <td>{formatPercent(experiment.massLossPercent)}</td>
                    <td>{formatRate(experiment.corrosionRate)}</td>
                    <td>{experiment.finalMeasurementDay ? `Day ${experiment.finalMeasurementDay}` : "—"}</td>
                    <td><StatusPill status={experiment.microstructureStatus} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                        <button
                          className="row-action"
                          style={{ background: "#f0f7f4", color: "#1b9956", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => handleOpenCompare(experiment.id)}
                          title="Compare with another condition"
                        >
                          <IconCompare size={13} /> Compare
                        </button>
                        <button
                          className="row-action"
                          onClick={() => openExperiment(experiment.id, "corrosion")}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          title="Open corrosion measurements"
                        >
                          Open <IconArrowRight size={13} />
                        </button>
                        <button
                          className="row-action"
                          style={{ background: "#fdf2f2", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => setConfirmDeleteId(experiment.id)}
                          title={`Remove ${experiment.specimen}`}
                        >
                          <IconTrash size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  const renderCorrosion = () => {
    if (!selected) return <EmptyState title="No condition selected" text="Create or import a condition to begin corrosion analysis." />;
    const area = 360;
    const day = selected.finalMeasurementDay ?? 28;
    const areaNormalisedRate = calculateCorrosionRate(selected.initialMass, selected.finalMass, area, day);
    const penetrationRate = calculatePenetrationRate(selected.initialMass, selected.finalMass, area, day);
    const appliedScore = corrosionScore(selected.corrosionRate, corrosionCeiling);
    return (
      <>
        <section className="page-heading page-heading--compact">
          <div>
            <span className="eyebrow">Measurement</span>
            <h1>Corrosion</h1>
            <p>Enter the mass readings and calculate the final rate.</p>
          </div>
          <ConditionPicker experiments={experiments} selectedId={selected.id} onChange={setSelectedId} />
        </section>
        <section className="corrosion-layout">
          <article className="panel data-entry-panel">
            <div className="panel-heading">
              <div>
                <h2>{selected.specimen}</h2>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <ProcessMark process={selected.process} />
                <button
                  className="secondary-button"
                  style={{ color: "#dc2626", borderColor: "#fecaca", padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => setConfirmDeleteId(selected.id)}
                  title={`Remove ${selected.specimen}`}
                >
                  <IconTrash size={12} /> Remove
                </button>
              </div>
            </div>
            <div className="form-grid">
              <NumberField label="Initial mass" suffix="g" value={selected.initialMass} onChange={(value) => updateExperiment(selected.id, { initialMass: numericValue(value) })} />
              <NumberField label="Final mass" suffix="g" value={selected.finalMass} onChange={(value) => updateExperiment(selected.id, { finalMass: numericValue(value) })} />
              <NumberField label="Final measurement" suffix="day" value={selected.finalMeasurementDay} onChange={(value) => updateExperiment(selected.id, { finalMeasurementDay: numericValue(value) })} />
              <NumberField label="Exposed area" suffix="mm²" value={area} disabled onChange={() => undefined} />
              <NumberField label="OCP monitored through" suffix="day" value={selected.ocpMonitoredToDay} onChange={(value) => updateExperiment(selected.id, { ocpMonitoredToDay: numericValue(value) })} />
              <NumberField label="Reported corrosion rate" suffix="mg/mm²/yr" value={selected.corrosionRate} onChange={(value) => updateExperiment(selected.id, { corrosionRate: numericValue(value) })} />
            </div>
            <div className="inline-action-row">
              <button
                className="secondary-button"
                disabled={areaNormalisedRate === null}
                onClick={() => updateExperiment(selected.id, { corrosionRate: areaNormalisedRate })}
              >
                Use calculated corrosion rate
              </button>
              <span>Calculated as mass loss / (exposed area 360 mm² × exposure duration) × 365 days/yr.</span>
            </div>
          </article>
          <aside className="analysis-stack">
            <article className="panel calc-card">
              <span className="eyebrow">Mass-loss rate</span>
              <div className="calc-value"><strong>{areaNormalisedRate === null ? "—" : areaNormalisedRate.toFixed(2)}</strong><span>mg/mm²/yr</span></div>
              <p>{formatPercent(selected.massLossPercent)} total mass loss</p>
            </article>
            <article className="panel calc-card calc-card--accent">
              <span className="eyebrow">Corrosion score</span>
              <div className="calc-value"><strong>{formatScore(appliedScore)}</strong><span>/ 100 corrosion score</span></div>
              <ScoreBar score={appliedScore} />
            </article>
          </aside>
        </section>

        <div className="chart-tabs">
          <button
            className={`chart-tab ${corrosionChartTab === "ocp" ? "is-active" : ""}`}
            onClick={() => setCorrosionChartTab("ocp")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IconLineChart size={15} /> 28-Day OCP Potential Curves (mV vs. SCE)
          </button>
          <button
            className={`chart-tab ${corrosionChartTab === "massLoss" ? "is-active" : ""}`}
            onClick={() => setCorrosionChartTab("massLoss")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <IconScale size={15} /> Gravimetric Mass Loss (%) Curves
          </button>
        </div>

        {corrosionChartTab === "ocp" ? (
          <OcpChart selectedId={selected.id} />
        ) : (
          <MassLossChart selectedId={selected.id} />
        )}

        <details className="panel data-note data-note--panel"><summary>Data notes ({qualityIssues(selected).length})</summary><div className="quality-list">{qualityIssues(selected).map((issue) => <p key={issue}><span>!</span>{issue}</p>)}</div></details>
      </>
    );
  };

  const renderEvidence = () => {
    if (!selected) return <EmptyState title="No condition selected" text="Create or import a condition to assess its evidence." />;
    const hardScore = hardnessScore(selected, hardnessSpreadLimit);
    return (
      <>
        <section className="page-heading page-heading--compact">
          <div>
            <span className="eyebrow">Condition details</span>
            <h1>Evidence</h1>
            <p>Add supporting observations and values.</p>
          </div>
          <ConditionPicker experiments={experiments} selectedId={selected.id} onChange={setSelectedId} />
        </section>
        <section className="evidence-layout">
          <article className="panel evidence-card">
            <div className="panel-heading">
              <div>
                <h2>Microstructure</h2>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <StatusPill status={selected.microstructureStatus} />
                <button
                  className="secondary-button"
                  style={{ color: "#dc2626", borderColor: "#fecaca", padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => setConfirmDeleteId(selected.id)}
                  title={`Remove ${selected.specimen}`}
                >
                  <IconTrash size={12} /> Remove
                </button>
              </div>
            </div>
            <label className="form-label">Evidence coverage
              <select value={selected.microstructureStatus} onChange={(event) => updateExperiment(selected.id, { microstructureStatus: event.target.value as EvidenceStatus })}>
                <option value="missing">Missing</option>
                <option value="partial">Partial</option>
                <option value="complete">Complete</option>
              </select>
            </label>
            <label className="form-label">Evidence note
              <textarea value={selected.microstructureNote} rows={6} onChange={(event) => updateExperiment(selected.id, { microstructureNote: event.target.value })} />
            </label>
            <div className="score-entry">
              <div>
                <span>Rubric score</span>
                <small>0–100</small>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="—"
                disabled={selected.microstructureStatus === "missing"}
                value={selected.microstructureStatus === "missing" ? "" : selected.microstructureScore ?? ""}
                onChange={(event) => updateExperiment(selected.id, { microstructureScore: numericValue(event.target.value) })}
              />
            </div>
            {selected.microstructureStatus === "missing" && <p className="inline-warning">Add evidence before assigning a score.</p>}
            <label className="form-label visual-note">Visual note
              <textarea rows={3} value={selected.visualInspection} onChange={(event) => updateExperiment(selected.id, { visualInspection: event.target.value })} />
            </label>
          </article>
          <article className="panel evidence-card">
            <div className="panel-heading">
              <div>
                <h2>Hardness profile</h2>
              </div>
              <span className={hardScore === null ? "status status--missing" : "status status--complete"}>{hardScore === null ? "Needs 3 values" : `${Math.round(hardScore)} / 100`}</span>
            </div>
            <div className="hardness-grid">
              <NumberField label="Base metal" suffix="BHN" value={selected.hardness.baseMetal ?? null} onChange={(value) => updateHardness(selected.id, "baseMetal", value)} />
              <NumberField label="HAZ" suffix="BHN" value={selected.hardness.haz ?? null} onChange={(value) => updateHardness(selected.id, "haz", value)} />
              <NumberField label="Fusion zone" suffix="BHN" value={selected.hardness.fusionZone ?? null} onChange={(value) => updateHardness(selected.id, "fusionZone", value)} />
            </div>
            <HardnessProfileChart profile={selected.hardness} />
            <details className="data-note"><summary>How the hardness score works</summary><p>It measures the spread across the three zones. Change the limit in Scores.</p></details>
          </article>
        </section>
        <EdsChart selectedId={selected.id} />
      </>
    );
  };

  const renderScoring = () => (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Comparison</span>
          <h1>Scores</h1>
          <p>Set the weights, then compare conditions.</p>
        </div>
        <span className={`weight-total ${totalWeight === 100 ? "is-valid" : ""}`}>{totalWeight}% total weight</span>
      </section>
      <section className="scoring-layout">
        <article className="panel weights-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Weights</span>
              <h2>Score weights</h2>
            </div>
          </div>
          <WeightControl label="Corrosion" description="Penetration rate" value={weights.corrosion} color="corrosion" onChange={(value) => setWeights((current) => ({ ...current, corrosion: value }))} />
          <WeightControl label="Hardness" description="Across weld zones" value={weights.hardness} color="hardness" onChange={(value) => setWeights((current) => ({ ...current, hardness: value }))} />
          <WeightControl label="Microstructure" description="SEM, EDS, and XRD" value={weights.microstructure} color="micro" onChange={(value) => setWeights((current) => ({ ...current, microstructure: value }))} />
          <div className="preset-row">
            <button onClick={() => setWeights({ corrosion: 60, hardness: 20, microstructure: 20 })}>Corrosion-critical</button>
            <button onClick={() => setWeights({ corrosion: 34, hardness: 33, microstructure: 33 })}>Balanced</button>
            <button onClick={() => setWeights({ corrosion: 25, hardness: 40, microstructure: 35 })}>Fabrication quality</button>
          </div>
        </article>
        <article className="panel threshold-panel">
          <span className="eyebrow">Limits</span>
          <h2>Score limits</h2>
          <NumberField label="Corrosion score ceiling" suffix="mg/mm²/yr" value={corrosionCeiling} onChange={(value) => setCorrosionCeiling(Number(value) || 0)} />
          <NumberField label="Hardness spread limit" suffix="BHN" value={hardnessSpreadLimit} onChange={(value) => setHardnessSpreadLimit(Number(value) || 0)} />
          <details className="data-note"><summary>How scores work</summary><p>Lower corrosion rates and a smaller hardness spread score higher. Microstructure is entered from your reviewed evidence.</p></details>
        </article>
      </section>
      <PerformanceRadar
        selected={selected}
        selectedScore={scores.get(selected.id)!}
        leader={compositeLeader}
        leaderScore={scores.get(compositeLeader?.id ?? "")}
      />
      {totalWeight !== 100 && <p className="model-warning">Set weights to exactly 100% before a full composite score can be calculated.</p>}
      <section className="panel score-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Score comparison</h2>
          </div>
          <span className="unit-label">0–100 scale</span>
        </div>
        <div className="score-table">
          <div className="score-table__head"><span>Condition</span><span>Corrosion</span><span>Hardness</span><span>Microstructure</span><span>Composite</span><span>Readiness</span></div>
          {orderedByCorrosion.map((experiment) => {
            const result = scores.get(experiment.id)!;
            return (
              <button key={experiment.id} className="score-table__row" onClick={() => openExperiment(experiment.id)}>
                <span><ProcessMark process={experiment.process} /><strong>{experiment.current} A</strong></span>
                <span className="score-cell" data-label="Corrosion"><b>{formatScore(result.corrosion)}</b><ScoreBar score={result.corrosion} /></span>
                <span className="score-cell" data-label="Hardness"><b>{formatScore(result.hardness)}</b><ScoreBar score={result.hardness} muted /></span>
                <span className="score-cell" data-label="Microstructure"><b>{formatScore(result.microstructure)}</b><ScoreBar score={result.microstructure} muted /></span>
                <span className="composite-cell" data-label="Composite"><b>{formatScore(result.composite)}</b>{result.composite === null && result.provisional !== null && <small>Provisional: {Math.round(result.provisional)}</small>}</span>
                <span className="readiness-number" data-label="Ready">{result.completedFactors}/{result.totalFactors}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderReport = () => (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Save your work</span>
          <h1>Export</h1>
          <p>Download or restore your local data.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => window.print()}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <IconPrinter size={16} /> Print summary
        </button>
      </section>
      <section className="report-layout">
        <article className="panel report-card">
          <h2>Current result</h2>
          <div className="report-finding"><span>Best observed corrosion result</span><strong>{corrosionLeader?.specimen ?? "—"}</strong><p>{formatRate(corrosionLeader?.corrosionRate ?? null)}</p></div>
          <details className="data-note report-limits"><summary>Data notes</summary>
            <ul>
              <li>One coupon per condition means no statistical dispersion or significance test.</li>
              <li>Hardness traverses are absent from the report-backed records.</li>
              <li>Microstructural coverage is incomplete for two conditions.</li>
              <li>GMAW final mass entries are marked for Day 28 record verification.</li>
            </ul>
          </details>
        </article>
        <article className="panel export-card">
          <h2>Import or download</h2>
          <div className="export-actions">
            <button className="secondary-button" onClick={exportJson}>Download JSON</button>
            <button className="secondary-button" onClick={exportCsv}>Download CSV</button>
            <button className="secondary-button" onClick={() => importInput.current?.click()}>Import JSON</button>
          </div>
          <input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importResearchData} />
          {importMessage && <p className="import-message">{importMessage}</p>}
          <button className="danger-link" onClick={resetResearchData}>Restore starter data</button>
        </article>
      </section>
      <p className="local-note">{sourceNotice}</p>
    </>
  );

  const content = {
    overview: renderOverview,
    registry: renderRegistry,
    corrosion: renderCorrosion,
    evidence: renderEvidence,
    scoring: renderScoring,
    report: renderReport,
  }[activeView]();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">W</span><div><b>WeldScope</b><small>Weld performance</small></div></div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => <button key={item.id} className={activeView === item.id ? "nav-item is-active" : "nav-item"} onClick={() => setActiveView(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><strong>{navigation.find((item) => item.id === activeView)?.label}</strong></div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="secondary-button"
              style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => handleOpenCompare()}
            >
              <IconCompare size={14} /> Benchmark &amp; Compare
            </button>
            <button
              className="primary-button"
              style={{ padding: "6px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => setIsAddModalOpen(true)}
            >
              <IconPlus size={14} /> Add Your Weld
            </button>
          </div>
        </header>
        <div className="content-wrap">{content}</div>
      </main>

      <AddWeldModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewWeld}
      />

      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        experiments={experiments}
        scores={scores}
        initialConditionAId={compareConditionA}
        initialConditionBId={compareConditionB}
      />

      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Remove Weld Condition?"
        maxWidth="460px"
      >
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: "14px", color: "#2a4049", lineHeight: "1.6", margin: "0 0 14px 0" }}>
            Are you sure you want to remove <strong>{experimentToDelete?.specimen}</strong> ({experimentToDelete?.process}{experimentToDelete?.current ? ` ${experimentToDelete.current} A` : ""})?
          </p>
          <div style={{ fontSize: "12px", color: "#62747b", background: "#f8faf9", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e1e9e5", lineHeight: "1.5" }}>
            This will remove this sample from the active benchmark registry, including its corrosion rates, gravimetric data, hardness profile, and composite scores.
            <br /><br />
            <em>Note: You can restore default research data at any time from the Export view.</em>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button className="secondary-button" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </button>
            <button
              className="primary-button"
              style={{ background: "#dc2626", borderColor: "#dc2626", color: "#fff", display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => {
                if (confirmDeleteId) handleDeleteExperiment(confirmDeleteId);
              }}
            >
              <IconTrash size={14} /> Remove Condition
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ConditionPicker({ experiments, selectedId, onChange }: { experiments: Experiment[]; selectedId: string; onChange: (id: string) => void }) {
  return <label className="condition-picker"><span>Active condition</span><select value={selectedId} onChange={(event) => onChange(event.target.value)}>{experiments.map((experiment) => <option key={experiment.id} value={experiment.id}>{experiment.specimen}</option>)}</select></label>;
}

function NumberField({ label, suffix, value, onChange, disabled = false }: { label: string; suffix: string; value: number | null; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className={`number-field ${disabled ? "is-disabled" : ""}`}><span>{label}</span><div><input disabled={disabled} type="number" step="any" value={value ?? ""} onChange={(event) => onChange(event.target.value)} /><em>{suffix}</em></div></label>;
}

function WeightControl({ label, description, value, color, onChange }: { label: string; description: string; value: number; color: string; onChange: (value: number) => void }) {
  return <div className="weight-control"><div><strong>{label}</strong><p>{description}</p></div><div className="weight-control__input"><input className={`range range--${color}`} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} /><output>{value}%</output></div></div>;
}

function HardnessProfileChart({ profile }: { profile: Experiment["hardness"] }) {
  const zones = [["Base metal", profile.baseMetal], ["HAZ", profile.haz], ["Fusion zone", profile.fusionZone]] as const;
  const values = zones.map(([, value]) => value).filter((value): value is number => typeof value === "number");
  const max = values.length ? Math.max(...values) * 1.1 : 1;
  return <div className="hardness-chart" aria-label="Hardness profile chart">{zones.map(([zone, value]) => <div className="hardness-chart__row" key={zone}><span>{zone}</span><div className="hardness-chart__track"><i style={{ width: value ? `${(value / max) * 100}%` : "0%" }} /></div><b>{value ?? "—"}</b></div>)}</div>;
}

function calculatePenetrationRate(initialMass: number | null, finalMass: number | null, areaMm2: number, durationDays: number) {
  if (initialMass === null || finalMass === null || areaMm2 <= 0 || durationDays <= 0 || initialMass < finalMass) return null;
  const massLossMg = (initialMass - finalMass) * 1000;
  const areaCm2 = areaMm2 / 100;
  const hours = durationDays * 24;
  return (87.6 * massLossMg) / (areaCm2 * hours * 7.93);
}
