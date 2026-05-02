/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays } from "date-fns";

interface DayData {
  date: string;
  amount: number;
}

interface WeeklyStatsProps {
  data: DayData[];
  goal: number;
}

export default function WeeklyStats({ data, goal }: WeeklyStatsProps) {
  const chartData = data.slice(-7).map(item => ({
    name: format(new Date(item.date), "EEE"),
    amount: item.amount,
  }));

  return (
    <div className="w-full h-48 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
      <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">
        Last 7 Days
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ 
              backgroundColor: "rgba(15, 23, 42, 0.9)", 
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff"
            }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.amount >= goal ? "#60a5fa" : "#3b82f640"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
