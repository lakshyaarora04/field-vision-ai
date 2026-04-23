import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface AnalysisFramesProps {
  frames: string[];
}

export function AnalysisFrames({ frames }: AnalysisFramesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="card-gradient rounded-xl border border-border p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
          Analyzed Frames
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {frames.length} frames extracted
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {frames.map((frame, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="group relative overflow-hidden rounded-lg border border-border"
          >
            <img
              src={frame}
              alt={`Frame ${i + 1}`}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-1 left-1 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              Frame {i + 1}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
