import { motion } from "framer-motion";
import type { PlayerStats } from "@/lib/matchAnalysis";

interface PlayerTableProps {
  players: PlayerStats[];
}

function getFatigueColor(level: number) {
  if (level < 40) return "text-success";
  if (level < 70) return "text-warning";
  return "text-destructive";
}

function getFatigueBar(level: number) {
  if (level < 40) return "bg-success";
  if (level < 70) return "bg-warning";
  return "bg-destructive";
}

export function PlayerTable({ players }: PlayerTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <h3 className="mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">
        Player Analytics
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted-foreground">Player</th>
              <th className="pb-3 font-medium text-muted-foreground">Team</th>
              <th className="pb-3 font-medium text-muted-foreground">Fatigue</th>
              <th className="pb-3 font-medium text-muted-foreground">Activity</th>
              <th className="pb-3 font-medium text-muted-foreground">Sprints</th>
              <th className="pb-3 font-medium text-muted-foreground">Rating</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="border-b border-border/50"
              >
                <td className="py-3 font-medium text-foreground">
                  {p.identifier}
                </td>
                <td className="py-3 capitalize text-muted-foreground">
                  {p.team}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${getFatigueBar(p.fatigueLevel)}`}
                        style={{ width: `${p.fatigueLevel}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getFatigueColor(p.fatigueLevel)}`}>
                      {p.fatigueLevel}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-accent">{p.activityRate}%</td>
                <td className="py-3 text-foreground">{p.sprintCount}</td>
                <td className="py-3">
                  <span className="font-heading text-primary">
                    {p.performanceRating.toFixed(1)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
