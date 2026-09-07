import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { edsCompositionData } from "../timeseriesData";

interface EdsChartProps {
  selectedId?: string;
}

export const EdsChart: React.FC<EdsChartProps> = ({ selectedId }) => {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3>SEM/EDS Elemental Concentration Breakdown (wt%)</h3>
          <p>Quantification of Fe, Cr, Ni, and trace elements (Thermo Scientific Phenom 15 kV BSD)</p>
        </div>
        <span className="chart-badge">Elemental Chemistry</span>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={edsCompositionData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
            <XAxis dataKey="name" stroke="#636e72" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis
              unit="%"
              domain={[0, 90]}
              stroke="#636e72"
              tick={{ fontSize: 12 }}
              label={{ value: "Weight Concentration (wt%)", angle: -90, position: "insideLeft", offset: 10, fill: "#636e72", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [`${Number(value ?? 0).toFixed(2)} wt%`, String(name)]}
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
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <ReferenceLine
              y={12}
              stroke="#d63031"
              strokeDasharray="4 4"
              label={{ value: "12% Cr Passivity Threshold", fill: "#d63031", fontSize: 11, position: "insideTopRight" }}
            />
            <Bar dataKey="Cr" name="Chromium (Cr)" fill="#0984e3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Ni" name="Nickel (Ni)" fill="#00b894" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Fe" name="Iron (Fe)" fill="#636e72" opacity={0.6} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Trace" name="Trace / Impurities" fill="#e17055" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-caption chart-caption--alert">
        <strong>Critical Finding:</strong> Notice that in <b>GMAW 180 A</b>, Chromium plummets to <b>6.21 wt%</b>—far below the standard 12% threshold required to maintain a self-healing passive Cr₂O₃ protective layer. Meanwhile, <b>SMAW 170 A</b> exhibits 0.56% Cl and 0.37% Na entrapped within active pit crevices.
      </div>
    </div>
  );
};
