import React from 'react';
import { Event } from '../../types/app.types';

interface AttributeConfig {
  name: string;
  icon: string;
  color: string;
}

interface EventListProps {
  events: Event[];
}

function EventList({ events }: EventListProps) {
  try {
    const attributeConfig: Record<string, AttributeConfig> = {
      int: { name: '智识', icon: 'book-open', color: 'var(--int-color)' },
      phy: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
      wil: { name: '意志', icon: 'battery', color: 'var(--vit-color)' },
      cha: { name: '魅力', icon: 'users', color: 'var(--cha-color)' },
      men: { name: '心境', icon: 'heart', color: 'var(--eq-color)' },
      cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
    };

    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return '刚刚';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return date.toLocaleDateString('zh-CN');
    };

    // Render description with optional markdown support
    const renderDescription = (description: string, useMarkdown: boolean = false) => {
      if (useMarkdown) {
        // Simple markdown rendering for basic formatting
        return (
          <div className="markdown-content">
            {description.split('\n').map((line, i) => (
              <p key={i} className="mb-2">
                {line
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>|<code>.*?<\/code>)/g)
                  .map((part, j) => {
                    if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                      return <strong key={j}>{part.slice(8, -9)}</strong>;
                    }
                    if (part.startsWith('<em>') && part.endsWith('</em>')) {
                      return <em key={j}>{part.slice(4, -5)}</em>;
                    }
                    if (part.startsWith('<code>') && part.endsWith('</code>')) {
                      return <code key={j}>{part.slice(6, -7)}</code>;
                    }
                    return part;
                  })
                }
              </p>
            ))}
          </div>
        );
      }
      return description;
    };

    return (
      <div className="card" data-name="event-list" data-file="components/EventList.js">
        <div className="flex items-center gap-2 mb-6">
          <div className="icon-clock text-lg text-[var(--primary-color)]"></div>
          <h2 className="text-lg font-semibold">最近活动</h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="icon-calendar text-4xl text-[var(--text-muted)] mb-4"></div>
            <p className="text-[var(--text-secondary)]">还没有记录任何事件</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">点击"记录事件"开始你的人生冒险吧！</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {events.slice(0, 10).map(event => (
              <div key={event.id} className="border border-[var(--border-color)] rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-[var(--text-primary)] flex-1">{event.title}</h3>
                  <span className="text-xs text-[var(--text-muted)] ml-2 whitespace-nowrap">{formatTime(event.timestamp)}</span>
                </div>
                
                {event.description && (
                  <div className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                    {renderDescription(event.description, (event as any).useMarkdown)}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {Object.entries(event.expGains)
                    .filter(([_, exp]) => (exp as number) > 0)
                    .map(([attr, exp]) => {
                      const config = attributeConfig[attr];
                      if (!config) return null;
                      return (
                      <div
                        key={attr}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                            backgroundColor: `${config.color}15`,
                            color: config.color 
                        }}
                      >
                          <div className={`icon-${config.icon} text-xs`}></div>
                        <span className="text-xs">+{exp as number}</span>
                      </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('EventList component error:', error);
    return null;
  }
}

export default EventList;