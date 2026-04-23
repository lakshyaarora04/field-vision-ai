import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Target, Shield, Star, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VideoUpload } from "@/components/VideoUpload";
import { StatCard } from "@/components/StatCard";
import { MomentumChart } from "@/components/MomentumChart";
import { PlayerTable } from "@/components/PlayerTable";
import { PredictionsPanel } from "@/components/PredictionsPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { TeamComparison } from "@/components/TeamComparison";
import { AnalysisFrames } from "@/components/AnalysisFrames";
import {
  processMatchInChunks,
  type MatchAnalytics,
} from "@/lib/matchAnalysis";

export default function Index() {
  const [analytics, setAnalytics] = useState<MatchAnalytics | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setAnalytics(null);
    setFrames([]);
    setProgressMessage("Starting analysis...");
    setProgressPercentage(0);

    try {
      toast({ title: "Analyzing match...", description: "Chunking and AI processing started" });

      const result = await processMatchInChunks(
        file,
        (message, progress) => {
          setProgressMessage(message);
          setProgressPercentage(progress);
        },
        (partialAnalytics, currentFrames) => {
          setAnalytics(partialAnalytics);
          setFrames(currentFrames);
        }
      );

      setAnalytics(result.analytics);
      setFrames(result.frames);
      toast({ title: "Analysis complete!", description: "Dashboard updated with full match analytics" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold gradient-text">
                FootballAI
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-Time Match Analytics
              </p>
            </div>
          </div>
          {analytics && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse-glow rounded-full bg-primary" />
              <span className="text-xs text-primary">Analysis Active</span>
            </div>
          )}
        </div>
      </header>

      <main className="container py-8">
        {/* Upload Section */}
        <div className="mx-auto max-w-2xl">
          <VideoUpload 
            onFileSelected={handleFileSelected} 
            isAnalyzing={isAnalyzing} 
            progressMessage={progressMessage}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* Dashboard */}
        <AnimatePresence>
          {analytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-10 space-y-6"
            >
              {/* Analyzed Frames */}
              {frames.length > 0 && <AnalysisFrames frames={frames} />}

              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <StatCard
                  title="Match Rating"
                  value={`${analytics.overallMatchRating}/10`}
                  icon={<Star className="h-5 w-5" />}
                  color="primary"
                  delay={0.1}
                />
                <StatCard
                  title="Intensity"
                  value={`${analytics.intensity}%`}
                  icon={<Zap className="h-5 w-5" />}
                  color="warning"
                  delay={0.15}
                />
                <StatCard
                  title="Phase"
                  value={analytics.matchPhase}
                  icon={<Timer className="h-5 w-5" />}
                  color="accent"
                  delay={0.2}
                />
                <StatCard
                  title="Home Possession"
                  value={`${analytics.teamAnalysis.homeTeam.possessionRate}%`}
                  icon={<Target className="h-5 w-5" />}
                  color="primary"
                  delay={0.25}
                />
                <StatCard
                  title="Away Possession"
                  value={`${analytics.teamAnalysis.awayTeam.possessionRate}%`}
                  icon={<Target className="h-5 w-5" />}
                  color="accent"
                  delay={0.3}
                />
                <StatCard
                  title="Key Events"
                  value={analytics.keyEvents.length}
                  icon={<Shield className="h-5 w-5" />}
                  color="warning"
                  delay={0.35}
                />
              </div>

              {/* Team Comparison + Predictions */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TeamComparison
                    home={analytics.teamAnalysis.homeTeam}
                    away={analytics.teamAnalysis.awayTeam}
                  />
                </div>
                <PredictionsPanel
                  predictions={analytics.predictions}
                  homeTeam={analytics.teamAnalysis.homeTeam.name}
                  awayTeam={analytics.teamAnalysis.awayTeam.name}
                />
              </div>

              {/* Momentum Chart */}
              <MomentumChart
                data={analytics.matchMomentum}
                homeTeam={analytics.teamAnalysis.homeTeam.name}
                awayTeam={analytics.teamAnalysis.awayTeam.name}
              />

              {/* Player Table + Suggestions */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <PlayerTable players={analytics.playerAnalysis} />
                </div>
                <SuggestionsPanel suggestions={analytics.tacticalSuggestions} />
              </div>

              {/* Key Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card-gradient rounded-xl border border-border p-5"
              >
                <h3 className="mb-4 font-heading text-sm uppercase tracking-wider text-muted-foreground">
                  Key Events
                </h3>
                <div className="space-y-2">
                  {analytics.keyEvents.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          e.significance === "high"
                            ? "bg-destructive"
                            : e.significance === "medium"
                            ? "bg-warning"
                            : "bg-primary"
                        }`}
                      />
                      <span className="flex-1 text-sm text-foreground">
                        {e.description}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {e.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
