import React from 'react';
import { Attributes, Achievement } from '../types/app.types';
import { getExpForLevel, getProgressToNextLevel } from '../utils/calculations';
import AttributeCard from './AttributeCard';
import { getAvailableTitles } from '../utils/achievements';
import { ATTRIBUTE_CONFIG, ATTRIBUTE_KEYS } from '../types/attribute.types';

// 导入衰减配置
import { DECAY_CONFIG } from '../utils/achievements';

interface StatusPanelProps {
  attributes: Attributes;
  achievements: Achievement[];
  selectedTitles: string[];
  onTitleChange: (titleIds: string[]) => void;
}


function StatusPanel({ attributes, achievements, selectedTitles, onTitleChange }: StatusPanelProps) {
  // Get available titles
  const availableTitles = getAvailableTitles(achievements, attributes);

  // Handle title selection
  const handleTitleSelect = (titleId: string, attribute: string) => {
    const newSelectedTitles = [...selectedTitles];
    const titleIndex = newSelectedTitles.indexOf(titleId);
    const attributeTitles = newSelectedTitles.filter(id => 
      achievements.find(a => a.id === id)?.attributeRequirement === attribute
    );
    
    if (titleIndex >= 0) {
      // Remove title if already selected
      newSelectedTitles.splice(titleIndex, 1);
    } else {
      // Add title if not selected
      // For each attribute, we can have at most one title selected
      // Remove any existing title for this attribute
      attributeTitles.forEach(titleId => {
        const index = newSelectedTitles.indexOf(titleId);
        if (index >= 0) {
          newSelectedTitles.splice(index, 1);
        }
      });
      
      // Add the new title
      newSelectedTitles.push(titleId);
    }
    
    onTitleChange(newSelectedTitles);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">人生六项基本属性</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ATTRIBUTE_KEYS.map((key) => {
          const attr = attributes[key];
          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <AttributeCard 
                key={key} 
                attributeKey={key} 
                attribute={attr} 
              />
              
              {/* Title selection */}
              {availableTitles[key] && availableTitles[key].length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">称号选择</h4>
                  <div className="space-y-2">
                    {availableTitles[key].map(title => {
                      const isSelected = selectedTitles.includes(title.id);
                      return (
                        <div 
                          key={title.id}
                          className={`flex items-center p-2 rounded cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                          onClick={() => handleTitleSelect(title.id, key)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {title.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {title.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="ml-2 flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                已选中
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 周期触发事件 */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">周期触发事件</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-3">
            以下是你需要定期维护的属性，如果超过指定天数未进行相关活动，属性经验值将会衰减：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DECAY_CONFIG).map(([attrKey, config]) => (
              <div key={attrKey} className="flex items-start p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-lg mr-2">{ATTRIBUTE_CONFIG[attrKey as keyof Attributes].icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{ATTRIBUTE_CONFIG[attrKey as keyof Attributes].name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    超过 <span className="font-semibold text-gray-900">{config.inactiveThreshold}天</span> 未活动，每天衰减 <span className="font-semibold text-gray-900">{(config.decayRate * 100).toFixed(1)}%</span> 当前经验值
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-yellow-700">
            <p>💡 提示：定期进行各类活动可以保持你的属性值稳定增长，避免衰减。</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">属性说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ATTRIBUTE_KEYS.map((key) => {
            const config = ATTRIBUTE_CONFIG[key];
            return (
              <div key={key} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                  style={{ backgroundColor: config.color }}
                >
                  {config.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{config.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {/* We don't have descriptions in ATTRIBUTE_CONFIG, so we'll leave this empty for now */}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;