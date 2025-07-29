import React, { useState } from 'react';
import { Achievement, Attributes } from '../types/app.types';
import { calculateAchievementProgress } from '../utils/achievements';

interface AchievementSystemProps {
  achievements: Achievement[];
  attributes: Attributes;
  onTitleChange: (titleIds: string[]) => void;
  selectedTitles: string[];
}

function AchievementSystem({ achievements, attributes, onTitleChange, selectedTitles }: AchievementSystemProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked' | 'titles'>('all');
  
  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter(achievement => {
    switch (activeTab) {
      case 'unlocked':
        return achievement.unlockedAt !== null;
      case 'locked':
        return achievement.unlockedAt === null && !achievement.isTitle;
      case 'titles':
        return achievement.isTitle;
      default:
        return true;
    }
  });
  
  // Count achievements
  const builtInUnlockedCount = achievements.filter(a => a.unlockedAt && !a.isCustom).length;
  const builtInTotalCount = achievements.filter(a => !a.isCustom && !a.isTitle).length;
  const customUnlockedCount = achievements.filter(a => a.unlockedAt && a.isCustom).length;
  const customTotalCount = achievements.filter(a => a.isCustom).length;
  const lockedCount = achievements.filter(a => a.unlockedAt === null && !a.isTitle).length;
  const titleCount = achievements.filter(a => a.isTitle && a.unlockedAt).length;
  
  // Handle title selection
  const handleTitleSelect = (titleId: string) => {
    const newSelectedTitles = [...selectedTitles];
    const titleIndex = newSelectedTitles.indexOf(titleId);
    
    if (titleIndex >= 0) {
      // Remove title if already selected
      newSelectedTitles.splice(titleIndex, 1);
    } else {
      // Add title if not selected and we have less than 2 titles
      if (newSelectedTitles.length < 2) {
        newSelectedTitles.push(titleId);
      } else {
        // Replace the first title if we already have 2
        newSelectedTitles[0] = titleId;
      }
    }
    
    onTitleChange(newSelectedTitles);
  };
  
  // Get attribute name by key
  const getAttributeName = (attrKey: string) => {
    const attributeNames: Record<string, string> = {
      int: '智力',
      str: '体魄',
      vit: '精力',
      cha: '社交',
      eq: '情感',
      cre: '创造'
    };
    return attributeNames[attrKey] || attrKey;
  };
  
  // Get trigger condition description for custom achievements
  const getTriggerConditionDescription = (achievement: Achievement) => {
    if (!achievement.isCustom || !achievement.triggerType) return '';
    
    switch (achievement.triggerType) {
      case 'level':
        if (achievement.triggerCondition) {
          const [attr, level] = achievement.triggerCondition.split(':');
          return `当${getAttributeName(attr)}达到${level}级时解锁`;
        }
        return '';
      case 'events':
        return `记录${achievement.triggerCondition}个事件后解锁`;
      case 'keyword':
        return `记录包含关键词"${achievement.triggerCondition}"的事件后解锁`;
      case 'streak':
        return `连续${achievement.triggerCondition}天记录事件后解锁`;
      case 'manual':
        return '手动解锁的成就';
      default:
        return achievement.triggerCondition || '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">我的成就星碑</h2>
        <div className="text-sm text-gray-500">
          内置成就已解锁: {builtInUnlockedCount}/{builtInTotalCount} | 自我成就已解锁: {customUnlockedCount}/{customTotalCount}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{builtInUnlockedCount + customUnlockedCount}</div>
          <div className="text-sm text-gray-600">已解锁</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{lockedCount}</div>
          <div className="text-sm text-gray-600">未解锁</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{titleCount}</div>
          <div className="text-sm text-gray-600">称号</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {builtInTotalCount + customTotalCount > 0 ? Math.round(((builtInUnlockedCount + customUnlockedCount) / (builtInTotalCount + customTotalCount)) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">总完成度</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setActiveTab('unlocked')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'unlocked'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          已解锁
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'locked'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          未解锁
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'titles'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          称号
        </button>
      </div>
      
      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'titles' ? '暂无称号' : '暂无成就'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'locked' 
              ? '继续努力，解锁更多成就' 
              : activeTab === 'titles' 
                ? '提升属性等级以解锁称号' 
                : '开始记录事件以解锁成就'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map(achievement => {
            const progress = calculateAchievementProgress(achievement, attributes, []);
            const isTitleSelected = selectedTitles.includes(achievement.id);
            const isUnlocked = !!achievement.unlockedAt;
            const triggerConditionDescription = getTriggerConditionDescription(achievement);
            
            return (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  isUnlocked 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUnlocked 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {achievement.icon ? (
                      <div className={`icon-${achievement.icon}`} />
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${
                        isUnlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                        {achievement.isTitle && achievement.attributeRequirement && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            称号-{getAttributeName(achievement.attributeRequirement)}
                          </span>
                        )}
                        {achievement.isTitle && !achievement.attributeRequirement && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            称号
                          </span>
                        )}
                        {achievement.isCustom && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            自我成就
                          </span>
                        )}
                        {!achievement.isCustom && !achievement.isTitle && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            内置成就
                          </span>
                        )}
                        {!achievement.isCustom && achievement.isTitle && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            内置成就
                          </span>
                        )}
                      </h3>
                      {isUnlocked && achievement.isTitle && (
                        <button
                          onClick={() => handleTitleSelect(achievement.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            isTitleSelected
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {isTitleSelected ? '已选择' : '选择'}
                        </button>
                      )}
                    </div>
                    
                    <p className={`mt-1 text-sm ${
                      isUnlocked ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.isCustom && triggerConditionDescription && (
                      <p className="mt-1 text-xs text-gray-500">
                        触发条件: {triggerConditionDescription}
                      </p>
                    )}
                    
                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {isUnlocked && achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AchievementSystem;