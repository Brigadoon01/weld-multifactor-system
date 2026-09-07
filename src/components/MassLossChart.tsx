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
} from "recharts";
import { massLossTimeSeriesData } from "../timeseriesData";

interface MassLossChartProps {
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

export const MassLossChart: React.FC<MassLossChartProps> = ({ selectedId }) => {
  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3>28-Day Gravimetric Mass Loss (%) Progression</h3>
          <p>Cumulative % mass lost during immersion in 6% FeCl₃ aqueous solution</p>
        </div>
        <span className="chart-badge">Gravimetric Degradation</span>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={massLossTimeSeriesData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
            <XAxis dataKey="label" stroke="#636e72" tick={{ fontSize: 12 }} />
            <YAxis
              unit="%"
              domain={[0, 25]}
              stroke="#636e72"
              tick={{ fontSize: 12 }}
              label={{ value: "Cumulative Mass Loss (%)", angle: -90, position: "insideLeft", offset: 10, fill: "#636e72", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${Number(value ?? 0).toFixed(2)}%`,
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
        <span><b>Observation:</b> GMAW 160 A sustained the steepest initial attack (14.27% by Day 3, reaching 21.78% final mass loss). SMAW specimens plateaued earlier due to adherent corrosion products.</span>
      </div>
    </div>
  );
};
