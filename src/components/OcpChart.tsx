import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ocpTimeSeriesData } from "../timeseriesData";

interface OcpChartProps {
  selectedId?: string;
}

const SERIES_CONFIG: Record<string, { label: string; stroke: string; defaultWidth: number }> = {
  control: { label: "Control", stroke: "#a29bfe", defaultWidth: 2 },
  "smaw-160": { label: "SMAW 160 A", stroke: "#20bf6b", defaultWidth: 2 },
  "smaw-170": { label: "SMAW 170 A", stroke: "#0fb9b1", defaultWidth: 2 },
  "smaw-180": { label: "SMAW 180 A", stroke: "#2bcbba", defaultWidth: 2 },
  "gmaw-160": { label: "GMAW 160 A", stroke: "#fa8231", defaultWidth: 2 },
  "gmaw-170": { label: "GMAW 170 A", stroke: "#fc5c65", defaultWidth: 2 },
  "gmaw-180": { label: "GMAW 180 A", stroke: "#eb3b5a", defaultWidth: 2 },
};

export const OcpChart: React.FC<OcpChartProps> = ({ selectedId }) => {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3>28-Day Open-Circuit Potential (OCP) Curves</h3>
          <p>Electrochemical stability and passivity breakdown in 6% FeCl₃ over 28 days (mV vs. SCE)</p>
        </div>
        <span className="chart-badge">10 Immersion Checkpoints</span>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={ocpTimeSeriesData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
            <XAxis dataKey="label" stroke="#636e72" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[-650, 0]}
              unit=" mV"
              stroke="#636e72"
              tick={{ fontSize: 12 }}
              label={{ value: "mV vs. SCE", angle: -90, position: "insideLeft", offset: 10, fill: "#636e72", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} mV vs. SCE`,
                SERIES_CONFIG[String(name)]?.label || String(name),
              ]}
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
            <Legend
              formatter={(value: string) => (
                <span style={{ fontSize: "12px", color: "#2d3436", fontWeight: value === selectedId ? 700 : 500 }}>
                  {SERIES_CONFIG[value]?.label || value}
                </span>
              )}
            />
            <ReferenceLine
              y={-400}
              label={{ value: "Active Dissolution Boundary (-400 mV)", fill: "#d63031", fontSize: 11, position: "insideBottomRight" }}
              stroke="#d63031"
              strokeDasharray="4 4"
            />
            {Object.entries(SERIES_CONFIG).map(([key, config]) => {
              const isSelected = selectedId === key;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={config.stroke}
                  strokeWidth={isSelected ? 4 : config.defaultWidth}
                  strokeOpacity={selectedId && !isSelected ? 0.35 : 1}
                  dot={{ r: isSelected ? 5 : 3, fill: config.stroke }}
                  activeDot={{ r: 7 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-caption">
        <span className="caption-dot" style={{ backgroundColor: "#20bf6b" }} />
        <span><b>SMAW (Upper Cluster, -80 to -260 mV):</b> Retained semi-passive protective film throughout.</span>
        <span className="caption-dot" style={{ backgroundColor: "#eb3b5a", marginLeft: "12px" }} />
        <span><b>GMAW (Lower Cluster, -290 to -595 mV):</b> Rapid passivity collapse into active pitting corrosion.</span>
      </div>
    </div>
  );
};
