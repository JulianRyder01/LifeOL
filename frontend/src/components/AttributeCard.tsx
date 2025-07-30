import React from 'react';
import { Attribute } from '../types/app.types';
import { getExpForLevel } from '../utils/calculations';

interface AttributeCardProps {
  attributeKey: string;
  attribute: Attribute;
}

interface AttributeIconConfig {
  name: string;
  icon: string;
  color: string;
}

function AttributeCard({ attributeKey, attribute }: AttributeCardProps) {
  try {
    const attributeConfig: Record<string, AttributeIconConfig> = {
      int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
      str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
      vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
      cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
      eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
      cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
    };

    const config = attributeConfig[attributeKey];
    const expForNextLevel = getExpForLevel(attribute.level + 1);
    const expForCurrentLevel = getExpForLevel(attribute.level);
    const progressPercent = ((attribute.exp - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100;

    return (
      <div className="card attribute-card" data-name="attribute-card" data-file="components/AttributeCard.js">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center relative"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <div 
                className={`icon-${config.icon} text-xl`}
                style={{ color: config.color }}
              >
                {/* Icon content would go here if using icon fonts */}
              </div>
              <div 
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: config.color }}
              >
                {attribute.level}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">{config.name}</h3>
              <p className="text-lg font-bold" style={{ color: config.color }}>
                Lv.{attribute.level}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: config.color }}>
              {attribute.exp}
            </div>
            <div className="text-xs text-[var(--text-muted)]">EXP</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">距下一级</span>
            <span className="text-[var(--text-secondary)]">
              {attribute.exp - expForCurrentLevel} / {expForNextLevel - expForCurrentLevel} EXP
            </span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: config.color 
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AttributeCard component error:', error);
    return null;
  }
}

export default AttributeCard;