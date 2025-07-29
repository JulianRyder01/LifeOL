// Experience and level calculation utilities

// Calculate required EXP for a given level
function getExpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Exponential growth: level^2.2 * 100
  return Math.floor(Math.pow(level - 1, 2.2) * 100);
}

// Calculate level based on current EXP
function calculateLevel(exp: number): number {
  if (exp <= 0) return 1;
  
  let level = 1;
  while (getExpForLevel(level + 1) <= exp) {
    level++;
  }
  return level;
}

// Calculate progress percentage to next level
function getProgressToNextLevel(exp: number, currentLevel: number): number {
  const currentLevelExp = getExpForLevel(currentLevel);
  const nextLevelExp = getExpForLevel(currentLevel + 1);
  
  if (nextLevelExp === currentLevelExp) return 100;
  
  const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  return Math.max(0, Math.min(100, progress));
}

// Get EXP needed for next level
function getExpToNextLevel(exp: number, currentLevel: number): number {
  const nextLevelExp = getExpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelExp - exp);
}

export { getExpForLevel, calculateLevel, getProgressToNextLevel, getExpToNextLevel };