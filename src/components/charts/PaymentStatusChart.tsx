"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Slice = { name: string; value: number; color: string };

export default function PaymentStatusChart({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <p className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Sin pagos registrados todavía.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
        <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
