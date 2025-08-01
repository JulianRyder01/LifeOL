import { Achievement as BaseAchievement } from '../../types/app.types';

// Extend or refine the base Achievement type if needed
export interface Achievement extends BaseAchievement {
  // Add any achievement-specific properties here if needed
}

// Achievement filter options
export type AchievementFilter = 'all' | 'unlocked' | 'locked';

// Achievement category
export type AchievementCategory = 'achievement' | 'title' | 'badge';