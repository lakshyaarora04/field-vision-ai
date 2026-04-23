import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Film, Loader2 } from "lucide-react";

interface VideoUploadProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
  progressMessage?: string;
  progressPercentage?: number;
}

export function VideoUpload({ onFileSelected, isAnalyzing, progressMessage, progressPercentage }: VideoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("video/")) {
        setFileName(file.name);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        dragOver
          ? "border-primary bg-primary/5 box-glow"
          : "border-border hover:border-primary/50"
      } ${isAnalyzing ? "pointer-events-none opacity-60" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {isAnalyzing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-heading text-lg text-primary text-glow">
            {progressMessage || "Analyzing Match Footage..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {progressMessage ? "" : `AI is processing frames from ${fileName}`}
          </p>
          <div className="mx-auto mt-2 h-1 w-48 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage || 0}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-4">
          <div className="rounded-full bg-secondary p-4">
            {fileName ? (
              <Film className="h-10 w-10 text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-heading text-lg text-foreground">
              {fileName || "Upload Match Footage"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag & drop or click to select a .mp4 file
            </p>
          </div>
          <input
            type="file"
            accept="video/mp4,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
    </motion.div>
  );
}
