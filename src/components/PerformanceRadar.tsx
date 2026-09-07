import React from "react";
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

interface PerformanceRadarProps {
  selected: Experiment;
  selectedScore: ScoreResult;
  leader?: Experiment;
  leaderScore?: ScoreResult;
}

export const PerformanceRadar: React.FC<PerformanceRadarProps> = ({
  selected,
  selectedScore,
  leader,
  leaderScore,
}) => {
  const radarData = [
    {
      subject: "Corrosion Resistance",
      [selected.specimen]: Math.round(selectedScore.corrosion ?? 0),
      ...(leader && leader.id !== selected.id && leaderScore
        ? { [leader.specimen]: Math.round(leaderScore.corrosion ?? 0) }
        : {}),
      fullMark: 100,
    },
    {
      subject: "Hardness Homogeneity",
      [selected.specimen]: Math.round(selectedScore.hardness ?? 0),
      ...(leader && leader.id !== selected.id && leaderScore
        ? { [leader.specimen]: Math.round(leaderScore.hardness ?? 0) }
        : {}),
      fullMark: 100,
    },
    {
      subject: "Microstructural Quality",
      [selected.specimen]: Math.round(selectedScore.microstructure ?? 0),
      ...(leader && leader.id !== selected.id && leaderScore
        ? { [leader.specimen]: Math.round(leaderScore.microstructure ?? 0) }
        : {}),
      fullMark: 100,
    },
  ];

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3>Multi-Factor Performance Polygon</h3>
          <p>Tri-axial evaluation mapping Corrosion, Hardness, and Microstructure (0–100 scale)</p>
        </div>
        <span className="chart-badge">MCDA Trade-Off Analysis</span>
      </div>

      <div style={{ width: "100%", height: 320 }}>
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
              name={selected.specimen}
              dataKey={selected.specimen}
              stroke="#0984e3"
              fill="#0984e3"
              fillOpacity={0.45}
            />
            {leader && leader.id !== selected.id && (
              <Radar
                name={`${leader.specimen} (Top Ranked)`}
                dataKey={leader.specimen}
                stroke="#00b894"
                fill="#00b894"
                fillOpacity={0.25}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-caption">
        <span><b>Composite Insight:</b> A larger polygon surface represents a more balanced weldment. The leader ({leader?.specimen ?? "SMAW 170 A"}) demonstrates superior overall balance between corrosion resistance and microstructural integrity.</span>
      </div>
    </div>
  );
};
