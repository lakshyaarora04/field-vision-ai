import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MomentumPoint } from "@/lib/matchAnalysis";

interface MomentumChartProps {
  data: MomentumPoint[];
  homeTeam: string;
  awayTeam: string;
}

export function MomentumChart({ data, homeTeam, awayTeam }: MomentumChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <h3 className="mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">
        Match Momentum
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis
            dataKey="minute"
            tick={{ fill: "hsl(215 12% 55%)", fontSize: 11 }}
            tickFormatter={(v) => `${v}'`}
          />
          <YAxis
            tick={{ fill: "hsl(215 12% 55%)", fontSize: 11 }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(220 18% 10%)",
              border: "1px solid hsl(220 15% 18%)",
              borderRadius: "8px",
              color: "hsl(210 20% 92%)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="homeTeamMomentum"
            name={homeTeam}
            stroke="hsl(160 100% 45%)"
            fill="hsl(160 100% 45% / 0.15)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="awayTeamMomentum"
            name={awayTeam}
            stroke="hsl(200 100% 50%)"
            fill="hsl(200 100% 50% / 0.15)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
