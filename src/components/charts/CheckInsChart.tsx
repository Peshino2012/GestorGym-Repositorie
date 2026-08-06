"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CHART_COLORS } from "@/lib/chartColors";

export default function CheckInsChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={24}
        />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
        <Bar dataKey="count" name="Ingresos" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
