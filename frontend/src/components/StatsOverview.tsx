import React from 'react';
import { Attributes, Achievement, AttributeConfig } from '../types/app.types';
import { getExpForLevel, getProgressToNextLevel } from '../utils/calculations';

interface StatsOverviewProps {
  attributes: Attributes;
  achievements: Achievement[];
  projectEvents?: any[]; // Add projectEvents to count completed tasks
  events?: any[]; // Add events to count experiences
}

function StatsOverview({ attributes, achievements, projectEvents = [], events = [] }: StatsOverviewProps) {
  try {
    const levels = Object.values(attributes).map(attr => attr.level);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    
    // 计算调和平均数
    const harmonicMean = levels.length / levels.reduce((sum, level) => sum + (1 / level), 0);
    const totalLevel = Math.floor(harmonicMean);
    
    const totalExp = Object.values(attributes).reduce((sum, attr) => sum + attr.exp, 0);
    const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
    
    // Count completed tasks (projectEvents with progress >= 100 or with completedAt)
    const completedTasks = projectEvents.filter(event => 
      event.completedAt || event.progress >= 100
    ).length;
    
    // Count experiences (simply the number of events)
    const experienceCount = events.length;

    const attributeConfig: Record<string, AttributeConfig> = {
      int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
      str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
      vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
      cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
      eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
      cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
    };

    // Calculate next level EXP requirement for each attribute
    const getNextLevelExp = (currentLevel: number) => {
      // Using the same formula as in calculations.ts
      const baseExp = 100;
      const growthRate = 1.5;
      return Math.floor(baseExp * Math.pow(growthRate, currentLevel - 1));
    };

    // Simple radar chart visualization using CSS
    const maxLevel = Math.max(...Object.values(attributes).map(attr => attr.level), 5);
    
    return (
      <div className="card" data-name="stats-overview" data-file="components/StatsOverview.js">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">总体概览</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between group relative">
                <span className="text-[var(--text-secondary)] cursor-pointer">个人发展等级</span>
                <span className="text-2xl font-bold text-[var(--primary-color)] cursor-pointer">{totalLevel}</span>
                <div className="absolute left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-64 z-10 pointer-events-none">
                  综合考量个人属性的全面发展。个人发展等级是六大属性等级的调和平均数。
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">平均等级</span>
                <span className="text-xl font-semibold">{avgLevel.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">总经验</span>
                <span className="text-xl font-semibold">{totalExp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">已完成任务</span>
                <span className="text-xl font-semibold">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between group relative">
                <span className="text-[var(--text-secondary)] cursor-pointer">阅历</span>
                <span className="text-xl font-semibold cursor-pointer">{experienceCount}</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  记录过的事件数
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">已获成就</span>
                <span className="text-xl font-semibold text-yellow-600">{unlockedAchievements}</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-2">
                小提示：想要提升个人发展等级，就得全面提升、做六边形战士哦~
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">你的人生属性概览</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-4">
              {Object.entries(attributes).map(([key, attr]) => {
                const config = attributeConfig[key];
                const expPercentage = getProgressToNextLevel(attr.exp, attr.level);
                const nextLevelExp = getExpForLevel(attr.level + 1);
                const currentLevelExp = getExpForLevel(attr.level);
                const expToNext = nextLevelExp - currentLevelExp;
                const currentExpInLevel = attr.exp - currentLevelExp;
                
                return (
                  <div key={key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                      <div 
                        className="absolute inset-0 rounded-full transition-all duration-500"
                        style={{
                          background: `conic-gradient(${config.color} ${expPercentage}%, transparent ${expPercentage}%)`
                        }}
                      ></div>
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: config.color }}>
                          {attr.level}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[var(--text-secondary)]">
                      {config.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1 hidden sm:block">
                      {currentExpInLevel}/{expToNext} EXP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('StatsOverview component error:', error);
    return null;
  }
}

export default StatsOverview;