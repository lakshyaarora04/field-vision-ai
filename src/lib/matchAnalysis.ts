import { supabase } from "@/integrations/supabase/client";

export interface MatchAnalytics {
  teamAnalysis: {
    homeTeam: TeamStats;
    awayTeam: TeamStats;
  };
  playerAnalysis: PlayerStats[];
  matchMomentum: MomentumPoint[];
  keyEvents: KeyEvent[];
  predictions: Predictions;
  tacticalSuggestions: TacticalSuggestion[];
  overallMatchRating: number;
  matchPhase: string;
  intensity: number;
}

export interface TeamStats {
  name: string;
  possessionRate: number;
  passAccuracy: number;
  pressingIntensity: number;
  formationDetected: string;
  attackingThird: number;
  defensiveStrength: number;
}

export interface PlayerStats {
  identifier: string;
  team: string;
  fatigueLevel: number;
  activityRate: number;
  positionHeatzone: string;
  sprintCount: number;
  performanceRating: number;
}

export interface MomentumPoint {
  minute: number;
  homeTeamMomentum: number;
  awayTeamMomentum: number;
}

export interface KeyEvent {
  description: string;
  timestamp: string;
  significance: string;
}

export interface Predictions {
  likelyScoreline: string;
  winProbability: { home: number; away: number; draw: number };
  nextGoalTeam: string;
  expectedGoals: { home: number; away: number };
}

export interface TacticalSuggestion {
  team: string;
  suggestion: string;
  priority: string;
  expectedImpact: string;
}

function isMatchFrame(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const totalPixels = canvas.width * canvas.height;
  let greenPixels = 0;
  let nonGreenNonWhite = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (g > 60 && g > r * 1.15 && g > b * 1.1) greenPixels++;
    else if (!(r > 200 && g > 200 && b > 200) && !(r < 30 && g < 30 && b < 30)) nonGreenNonWhite++;
  }

  const sampleRatio = 16;
  const greenRate = (greenPixels * sampleRatio) / totalPixels;
  const playerRate = (nonGreenNonWhite * sampleRatio) / totalPixels;

  return greenRate > 0.15 && playerRate > 0.05;
}

interface ExtractedFrame {
  url: string;
  timestamp: number;
}

export async function extractAllFrames(file: File, intervalSeconds: number = 10, maxFramesLimit: number = 100): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    const allFrames: ExtractedFrame[] = [];
    let currentTime = 0;
    
    video.onloadedmetadata = () => {
      const duration = video.duration || 30;
      currentTime = intervalSeconds;
      video.currentTime = currentTime;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      // slightly lower resolution to save base64 payload size
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (isMatchFrame(canvas)) {
        // High compression JPEG
        allFrames.push({
          url: canvas.toDataURL("image/jpeg", 0.6),
          timestamp: currentTime
        });
      }

      currentTime += intervalSeconds;
      if (currentTime < video.duration && allFrames.length < maxFramesLimit) {
        video.currentTime = currentTime;
      } else {
        URL.revokeObjectURL(url);
        resolve(allFrames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };
  });
}

export async function analyzeMatch(
  frames: string[],
  videoInfo: { duration?: number; name?: string; chunkIndex?: number; totalChunks?: number }
): Promise<MatchAnalytics> {
  const { data, error } = await supabase.functions.invoke("analyze-match", {
    body: { frames, videoInfo },
  });

  if (error) throw new Error(error.message || "Analysis failed");
  if (data?.error) throw new Error(data.error);
  return data.analytics;
}

