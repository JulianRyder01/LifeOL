import React from 'react';
import { Attributes, AttributeConfig } from '../types/app.types';
import { getExpForLevel, getProgressToNextLevel } from '../utils/calculations';
import AttributeCard from './AttributeCard';

interface StatusPanelProps {
  attributes: Attributes;
}

function StatusPanel({ attributes }: StatusPanelProps) {
  const attributeConfig: Record<string, AttributeConfig> = {
    int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
    str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
    vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
    cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
    eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
    cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">人生六项基本属性</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(attributes).map(([key, attr]) => (
          <AttributeCard 
            key={key} 
            attributeKey={key} 
            attribute={attr} 
          />
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