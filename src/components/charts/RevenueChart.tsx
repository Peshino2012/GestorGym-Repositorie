"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CHART_COLORS } from "@/lib/chartColors";
import { formatCurrency } from "@/lib/format";

export default function RevenueChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Ingresos"
          stroke={CHART_COLORS.success}
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
