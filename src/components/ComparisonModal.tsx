import React, { useState } from "react";
import { Modal } from "./Modal";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import type { Experiment, ScoreResult } from "../types";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiments: Experiment[];
  scores: Map<string, ScoreResult>;
  initialConditionAId?: string;
  initialConditionBId?: string;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  experiments,
  scores,
  initialConditionAId,
  initialConditionBId,
}) => {
  const defaultA = initialConditionAId || experiments[0]?.id || "";
  const defaultB = initialConditionBId || experiments.find((e) => e.id === "smaw-170")?.id || experiments[1]?.id || "";

  const [conditionAId, setConditionAId] = useState(defaultA);
  const [conditionBId, setConditionBId] = useState(defaultB);

  const condA = experiments.find((e) => e.id === conditionAId) || experiments[0];
  const condB = experiments.find((e) => e.id === conditionBId) || experiments[1] || experiments[0];

  const scoreA = condA ? scores.get(condA.id) : undefined;
  const scoreB = condB ? scores.get(condB.id) : undefined;

  // Compute Deltas
  const rateA = condA?.corrosionRate ?? 0;
  const rateB = condB?.corrosionRate ?? 0;
  const deltaRate = rateA - rateB; // negative is good (lower corrosion)

  const spreadA =
    condA?.hardness.haz && condA.hardness.fusionZone
      ? Math.max(condA.hardness.baseMetal ?? 180, condA.hardness.haz, condA.hardness.fusionZone) -
        Math.min(condA.hardness.baseMetal ?? 180, condA.hardness.haz, condA.hardness.fusionZone)
      : 0;
  const spreadB =
    condB?.hardness.haz && condB.hardness.fusionZone
      ? Math.max(condB.hardness.baseMetal ?? 180, condB.hardness.haz, condB.hardness.fusionZone) -
        Math.min(condB.hardness.baseMetal ?? 180, condB.hardness.haz, condB.hardness.fusionZone)
      : 0;
  const deltaSpread = spreadA - spreadB; // negative is good (smaller spread)

  const compA = scoreA?.composite ?? scoreA?.provisional ?? 0;
  const compB = scoreB?.composite ?? scoreB?.provisional ?? 0;
  const deltaComp = compA - compB; // positive is good

  // Radar Data
  const radarData = [
    {
      subject: "Corrosion Resistance",
      [condA?.specimen || "Condition A"]: Math.round(scoreA?.corrosion ?? 0),
      [condB?.specimen || "Condition B"]: Math.round(scoreB?.corrosion ?? 0),
      fullMark: 100,
    },
    {
      subject: "Hardness Homogeneity",
      [condA?.specimen || "Condition A"]: Math.round(scoreA?.hardness ?? 0),
      [condB?.specimen || "Condition B"]: Math.round(scoreB?.hardness ?? 0),
      fullMark: 100,
    },
    {
      subject: "Microstructure Integrity",
      [condA?.specimen || "Condition A"]: Math.round(scoreA?.microstructure ?? 0),
      [condB?.specimen || "Condition B"]: Math.round(scoreB?.microstructure ?? 0),
      fullMark: 100,
    },
  ];

  // Verdict Generator
  const generateVerdict = () => {
    if (!condA || !condB || condA.id === condB.id) {
      return "Select two different specimens above to generate a side-by-side engineering verdict.";
    }

    const winner = deltaComp > 0 ? condA.specimen : condB.specimen;
    const diff = Math.abs(deltaComp).toFixed(1);

    if (Math.abs(deltaRate) < 0.5 && Math.abs(deltaComp) < 2) {
      return `Both conditions display near-identical performance (score gap: ${diff} pts). ${condA.specimen} and ${condB.specimen} can be considered functionally interchangeable under this weighting profile.`;
    }

    if (deltaComp > 0) {
      return `${condA.specimen} outperforms ${condB.specimen} overall by +${diff} composite points. ${
        deltaRate < 0
          ? `It demonstrates superior corrosion resistance (${Math.abs(deltaRate).toFixed(2)} mg/mm²/yr lower degradation rate).`
          : `While slightly more prone to corrosion, its superior hardness homogeneity and phase stability yield a higher overall integrity score.`
      }`;
    } else {
      return `${condB.specimen} is the superior choice over ${condA.specimen} by +${diff} composite points, primarily driven by ${
        rateB < rateA ? "higher resistance to chloride degradation" : "better microstructural retention across the HAZ"
      }.`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Weld Benchmark"
      subtitle="Direct head-to-head comparison between test coupons and research leaders"
      badge="Comparative Decision Matrix"
      maxWidth="900px"
    >
      <div className="compare-selectors">
        <div className="compare-picker">
          <label>Specimen A (Primary)</label>
          <select value={conditionAId} onChange={(e) => setConditionAId(e.target.value)}>
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.specimen} ({exp.process})
              </option>
            ))}
          </select>
        </div>

        <div className="compare-vs-badge">VS</div>

        <div className="compare-picker">
          <label>Specimen B (Benchmark / Comparator)</label>
          <select value={conditionBId} onChange={(e) => setConditionBId(e.target.value)}>
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.specimen} ({exp.process})
              </option>
            ))}
          </select>
        </div>
      </div>

      {condA && condB && (
        <div className="compare-matrix">
          <div className="compare-card">
            <h4>Corrosion Rate (mg/mm²/yr)</h4>
            <div className="compare-values">
              <div className="val-col">
                <span>{condA.specimen}</span>
                <strong>{rateA.toFixed(2)}</strong>
              </div>
              <div className="delta-pill">
                {deltaRate <= 0 ? (
                  <span className="pill--green">{deltaRate === 0 ? "Equal" : `${deltaRate.toFixed(2)} mg/mm²/yr`}</span>
                ) : (
                  <span className="pill--red">{`+${deltaRate.toFixed(2)} mg/mm²/yr`}</span>
                )}
              </div>
              <div className="val-col">
                <span>{condB.specimen}</span>
                <strong>{rateB.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="compare-card">
            <h4>Hardness Spread (BHN)</h4>
            <div className="compare-values">
              <div className="val-col">
                <span>{condA.specimen}</span>
                <strong>{spreadA.toFixed(1)} BHN</strong>
              </div>
              <div className="delta-pill">
                {deltaSpread <= 0 ? (
                  <span className="pill--green">{deltaSpread === 0 ? "Equal" : `${deltaSpread.toFixed(1)} BHN`}</span>
                ) : (
                  <span className="pill--red">{`+${deltaSpread.toFixed(1)} BHN`}</span>
                )}
              </div>
              <div className="val-col">
                <span>{condB.specimen}</span>
                <strong>{spreadB.toFixed(1)} BHN</strong>
              </div>
            </div>
          </div>

          <div className="compare-card">
            <h4>Composite Score (0–100)</h4>
            <div className="compare-values">
              <div className="val-col">
                <span>{condA.specimen}</span>
                <strong style={{ color: "#0984e3" }}>{Math.round(compA)}</strong>
              </div>
              <div className="delta-pill">
                {deltaComp >= 0 ? (
                  <span className="pill--green">{deltaComp === 0 ? "Tied" : `+${deltaComp.toFixed(1)} pts`}</span>
                ) : (
                  <span className="pill--red">{`${deltaComp.toFixed(1)} pts`}</span>
                )}
              </div>
              <div className="val-col">
                <span>{condB.specimen}</span>
                <strong style={{ color: "#00b894" }}>{Math.round(compB)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: "100%", height: 320, marginTop: "20px" }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#dfe6e9" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#2d3436", fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#b2bec3" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a1722",
                borderColor: "#1e3345",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "#d7ff64", fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }} />
            <Radar
              name={condA?.specimen || "Condition A"}
              dataKey={condA?.specimen || "Condition A"}
              stroke="#0984e3"
              fill="#0984e3"
              fillOpacity={0.4}
            />
            <Radar
              name={condB?.specimen || "Condition B"}
              dataKey={condB?.specimen || "Condition B"}
              stroke="#00b894"
              fill="#00b894"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="compare-verdict-box">
        <span className="verdict-title">Automated Engineering Verdict:</span>
        <p>{generateVerdict()}</p>
      </div>

      <footer className="modal-footer" style={{ marginTop: "20px" }}>
        <div />
        <button className="primary-button" onClick={onClose}>
          Done
        </button>
      </footer>
    </Modal>
  );
};
