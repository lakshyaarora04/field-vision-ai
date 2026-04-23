import { motion } from "framer-motion";
import type { Predictions } from "@/lib/matchAnalysis";

interface PredictionsPanelProps {
  predictions: Predictions;
  homeTeam: string;
  awayTeam: string;
}

export function PredictionsPanel({
  predictions,
  homeTeam,
  awayTeam,
}: PredictionsPanelProps) {
  const { winProbability, likelyScoreline, nextGoalTeam, expectedGoals } = predictions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <h3 className="mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">
        AI Predictions
      </h3>

      <div className="space-y-5">
        {/* Score prediction */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Likely Scoreline</p>
          <p className="font-heading text-3xl font-bold text-primary text-glow">
            {likelyScoreline}
          </p>
        </div>

        {/* Win probability bar */}
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Win Probability</p>
          <div className="flex h-6 overflow-hidden rounded-lg">
            <div
              className="flex items-center justify-center bg-primary/80 text-xs font-bold text-primary-foreground"
              style={{ width: `${winProbability.home}%` }}
            >
              {winProbability.home > 10 && `${winProbability.home}%`}
            </div>
            <div
              className="flex items-center justify-center bg-muted text-xs font-medium text-muted-foreground"
              style={{ width: `${winProbability.draw}%` }}
            >
              {winProbability.draw > 10 && `${winProbability.draw}%`}
            </div>
            <div
              className="flex items-center justify-center bg-accent/80 text-xs font-bold text-accent-foreground"
              style={{ width: `${winProbability.away}%` }}
            >
              {winProbability.away > 10 && `${winProbability.away}%`}
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{homeTeam}</span>
            <span>Draw</span>
            <span>{awayTeam}</span>
          </div>
        </div>

        {/* Expected goals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-xs text-muted-foreground">xG {homeTeam}</p>
            <p className="font-heading text-xl font-bold text-primary">
              {expectedGoals.home.toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-xs text-muted-foreground">xG {awayTeam}</p>
            <p className="font-heading text-xl font-bold text-accent">
              {expectedGoals.away.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Next goal */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Next Goal Predicted For</p>
          <p className="font-heading text-sm font-bold text-primary">
            {nextGoalTeam}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
