import React from 'react';
import { Attributes, AttributeConfig, Achievement } from '../types/app.types';
import { getExpForLevel, getProgressToNextLevel } from '../utils/calculations';
import AttributeCard from './AttributeCard';
import { getAvailableTitles } from '../utils/achievements';

interface StatusPanelProps {
  attributes: Attributes;
  achievements: Achievement[];
  selectedTitles: string[];
  onTitleChange: (titleIds: string[]) => void;
}

function StatusPanel({ attributes, achievements, selectedTitles, onTitleChange }: StatusPanelProps) {
  const attributeConfig: Record<string, AttributeConfig> = {
    int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
    str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
    vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
    cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
    eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
    cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
  };

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
        {Object.entries(attributes).map(([key, attr]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <AttributeCard 
              key={key} 
              attributeKey={key} 
              attribute={attr} 
            />
            
            {/* Title selection */}
            {availableTitles[key].length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">称号选择</h4>
                <div className="space-y-2">
                  {availableTitles[key].map(title => {
                    const isSelected = selectedTitles.includes(title.id);
                    return (
                      <div 
                        key={title.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleTitleSelect(title.id, key)}
                      >
                        <span className="text-sm">{title.title}</span>
                        {isSelected && (
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">属性说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(attributeConfig).map(([key, config]) => (
            <div key={key} className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                style={{ backgroundColor: config.color }}
              >
                {config.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{config.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {key === 'int' && '学习能力、逻辑思维、知识积累'}
                  {key === 'str' && '身体素质、运动能力、耐力'}
                  {key === 'vit' && '精神状态、活力、专注力'}
                  {key === 'cha' && '人际关系、沟通能力、领导力'}
                  {key === 'eq' && '情绪管理、同理心、自我认知'}
                  {key === 'cre' && '创新能力、艺术表达、想象力'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;