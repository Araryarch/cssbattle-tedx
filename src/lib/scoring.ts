export interface ScoreResult {
  chars: number;
  accuracy: number;
  score: number;
}

/**
 * Calculates the score based on character count and accuracy.
 * CSSBattle formula is roughly:
 * Score = [100 * (accuracy / 100) ^ 3] + [max(0, 200 - chars) / 2]
 * (This is a simplified version of their proprietary formula)
 */
export function calculateFinalScore(chars: number, accuracy: number, hintsUsed: number = 0, targetChars: number = 200): number {
  if (accuracy === 0) return 0;
  
  // Base score solely on accuracy (max 600 points)
  // Formula: 600 * (accuracy / 100)
  const baseScore = 600 * (accuracy / 100);

  // Bonus score for character count
  // Only applies if accuracy is very high (> 99.5%)
  // "Code Golf" mechanic: Fewer chars = Higher score
  let charBonus = 0;
  if (accuracy >= 99.5) {
     // If user beats or meets the target chars, they get full 400 bonus.
     // If they exceed target, bonus decays linearly.
     if (chars <= targetChars) {
        charBonus = 400;
     } else {
        charBonus = Math.max(0, 400 - (chars - targetChars));
     }
  }
  
  // Penalty for hints
  const hintPenalty = hintsUsed * 50;

  return Math.max(0, Math.round(baseScore + charBonus - hintPenalty));
}

/**
 * Compares two ImageData objects and returns accuracy as a percentage (0-100)
 * STRICT PIXEL MATCHING for layout and color accuracy.
 */
export function comparePixels(userImageData: ImageData, targetImageData: ImageData): number {
  const userPixels = userImageData.data;
  const targetPixels = targetImageData.data;
  
  if (userPixels.length !== targetPixels.length) return 0;
  
  const totalPixels = userPixels.length / 4;
  let matchingPixels = 0;
  
  // Iterate through EVERY pixel (stride of 4 for RGBA)
  // No sampling - every pixel mismatch counts against layout score
  for (let i = 0; i < userPixels.length; i += 4) {
    const r1 = userPixels[i];
    const g1 = userPixels[i + 1];
    const b1 = userPixels[i + 2];
    const a1 = userPixels[i + 3]; // Alpha impacts visibility too
    
    const r2 = targetPixels[i];
    const g2 = targetPixels[i + 1];
    const b2 = targetPixels[i + 2];
    const a2 = targetPixels[i + 3];
    
    // Strict equality check with very small tolerance for anti-aliasing differences
    // Using a small threshold squared (e.g., < 10) allows for minor browser rendering diffs
    // but ensures layout shapes are precise.
    const distanceSquared = 
      Math.pow(r1 - r2, 2) + 
      Math.pow(g1 - g2, 2) + 
      Math.pow(b1 - b2, 2) +
      Math.pow(a1 - a2, 2);
    
    // Threshold 0 means EXACT match. 
    // Threshold 5-10 allows tiny variations (e.g. gamma/color profile diffs).
    if (distanceSquared <= 10) {
      matchingPixels++;
    }
  }
  
  // Percentage of pixels that matched exactly
  return (matchingPixels / totalPixels) * 100;
}
