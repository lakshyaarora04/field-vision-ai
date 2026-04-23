import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: "primary" | "accent" | "warning" | "destructive";
  delay?: number;
}

const colorMap = {
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
  destructive: "text-destructive",
};

const bgMap = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className={`font-heading text-2xl font-bold ${colorMap[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${bgMap[color]}`}>
          <div className={colorMap[color]}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
