export interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  colors: string[];
  defaultCode?: string;
  targetCode?: string;
  imageUrl?: string;
  description?: string;
  tips?: string[];
  targetChars?: number;
  isHidden?: boolean;
  stats?: {
    avgAccuracy: string;
    avgChars: number;
    topScore: number;
    totalSubmissions: number;
  };
}

// Database-only challenge functions - no more local storage or dummy data

export function getChallenge(id: string): Challenge | undefined {
  // This function is deprecated - use getChallengeAction from actions.ts
  console.warn("getChallenge from challenges.ts is deprecated. Use getChallengeAction from actions.ts");
  return undefined;
}

export function getAllChallenges(): Challenge[] {
  // This function is deprecated - use getChallengesAction from actions.ts
  console.warn("getAllChallenges from challenges.ts is deprecated. Use getChallengesAction from actions.ts");
  return [];
}
