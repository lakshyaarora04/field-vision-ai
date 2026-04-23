import { motion } from "framer-motion";
import type { TeamStats } from "@/lib/matchAnalysis";

interface TeamComparisonProps {
  home: TeamStats;
  away: TeamStats;
}

function ComparisonBar({
  label,
  homeVal,
  awayVal,
}: {
  label: string;
  homeVal: number;
  awayVal: number;
}) {
  const total = homeVal + awayVal || 1;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-primary">{homeVal}%</span>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-accent">{awayVal}%</span>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        <div
          className="rounded-l-full bg-primary"
          style={{ width: `${(homeVal / total) * 100}%` }}
        />
        <div
          className="rounded-r-full bg-accent"
          style={{ width: `${(awayVal / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function TeamComparison({ home, away }: TeamComparisonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-primary">{home.name}</span>
        <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
          vs
        </span>
        <span className="font-heading text-sm font-bold text-accent">{away.name}</span>
      </div>

      <div className="space-y-4">
        <ComparisonBar label="Possession" homeVal={home.possessionRate} awayVal={away.possessionRate} />
        <ComparisonBar label="Pass Accuracy" homeVal={home.passAccuracy} awayVal={away.passAccuracy} />
        <ComparisonBar label="Pressing" homeVal={home.pressingIntensity} awayVal={away.pressingIntensity} />
        <ComparisonBar label="Attacking" homeVal={home.attackingThird} awayVal={away.attackingThird} />
        <ComparisonBar label="Defense" homeVal={home.defensiveStrength} awayVal={away.defensiveStrength} />
      </div>

      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>Formation: {home.formationDetected}</span>
        <span>Formation: {away.formationDetected}</span>
      </div>
    </motion.div>
  );
}