export function aggregateAnalytics(chunks: MatchAnalytics[]): MatchAnalytics {
  if (chunks.length === 0) throw new Error("No analytics to merge");
  if (chunks.length === 1) return chunks[0];

  const result = JSON.parse(JSON.stringify(chunks[0])) as MatchAnalytics;
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    result.teamAnalysis.homeTeam.possessionRate += chunk.teamAnalysis.homeTeam.possessionRate;
    result.teamAnalysis.homeTeam.passAccuracy += chunk.teamAnalysis.homeTeam.passAccuracy;
    result.teamAnalysis.homeTeam.pressingIntensity += chunk.teamAnalysis.homeTeam.pressingIntensity;
    result.teamAnalysis.homeTeam.attackingThird += chunk.teamAnalysis.homeTeam.attackingThird;
    result.teamAnalysis.homeTeam.defensiveStrength += chunk.teamAnalysis.homeTeam.defensiveStrength;
    
    result.teamAnalysis.awayTeam.possessionRate += chunk.teamAnalysis.awayTeam.possessionRate;
    result.teamAnalysis.awayTeam.passAccuracy += chunk.teamAnalysis.awayTeam.passAccuracy;
    result.teamAnalysis.awayTeam.pressingIntensity += chunk.teamAnalysis.awayTeam.pressingIntensity;
    result.teamAnalysis.awayTeam.attackingThird += chunk.teamAnalysis.awayTeam.attackingThird;
    result.teamAnalysis.awayTeam.defensiveStrength += chunk.teamAnalysis.awayTeam.defensiveStrength;
    
    result.overallMatchRating += chunk.overallMatchRating;
    result.intensity += chunk.intensity;

    result.keyEvents = [...result.keyEvents, ...chunk.keyEvents];
    result.matchMomentum = [...result.matchMomentum, ...chunk.matchMomentum];
    
    // Take a mix of suggestions, deduplication is complex so we'll just take the top 6
    const allSuggestions = [...result.tacticalSuggestions, ...chunk.tacticalSuggestions];
    result.tacticalSuggestions = allSuggestions.slice(0, 6);
    
    // Keep most recent predictions & formats
    result.predictions = chunk.predictions;
    result.matchPhase = chunk.matchPhase;
    // For players, we can just display the average or the latest snapshot. Latest is easiest.
    if (chunk.playerAnalysis && chunk.playerAnalysis.length > 0) {
      result.playerAnalysis = chunk.playerAnalysis;
    }
  }

  const n = chunks.length;
  const h = result.teamAnalysis.homeTeam;
  const a = result.teamAnalysis.awayTeam;

  h.possessionRate = Math.round(h.possessionRate / n);
  h.passAccuracy = Math.round(h.passAccuracy / n);
  h.pressingIntensity = Math.round(h.pressingIntensity / n);
  h.attackingThird = Math.round(h.attackingThird / n);
  h.defensiveStrength = Math.round(h.defensiveStrength / n);

  a.possessionRate = Math.round(a.possessionRate / n);
  a.passAccuracy = Math.round(a.passAccuracy / n);
  a.pressingIntensity = Math.round(a.pressingIntensity / n);
  a.attackingThird = Math.round(a.attackingThird / n);
  a.defensiveStrength = Math.round(a.defensiveStrength / n);

  result.overallMatchRating = Math.round((result.overallMatchRating / n) * 10) / 10;
  result.intensity = Math.round(result.intensity / n);

  // Normalize possession sum to 100
  const totalPos = h.possessionRate + a.possessionRate;
  if (totalPos > 0) {
    h.possessionRate = Math.round((h.possessionRate / totalPos) * 100);
    a.possessionRate = Math.round((a.possessionRate / totalPos) * 100);
  }

  // Sort timeline arrays
  result.keyEvents.sort((x, y) => {
    const t1 = parseInt(x.timestamp) || 0;
    const t2 = parseInt(y.timestamp) || 0;
    return t1 - t2;
  });

  result.matchMomentum.sort((x, y) => x.minute - y.minute);

  return result;
}

export async function processMatchInChunks(
  file: File,
  onProgress: (message: string, progress: number) => void,
  onPartialUpdate?: (analytics: MatchAnalytics, allFrames: string[]) => void
): Promise<{ analytics: MatchAnalytics; frames: string[] }> {
  
  onProgress("Extracting frames spanning full match...", 5);
  // Extract 1 frame every 15 seconds. Max 60 frames to be safe with memory
  const framesData = await extractAllFrames(file, 15, 60);
  
  if (framesData.length === 0) {
    throw new Error("Could not find suitable match footage in video");
  }

  const allFrames = framesData.map(f => f.url);
  
  // Group frames into chunks of 5
  const chunkSize = 5;
  const chunks: string[][] = [];
  for (let i = 0; i < allFrames.length; i += chunkSize) {
    chunks.push(allFrames.slice(i, i + chunkSize));
  }

  const totalChunks = chunks.length;
  const analyticsChunks: MatchAnalytics[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkMs = Math.round(15 + (i / totalChunks) * 80);
    onProgress(`Analyzing segment ${i + 1} of ${totalChunks}...`, chunkMs);
    
    try {
      const chunkResult = await analyzeMatch(chunks[i], {
        name: file.name,
        chunkIndex: i + 1,
        totalChunks: totalChunks
      });
      analyticsChunks.push(chunkResult);
      
      // Update UI incrementally if possible
      if (onPartialUpdate && analyticsChunks.length > 0) {
        onPartialUpdate(aggregateAnalytics(analyticsChunks), allFrames);
      }
    } catch (e) {
      console.warn(`Chunk ${i+1} failed to analyze:`, e);
      // We can continue with other chunks even if one fails
    }
  }

  if (analyticsChunks.length === 0) {
    throw new Error("AI analysis failed on all video segments");
  }

  onProgress("Finalizing aggregated timeline...", 98);
  const finalAnalytics = aggregateAnalytics(analyticsChunks);
  
  return { analytics: finalAnalytics, frames: allFrames };
}
