import React, { useState } from 'react';
import { Event } from '../../types/app.types';

interface EventManagerProps {
  events: Event[];
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (id: string, event: Partial<Event>) => void;
  attributeNames?: Record<string, string>;
}

interface EditForm {
  id: string | null;
  title: string;
  description: string;
  expGains: Record<string, number>;
}

const attributeConfig: Record<string, { name: string; icon: string; color: string }> = {
  int: { name: '智识', icon: 'book-open', color: 'var(--int-color)' },
  phy: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
  wil: { name: '意志', icon: 'battery', color: 'var(--vit-color)' },
  cha: { name: '魅力', icon: 'users', color: 'var(--cha-color)' },
  men: { name: '心境', icon: 'heart', color: 'var(--eq-color)' },
  cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
};

function EventManager({ events, onDeleteEvent, onUpdateEvent, attributeNames = {} }: EventManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    id: null,
    title: '',
    description: '',
    expGains: {}
  });
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // Merge default attribute names with provided ones
  const mergedAttributeNames: Record<string, { name: string; icon: string; color: string } | string> = { ...attributeConfig, ...attributeNames };
  
  // 获取属性名称的辅助函数
  const getAttributeName = (attrKey: string) => {
    const attr = mergedAttributeNames[attrKey];
    if (typeof attr === 'string') {
      return attr;
    }
    return attr?.name || attrKey;
  };

  // Group events by year and month
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(event);
    
    return acc;
  }, {} as Record<number, Record<number, Event[]>>);

  const startEdit = (event: Event) => {
    setEditingId(event.id);
    setEditForm({
      id: event.id,
      title: event.title,
      description: event.description || '',
      expGains: event.expGains || {}
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      id: null,
      title: '',
      description: '',
      expGains: {}
    });
  };

  const saveEdit = () => {
    if (editForm.id) {
      onUpdateEvent(editForm.id, {
        title: editForm.title,
        description: editForm.description
      });
      cancelEdit();
    }
  };


  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const toggleYear = (year: number) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const getMonthName = (month: number) => {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                   '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[month];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">人生时间轴</h2>
      
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无事件</h3>
          <p className="mt-1 text-sm text-gray-500">开始记录你的人生事件吧</p>
        </div>
      ) : (
        <div>
          {Object.keys(groupedEvents)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map(year => {
              const yearNum = parseInt(year);
              const isYearExpanded = expandedYears[yearNum] ?? true;
              
              return (
                <div key={year} className="border-b border-gray-200 py-4">
                  <button
                    onClick={() => toggleYear(yearNum)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{year}年</h3>
                    <svg 
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${isYearExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isYearExpanded && (
                    <div className="mt-4 space-y-6">
                      {Object.keys(groupedEvents[yearNum])
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .map(month => {
                          const monthNum = parseInt(month);
                          const monthKey = `${yearNum}-${monthNum}`;
                          const isMonthExpanded = expandedMonths[monthKey] ?? true;
                          
                          return (
                            <div key={monthKey} className="ml-4">
                              <button
                                onClick={() => toggleMonth(monthKey)}
                                className="flex items-center text-left"
                              >
                                <h4 className="font-medium text-gray-700">{getMonthName(monthNum)}</h4>
                                <svg 
                                  className={`h-4 w-4 text-gray-500 ml-1 transform transition-transform ${isMonthExpanded ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {isMonthExpanded && (
                                <div className="mt-3 space-y-3 ml-4">
                                  {groupedEvents[yearNum][monthNum]
                                    .sort((a: Event, b: Event) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .map((event: Event) => (
                                      <div 
                                        key={event.id} 
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                      >
                                        {editingId === event.id ? (
                                          // Edit mode
                                          <div>
                                            <input
                                              type="text"
                                              value={editForm.title}
                                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                                            />
                                            <textarea
                                              value={editForm.description}
                                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                                              rows={2}
                                            />
                                            
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
                                                .filter(([_, exp]) => (exp as number) > 0)
                                                .map(([attr, exp]) => {
                                                  const config = attributeConfig[attr] || { 
                                                    name: getAttributeName(attr), 
                                                    icon: 'question', 
                                                    color: '#999' 
                                                  };
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
                                                      <span>+{exp as number}</span>
                                                    </div>
                                                  );
                                                })}
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <button
                                                onClick={() => startEdit(event)}
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
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default EventManager;