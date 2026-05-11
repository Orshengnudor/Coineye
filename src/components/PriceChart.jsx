import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine,
} from "recharts";
import { useAppContext } from "./provider";

const CustomTooltip = ({ active, payload, label, formatTooltip }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4, fontSize: 10 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span>{p.name}</span>
          <span>{formatTooltip ? formatTooltip(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PriceChart({ data, height = 200, type = "area", color, color2, label = "Value", label2, loading, noGrid, refLine, formatY, formatTooltip }) {
  const { theme } = useAppContext();
  const chartColor = color ?? "var(--accent)";
  const gridColor = theme === "dark" ? "#222" : "#ccc";
  const axisColor = theme === "dark" ? "#444" : "#999";

  if (loading) {
    return (
      <div style={{ height, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
        Loading chart...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
        No chart data
      </div>
    );
  }

  const commonProps = { data, margin: { top: 8, right: 8, left: 0, bottom: 0 } };
  const xAxis = <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: axisColor }} axisLine={false} tickLine={false} minTickGap={40} />;
  const yAxis = (
    <YAxis
      tick={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: axisColor }}
      axisLine={false} tickLine={false} width={55}
      tickFormatter={formatY ?? ((v) => {
        if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
        if (v < 0.01) return `$${v.toExponential(1)}`;
        return `$${v.toFixed(2)}`;
      })}
    />
  );
  const grid = noGrid ? null : <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />;
  const tooltip = <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />;

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          {refLine !== undefined && <ReferenceLine y={refLine} stroke="var(--text-muted)" strokeDasharray="3 3" />}
          <Bar dataKey="value" fill={chartColor} name={label} radius={[2, 2, 0, 0]} />
          {label2 && <Bar dataKey="value2" fill={color2 ?? "var(--blue)"} name={label2} radius={[2, 2, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          {refLine !== undefined && <ReferenceLine y={refLine} stroke="var(--text-muted)" strokeDasharray="3 3" />}
          <Line type="monotone" dataKey="value" stroke={chartColor} name={label} strokeWidth={2} dot={false} />
          {label2 && <Line type="monotone" dataKey="value2" stroke={color2 ?? "var(--blue)"} name={label2} strokeWidth={2} dot={false} />}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
          {label2 && (
            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color2 ?? "var(--blue)"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color2 ?? "var(--blue)"} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        {grid}{xAxis}{yAxis}{tooltip}
        {refLine !== undefined && <ReferenceLine y={refLine} stroke="var(--text-muted)" strokeDasharray="3 3" />}
        <Area type="monotone" dataKey="value" stroke={chartColor} fill="url(#grad1)" name={label} strokeWidth={2} dot={false} />
        {label2 && <Area type="monotone" dataKey="value2" stroke={color2 ?? "var(--blue)"} fill="url(#grad2)" name={label2} strokeWidth={2} dot={false} />}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({ data, height = 40, positive }) {
  const color = positive === undefined ? "var(--accent)" : positive ? "var(--accent)" : "var(--red)";
  const chartData = data.map((v, i) => ({ time: i, value: v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
