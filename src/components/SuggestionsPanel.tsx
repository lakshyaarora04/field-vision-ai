import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Target } from "lucide-react";
import type { TacticalSuggestion } from "@/lib/matchAnalysis";

interface SuggestionsPanelProps {
  suggestions: TacticalSuggestion[];
}

const priorityIcon = {
  high: <AlertTriangle className="h-4 w-4" />,
  medium: <Target className="h-4 w-4" />,
  low: <Lightbulb className="h-4 w-4" />,
};

const priorityColor = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-primary/30 bg-primary/5",
};

const priorityText = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-primary",
};

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <h3 className="mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">
        Tactical Suggestions
      </h3>
      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const p = s.priority as "high" | "medium" | "low";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className={`rounded-lg border p-3 ${priorityColor[p] || priorityColor.low}`}
            >
              <div className="flex items-start gap-2">
                <span className={priorityText[p] || priorityText.low}>
                  {priorityIcon[p] || priorityIcon.low}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize text-muted-foreground">
                      {s.team}
                    </span>
                    <span className={`text-xs font-bold uppercase ${priorityText[p] || priorityText.low}`}>
                      {s.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{s.suggestion}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Impact: {s.expectedImpact}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
