import React from 'react';
import { Attributes, Achievement, AttributeConfig } from '../types/app.types.ts';

interface StatsOverviewProps {
  attributes: Attributes;
  achievements: Achievement[];
}

function StatsOverview({ attributes, achievements }: StatsOverviewProps) {
  try {
    const levels = Object.values(attributes).map(attr => attr.level);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const totalLevel = Math.max(Math.floor(avgLevel), Math.floor(avgLevel * 1.2)); // At least floor(avgLevel), bonus for balance
    const totalExp = Object.values(attributes).reduce((sum, attr) => sum + attr.exp, 0);
    const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

    const attributeConfig: Record<string, AttributeConfig> = {
      int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
      str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
      vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
      cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
      eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
      cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
    };

    // Simple radar chart visualization using CSS
    const maxLevel = Math.max(...Object.values(attributes).map(attr => attr.level), 5);
    
    return (
      <div className="card" data-name="stats-overview" data-file="components/StatsOverview.js">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">总体概览</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">总等级</span>
                <span className="text-2xl font-bold text-[var(--primary-color)]">{totalLevel}</span>
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
                <span className="text-[var(--text-secondary)]">已获成就</span>
                <span className="text-xl font-semibold text-yellow-600">{unlockedAchievements}</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">能力雷达图</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(attributes).map(([key, attr]) => {
                const config = attributeConfig[key];
                const percentage = (attr.level / maxLevel) * 100;
                
                return (
                  <div key={key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                      <div 
                        className="absolute inset-0 rounded-full transition-all duration-500"
                        style={{
                          background: `conic-gradient(${config.color} ${percentage}%, transparent ${percentage}%)`
                        }}
                      ></div>
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color: config.color }}>
                          {attr.level}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[var(--text-secondary)]">
                      {config.name}
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