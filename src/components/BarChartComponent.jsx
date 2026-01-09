import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function BarChartComponent({ data }) {
  const formattedData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formattedData}>
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} /> 
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.7} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip 
          contentStyle={{
            borderRadius: "10px",
            padding: "8px 12px",
            borderColor: "#dbeafe"
          }}
        />

        {/* Blue Gradient Bar */}
        <Bar dataKey="value" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
