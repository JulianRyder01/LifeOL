import { useState, useEffect } from 'react';
import { Achievement } from '../../types/app.types';
import { loadAchievements, getInitialAchievements, saveAchievements } from '../../utils/storage';
import { checkAchievements as checkAchievementsUtil } from '../../utils/achievements';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return loadAchievements() || getInitialAchievements();
  });

  useEffect(() => {
    saveAchievements(achievements);
  }, [achievements]);

  const checkAchievements = (
    updatedAttributes: any, 
    events: any[], 
    currentAchievements: Achievement[]
  ) => {
    return checkAchievementsUtil(updatedAttributes, events, currentAchievements);
  };

  const addCustomAchievement = (achievementData: Partial<Achievement>) => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: achievementData.title || '自定义成就',
      description: achievementData.description || '',
      icon: achievementData.icon || '🏆',
      isCustom: true,
      unlockedAt: null,
      triggerType: achievementData.triggerType,
      triggerCondition: achievementData.triggerCondition,
      progress: achievementData.progress,
      target: achievementData.target,
      isTitle: achievementData.isTitle || false,
      attributeRequirement: achievementData.attributeRequirement,
      levelRequirement: achievementData.levelRequirement,
      ...(achievementData as any).useMarkdown !== undefined && { useMarkdown: (achievementData as any).useMarkdown }
    };
    
    setAchievements(prev => [...prev, newAchievement]);
  };

  const addCustomTitle = (titleData: Partial<Achievement>) => {
    const newTitle: Achievement = {
      id: Date.now().toString(),
      title: titleData.title || '自定义称号',
      description: titleData.description || '',
      icon: titleData.icon || '🥇',
      isCustom: true,
      isTitle: true,
      unlockedAt: null,
      triggerType: titleData.triggerType || 'level',
      triggerCondition: titleData.triggerCondition,
      progress: titleData.progress,
      target: titleData.target,
      attributeRequirement: titleData.attributeRequirement,
      levelRequirement: titleData.levelRequirement,
      ...(titleData as any).useMarkdown !== undefined && { useMarkdown: (titleData as any).useMarkdown }
    };
    
    setAchievements(prev => [...prev, newTitle]);
  };

  const addCustomBadge = (badgeData: Partial<Achievement>) => {
    const newBadge: Achievement = {
      id: Date.now().toString(),
      title: badgeData.title || '自定义徽章',
      description: badgeData.description || '',
      icon: badgeData.icon || '🎖️',
      isCustom: true,
      isTitle: false,
      unlockedAt: null,
      triggerType: badgeData.triggerType,
      triggerCondition: badgeData.triggerCondition,
      progress: badgeData.progress,
      target: badgeData.target,
      attributeRequirement: badgeData.attributeRequirement,
      levelRequirement: badgeData.levelRequirement,
      ...(badgeData as any).useMarkdown !== undefined && { useMarkdown: (badgeData as any).useMarkdown }
    };
    
    setAchievements(prev => [...prev, newBadge]);
  };

  return {
    achievements,
    setAchievements,
    checkAchievements,
    addCustomAchievement,
    addCustomTitle,
    addCustomBadge
  };
};