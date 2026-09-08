import React, { useState } from "react";
import { Modal } from "./Modal";
import { IconArrowLeft, IconArrowRight, IconCheck } from "./Icons";
import type { EvidenceStatus, Experiment, Process } from "../types";
import { calculateCorrosionRate, calculateMassLossPercent, hardnessScore } from "../scoring";

interface AddWeldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (experiment: Experiment) => void;
}

export const AddWeldModal: React.FC<AddWeldModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<"params" | "corrosion" | "hardness" | "micro">("params");

  // Form State
  const [specimen, setSpecimen] = useState("Custom Weld 01");
  const [process, setProcess] = useState<Process>("SMAW");
  const [current, setCurrent] = useState("165");
  const [travelSpeed, setTravelSpeed] = useState("6.50");

  // Corrosion
  const [initialMass, setInitialMass] = useState("5.250");
  const [finalMass, setFinalMass] = useState("4.580");
  const [durationDays, setDurationDays] = useState("28");
  const [areaMm2, setAreaMm2] = useState("360");

  // Hardness
  const [baseMetal, setBaseMetal] = useState("180");
  const [haz, setHaz] = useState("172");
  const [fusionZone, setFusionZone] = useState("170");

  // Microstructure
  const [microStatus, setMicroStatus] = useState<EvidenceStatus>("complete");
  const [microScore, setMicroScore] = useState("75");
  const [microNote, setMicroNote] = useState("Custom test coupon; visual inspection confirmed defect-free bead.");

  // Live Computed Previews
  const initM = parseFloat(initialMass) || 0;
  const finM = parseFloat(finalMass) || 0;
  const days = parseFloat(durationDays) || 28;
  const area = parseFloat(areaMm2) || 360;

  const liveMassLoss = calculateMassLossPercent(initM, finM);
  const liveCorrosionRate = calculateCorrosionRate(initM, finM, area, days);

  const bmNum = parseFloat(baseMetal) || 180;
  const hazNum = parseFloat(haz) || 0;
  const fzNum = parseFloat(fusionZone) || 0;
  const mockExpForHardness: Experiment = {
    id: "temp",
    specimen: "",
    process: "SMAW",
    current: null,
    travelSpeed: null,
    initialMass: null,
    finalMass: null,
    massLossPercent: null,
    corrosionRate: null,
    finalMeasurementDay: null,
    ocpMonitoredToDay: null,
    microstructureStatus: "missing",
    microstructureScore: null,
    microstructureNote: "",
    hardness: { baseMetal: bmNum, haz: hazNum, fusionZone: fzNum },
    visualInspection: "",
    sourceWarnings: [],
  };
  const liveHardnessScore = hardnessScore(mockExpForHardness);
  const liveHardnessSpread = hazNum > 0 && fzNum > 0 ? Math.max(bmNum, hazNum, fzNum) - Math.min(bmNum, hazNum, fzNum) : null;

  const handleCreate = () => {
    const id = `custom-${Date.now()}`;
    const newRecord: Experiment = {
      id,
      specimen: specimen.trim() || "Custom Test Coupon",
      process,
      current: parseFloat(current) || null,
      travelSpeed: parseFloat(travelSpeed) || null,
      initialMass: initM || null,
      finalMass: finM || null,
      massLossPercent: liveMassLoss,
      corrosionRate: liveCorrosionRate ? parseFloat(liveCorrosionRate.toFixed(2)) : null,
      finalMeasurementDay: days,
      ocpMonitoredToDay: days,
      microstructureStatus: microStatus,
      microstructureScore: microScore ? parseFloat(microScore) : null,
      microstructureNote: microNote.trim() || "User entered custom test data.",
      hardness: {
        baseMetal: bmNum,
        haz: hazNum || undefined,
        fusionZone: fzNum || undefined,
      },
      visualInspection: "User custom entry.",
      sourceWarnings: ["User-contributed custom record."],
    };

    onAdd(newRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Your Own Weld Coupon"
      subtitle="Input your empirical lab results to benchmark against the research dataset"
      badge="Custom Ingestion Wizard"
      maxWidth="840px"
    >
      <div className="wizard-nav">
        <button
          className={`wizard-nav__item ${activeTab === "params" ? "is-active" : ""}`}
          onClick={() => setActiveTab("params")}
        >
          1. Welding Parameters
        </button>
        <button
          className={`wizard-nav__item ${activeTab === "corrosion" ? "is-active" : ""}`}
          onClick={() => setActiveTab("corrosion")}
        >
          2. Corrosion Mass Loss
        </button>
        <button
          className={`wizard-nav__item ${activeTab === "hardness" ? "is-active" : ""}`}
          onClick={() => setActiveTab("hardness")}
        >
          3. Hardness Profile
        </button>
        <button
          className={`wizard-nav__item ${activeTab === "micro" ? "is-active" : ""}`}
          onClick={() => setActiveTab("micro")}
        >
          4. Microstructure
        </button>
      </div>

      <div className="wizard-content">
        {activeTab === "params" && (
          <div className="wizard-grid">
            <div className="form-field">
              <label>Specimen Designation / Code</label>
              <input
                type="text"
                value={specimen}
                placeholder="e.g. SMAW 165A Field Coupon"
                onChange={(e) => setSpecimen(e.target.value)}
              />
              <small>A unique label for your coupon in charts and tables.</small>
            </div>

            <div className="form-field">
              <label>Welding Process</label>
              <select value={process} onChange={(e) => setProcess(e.target.value as Process)}>
                <option value="SMAW">SMAW (Shielded Metal Arc / Stick)</option>
                <option value="GMAW">GMAW (Gas Metal Arc / MIG)</option>
                <option value="Control">Unwelded Base Plate Control</option>
              </select>
              <small>Process configuration used for arc deposition.</small>
            </div>

            <div className="form-field">
              <label>Welding Current (Amperes)</label>
              <input
                type="number"
                value={current}
                placeholder="e.g. 165"
                onChange={(e) => setCurrent(e.target.value)}
              />
              <small>Electrode / wire operating amperage.</small>
            </div>

            <div className="form-field">
              <label>Travel Speed (mm/s)</label>
              <input
                type="number"
                step="0.01"
                value={travelSpeed}
                placeholder="e.g. 6.50"
                onChange={(e) => setTravelSpeed(e.target.value)}
              />
              <small>Linear torch advance rate along the joint.</small>
            </div>
          </div>
        )}

        {activeTab === "corrosion" && (
          <div>
            <div className="wizard-grid">
              <div className="form-field">
                <label>Initial Mass (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={initialMass}
                  onChange={(e) => setInitialMass(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Final Mass (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={finalMass}
                  onChange={(e) => setFinalMass(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Exposure Duration (Days)</label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Exposed Surface Area (mm²)</label>
                <input
                  type="number"
                  value={areaMm2}
                  onChange={(e) => setAreaMm2(e.target.value)}
                />
              </div>
            </div>

            <div className="live-preview-box">
              <div className="preview-stat">
                <span>Computed Mass Loss</span>
                <strong>{liveMassLoss !== null ? `${liveMassLoss.toFixed(2)}%` : "—"}</strong>
              </div>
              <div className="preview-stat">
                <span>Calculated Corrosion Rate (R)</span>
                <strong>{liveCorrosionRate !== null ? `${liveCorrosionRate.toFixed(2)} mg/mm²/yr` : "—"}</strong>
              </div>
              <p className="preview-help">
                Calculated automatically via ASTM standard gravimetric formula: <code>(Δm / Area / Days) × 365</code>.
              </p>
            </div>
          </div>
        )}

        {activeTab === "hardness" && (
          <div>
            <div className="wizard-grid">
              <div className="form-field">
                <label>Base Metal Hardness (BHN)</label>
                <input
                  type="number"
                  value={baseMetal}
                  onChange={(e) => setBaseMetal(e.target.value)}
                />
                <small>Reference plate baseline hardness (nominal 180 BHN).</small>
              </div>

              <div className="form-field">
                <label>Heat-Affected Zone (HAZ BHN)</label>
                <input
                  type="number"
                  step="0.1"
                  value={haz}
                  placeholder="e.g. 171.5"
                  onChange={(e) => setHaz(e.target.value)}
                />
                <small>H1 traverse reading adjacent to fusion boundary.</small>
              </div>

              <div className="form-field">
                <label>Fusion Zone Hardness (FZ BHN)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fusionZone}
                  placeholder="e.g. 170.0"
                  onChange={(e) => setFusionZone(e.target.value)}
                />
                <small>H2 traverse reading within the weld bead center.</small>
              </div>
            </div>

            <div className="live-preview-box">
              <div className="preview-stat">
                <span>3-Zone Hardness Spread</span>
                <strong>{liveHardnessSpread !== null ? `${liveHardnessSpread.toFixed(1)} BHN` : "—"}</strong>
              </div>
              <div className="preview-stat">
                <span>Homogeneity Score (0–100)</span>
                <strong>{liveHardnessScore !== null ? `${Math.round(liveHardnessScore)} / 100` : "—"}</strong>
              </div>
              <p className="preview-help">
                Smaller spread indicates uniform microstructural transformation without excessive softening or embrittlement.
              </p>
            </div>
          </div>
        )}

        {activeTab === "micro" && (
          <div>
            <div className="wizard-grid">
              <div className="form-field">
                <label>Evidence Coverage Status</label>
                <select value={microStatus} onChange={(e) => setMicroStatus(e.target.value as EvidenceStatus)}>
                  <option value="complete">Complete (SEM, EDS & XRD Characterized)</option>
                  <option value="partial">Partial (Optical / Visual Only)</option>
                  <option value="missing">Missing / Not Available</option>
                </select>
              </div>

              <div className="form-field">
                <label>Microstructure Rubric Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={microScore}
                  onChange={(e) => setMicroScore(e.target.value)}
                />
                <small>Based on phase balance (austenite/ferrite) and inclusion density.</small>
              </div>
            </div>

            <div className="form-field" style={{ marginTop: "16px" }}>
              <label>Microstructural & Metallurgical Observations</label>
              <textarea
                rows={3}
                value={microNote}
                placeholder="Enter SEM phase observations, EDS elemental retention (e.g. % Cr, % Ni), or pit morphology notes..."
                onChange={(e) => setMicroNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="modal-footer">
        <div className="modal-footer__left">
          {activeTab !== "params" && (
            <button
              className="secondary-button"
              onClick={() => {
                if (activeTab === "corrosion") setActiveTab("params");
                if (activeTab === "hardness") setActiveTab("corrosion");
                if (activeTab === "micro") setActiveTab("hardness");
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        <div className="modal-footer__right">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          {activeTab !== "micro" ? (
            <button
              className="primary-button"
              onClick={() => {
                if (activeTab === "params") setActiveTab("corrosion");
                else if (activeTab === "corrosion") setActiveTab("hardness");
                else if (activeTab === "hardness") setActiveTab("micro");
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              Next Step <IconArrowRight size={14} />
            </button>
          ) : (
            <button
              className="primary-button primary-button--accent"
              onClick={handleCreate}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconCheck size={16} /> Save &amp; Benchmark Weld
            </button>
          )}
        </div>
      </footer>
    </Modal>
  );
};
