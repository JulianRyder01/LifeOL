import React, { useState } from 'react';
import { Event } from '../types/app.types';

interface AttributeConfig {
  name: string;
  icon: string;
  color: string;
}

interface EventManagerProps {
  events: Event[];
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (id: string, updatedEvent: Partial<Event>) => void;
}

function EventManager({ events, onDeleteEvent, onUpdateEvent }: EventManagerProps) {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  
  const attributeConfig: Record<string, AttributeConfig> = {
    int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
    str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
    vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
    cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
    eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const startEditing = (event: Event) => {
    setEditingEventId(event.id);
    setEditForm({ ...event });
  };

  const saveEdit = () => {
    if (editingEventId) {
      onUpdateEvent(editingEventId, editForm);
      setEditingEventId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setEditForm({});
  };

  // Group events by date
  const groupEventsByDate = () => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.timestamp).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    // Sort by date descending
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  };

  const groupedEvents = groupEventsByDate();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">事件管理</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无事件</h3>
          <p className="mt-1 text-sm text-gray-500">记录你的第一个事件开始人生冒险</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(([date, dateEvents]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                {formatDate(date)}
              </h3>
              <div className="space-y-4">
                {dateEvents.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {editingEventId === event.id ? (
                      // Edit mode
                      <div>
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full font-medium text-gray-900 mb-2 p-2 border border-gray-300 rounded"
                          placeholder="事件标题"
                        />
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full text-sm text-gray-500 mb-3 p-2 border border-gray-300 rounded"
                          placeholder="事件描述"
                          rows={2}
                        />
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(attributeConfig).map(([attrKey, config]) => {
                            const expValue = (editForm.expGains?.[attrKey] as number) || 0;
                            return (
                              <div 
                                key={attrKey} 
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${config.color}15`,
                                  color: config.color 
                                }}
                              >
                                <div className={`icon-${config.icon} text-xs`}></div>
                                <input
                                  type="number"
                                  value={expValue}
                                  onChange={(e) => {
                                    const newExpGains = {
                                      ...editForm.expGains,
                                      [attrKey]: parseInt(e.target.value) || 0
                                    };
                                    setEditForm({...editForm, expGains: newExpGains});
                                  }}
                                  className="w-12 text-xs border-none bg-transparent"
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            取消
                          </button>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 flex-1">{event.title}</h3>
                          <span className="text-xs text-gray-500 ml-2">{formatTime(event.timestamp)}</span>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(event.expGains)
                            .filter(([_, exp]) => exp > 0)
                            .map(([attr, exp]) => (
                              <div
                                key={attr}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${attributeConfig[attr].color}15`,
                                  color: attributeConfig[attr].color 
                                }}
                              >
                                <div className={`icon-${attributeConfig[attr].icon} text-xs`}></div>
                                <span>+{exp}</span>
                              </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEditing(event)}
                            className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => onDeleteEvent(event.id)}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventManager;