import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import AttributeCard from './components/AttributeCard';
import EventList from './components/EventList';
import EventModal from './components/EventModal';
import AchievementModal from './components/AchievementModal';
import ItemSystem from './components/ItemSystem';
import TaskManager from './components/TaskManager';
import EventManager from './components/EventManager';
import StatusPanel from './components/StatusPanel';
import AchievementSystem from './components/AchievementSystem';
import UserSettings from './components/UserSettings';
import { saveAttributes, loadAttributes, saveEvents, loadEvents, getInitialAttributes, saveItems, loadItems, getInitialItems, saveProjectEvents, loadProjectEvents, getInitialProjectEvents } from './utils/storage';
import { calculateLevel } from './utils/calculations';
import { checkAchievements, saveAchievements, loadAchievements, getInitialAchievements, checkAttributeDecay, getAvailableTitles, calculateAchievementProgress } from './utils/achievements';
import { saveUserConfig, loadUserConfig, getInitialUserConfig } from './utils/userConfig';
import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from './types/app.types';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出现了一些问题</h1>
            <p className="text-gray-600 mb-4">很抱歉，发生了意外错误。</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [attributes, setAttributes] = useState<Attributes>(() => {
      return loadAttributes() || getInitialAttributes();
    });
    
    const [events, setEvents] = useState<Event[]>(() => {
      return loadEvents() || [];
    });
    
    const [achievements, setAchievements] = useState<Achievement[]>(() => {
      return loadAchievements() || getInitialAchievements();
    });

    // State for items (道具系统)
    const [items, setItems] = useState<Item[]>(() => {
      return loadItems() || getInitialItems();
    });

    // State for project events (任务管理器)
    const [projectEvents, setProjectEvents] = useState<ProjectEvent[]>(() => {
      return loadProjectEvents() || getInitialProjectEvents();
    });
    
    // State for selected titles
    const [selectedTitles, setSelectedTitles] = useState<string[]>(() => {
      const savedTitles = localStorage.getItem('lifeol_selected_titles');
      return savedTitles ? JSON.parse(savedTitles) : [];
    });
    
    // State for user configuration
    const [userConfig, setUserConfig] = useState<UserConfig>(() => {
      return loadUserConfig() || getInitialUserConfig();
    });
    
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // For navigation
    const [showUseItemModal, setShowUseItemModal] = useState(false);
    const [itemToUse, setItemToUse] = useState<Item | null>(null);

    useEffect(() => {
      saveAttributes(attributes);
    }, [attributes]);

    useEffect(() => {
      saveEvents(events);
    }, [events]);

    useEffect(() => {
      saveAchievements(achievements);
    }, [achievements]);

    useEffect(() => {
      saveItems(items);
    }, [items]);

    useEffect(() => {
      saveProjectEvents(projectEvents);
    }, [projectEvents]);

    useEffect(() => {
      localStorage.setItem('lifeol_selected_titles', JSON.stringify(selectedTitles));
    }, [selectedTitles]);

    useEffect(() => {
      saveUserConfig(userConfig);
    }, [userConfig]);

    // Check for attribute decay on app load and periodically
    useEffect(() => {
      const checkDecay = () => {
        const { updatedAttributes, warnings } = checkAttributeDecay(attributes, events);
        if (warnings.length > 0) {
          setAttributes(updatedAttributes);
          // Could show decay notifications here
          warnings.forEach((warning: any) => {
            console.log(`属性衰减: ${warning.attribute} 减少了 ${warning.decayAmount} 经验值`);
          });
        }
      };

      checkDecay();
      // Check decay every hour
      const interval = setInterval(checkDecay, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, [attributes, events]);

    // Add initial welcome event if no events exist
    useEffect(() => {
      if (events.length === 0) {
        const welcomeEvent: Event = {
          id: 'welcome-event',
          title: '欢迎来到LifeOL！',
          description: '让每一次努力都有迹可循',
          expGains: {},
          timestamp: new Date().toISOString()
        };
        setEvents([welcomeEvent]);
      }
    }, [events.length]);

    const handleAddEvent = (eventData: { title: string; description: string; expGains: Record<string, number> }) => {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventData,
        timestamp: new Date().toISOString()
      };
      
      setEvents(prev => [newEvent, ...prev]);
      
      // Update attributes with gained EXP
      const updatedAttributes = { ...attributes };
      Object.entries(eventData.expGains).forEach(([attr, exp]) => {
        if (exp > 0) {
          updatedAttributes[attr as keyof Attributes] = {
            ...updatedAttributes[attr as keyof Attributes],
            exp: updatedAttributes[attr as keyof Attributes].exp + exp,
            level: calculateLevel(updatedAttributes[attr as keyof Attributes].exp + exp)
          };
        }
      });
      setAttributes(updatedAttributes);
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedAttributes, [newEvent, ...events], achievements);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
      }
      
      setShowEventModal(false);
    };

    // Delete an event
    const handleDeleteEvent = (id: string) => {
      setEvents(prev => prev.filter(event => event.id !== id));
    };

    // Update an event
    const handleUpdateEvent = (id: string, updatedEvent: Partial<Event>) => {
      setEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { ...event, ...updatedEvent } as Event
            : event
        )
      );
    };

    // Add a new item to the inventory
    const handleAddItem = (itemData: Omit<Item, 'id' | 'createdAt'>) => {
      const newItem: Item = {
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date().toISOString()
      };
      
      setItems(prev => [...prev, newItem]);
    };

    // Use a consumable item
    const handleUseItem = (item: Item) => {
      setItemToUse(item);
      setShowUseItemModal(true);
    };

    // Confirm using a consumable item
    const confirmUseItem = () => {
      if (!itemToUse) return;
      
      // Mark item as used
      const updatedItems = items.map(item => 
        item.id === itemToUse.id ? { ...item, used: true } : item
      );
      setItems(updatedItems);
      
      // Apply item effects to attributes if it has any
      if (itemToUse.effects && itemToUse.effects.length > 0) {
        const updatedAttributes = { ...attributes };
        let hasAttributeChanges = false;
        
        itemToUse.effects.forEach(effect => {
          if (effect.attribute in updatedAttributes) {
            hasAttributeChanges = true;
            const currentExp = updatedAttributes[effect.attribute].exp;
            const expGain = effect.type === 'fixed' 
              ? effect.value 
              : Math.floor(currentExp * (effect.value / 100));
            
            updatedAttributes[effect.attribute] = {
              ...updatedAttributes[effect.attribute],
              exp: currentExp + expGain,
              level: calculateLevel(currentExp + expGain)
            };
          }
        });
        
        if (hasAttributeChanges) {
          setAttributes(updatedAttributes);
          
          // Create event for using the item
          const effectDescriptions = itemToUse.effects?.map(effect => 
            `${effect.attribute}: +${effect.type === 'fixed' ? effect.value : effect.value + '%'}`
          ).join(', ') || '';
          
          const useEvent: Event = {
            id: Date.now().toString(),
            title: `使用道具: ${itemToUse.name}`,
            description: `使用了 ${itemToUse.name}，效果: ${effectDescriptions}`,
            expGains: {}, // No direct EXP gains, effects are applied separately
            timestamp: new Date().toISOString()
          };
          
          setEvents(prev => [useEvent, ...prev]);
          
          // Check for new achievements
          const newAchievements = checkAchievements(updatedAttributes, [useEvent, ...events], achievements);
          if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
          }
        }
      }
      
      setShowUseItemModal(false);
      setItemToUse(null);
    };

    // Undo using a consumable item
    const undoUseItem = (itemId: string) => {
      // Find the corresponding event by ID instead of title
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      
      const useEvent = events.find(event => 
        event.title === `使用道具: ${item.name}` && 
        event.description.includes(`使用了 ${item.name}，效果:`)
      );
      
      // Revert attribute changes if the item had effects
      if (item.effects && item.effects.length > 0) {
        const updatedAttributes = { ...attributes };
        let hasChanges = false;
        
        item.effects.forEach(effect => {
          if (effect.attribute in updatedAttributes) {
            hasChanges = true;
            const currentExp = updatedAttributes[effect.attribute].exp;
            const expLoss = effect.type === 'fixed' 
              ? effect.value 
              : Math.floor(currentExp * (effect.value / 100));
            
            updatedAttributes[effect.attribute] = {
              ...updatedAttributes[effect.attribute],
              exp: Math.max(0, currentExp - expLoss), // Ensure EXP doesn't go below 0
              level: calculateLevel(Math.max(0, currentExp - expLoss))
            };
          }
        });
        
        if (hasChanges) {
          setAttributes(updatedAttributes);
        }
      }
      
      // Remove the event if it exists
      if (useEvent) {
        const updatedEvents = events.filter(event => event.id !== useEvent.id);
        setEvents(updatedEvents);
      }
      
      // Mark item as unused
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, used: false } : item
      );
      setItems(updatedItems);
    };

    // Handle title change
    const handleTitleChange = (titleIds: string[]) => {
      setSelectedTitles(titleIds);
    };

    // Add a new project event (task)
    const handleAddProjectEvent = (projectEventData: Omit<ProjectEvent, 'id' | 'createdAt'>) => {
      const newProjectEvent: ProjectEvent = {
        id: Date.now().toString(),
        ...projectEventData,
        createdAt: new Date().toISOString()
      };
      
      setProjectEvents(prev => [...prev, newProjectEvent]);
    };

    // Update project event progress
    const handleUpdateProjectEvent = (id: string, progress: number) => {
      setProjectEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { ...event, progress } 
            : event
        )
      );
    };

    // Complete a project event and award rewards
    const handleCompleteProjectEvent = (id: string) => {
      const projectEvent = projectEvents.find(event => event.id === id);
      if (!projectEvent || projectEvent.completedAt) return;
      
      // Mark as completed
      const completedAt = new Date().toISOString();
      setProjectEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { ...event, completedAt, progress: 100 } 
            : event
        )
      );
      
      // Award rewards
      const updatedAttributes = { ...attributes };
      let hasAttributeChanges = false;
      
      // Apply attribute rewards
      if (projectEvent.attributeRewards) {
        Object.entries(projectEvent.attributeRewards).forEach(([attr, exp]) => {
          if (exp > 0 && attr in updatedAttributes) {
            updatedAttributes[attr as keyof Attributes] = {
              ...updatedAttributes[attr as keyof Attributes],
              exp: updatedAttributes[attr as keyof Attributes].exp + exp,
              level: calculateLevel(updatedAttributes[attr as keyof Attributes].exp + exp)
            };
            hasAttributeChanges = true;
          }
        });
      }
      
      if (hasAttributeChanges) {
        setAttributes(updatedAttributes);
        
        // Check for new achievements
        const newAchievements = checkAchievements(updatedAttributes, events, achievements);
        if (newAchievements.length > 0) {
          setAchievements(prev => [...prev, ...newAchievements]);
        }
      }
      
      // TODO: Award item rewards
      // For now, we'll just show a notification
      console.log(`Project "${projectEvent.title}" completed! Rewards awarded.`);
    };

    // Delete a project event
    const handleDeleteProjectEvent = (id: string) => {
      setProjectEvents(prev => prev.filter(event => event.id !== id));
    };

    const handleAddCustomAchievement = (achievementData: Partial<Achievement>) => {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        ...achievementData,
        isCustom: true,
        unlockedAt: achievementData.triggerType === 'manual' ? new Date().toISOString() : null
      } as Achievement;
      
      // Add custom condition function if not manual
      if (achievementData.triggerType !== 'manual' && achievementData.triggerCondition) {
        newAchievement.condition = createCustomCondition(achievementData.triggerType!, achievementData.triggerCondition);
      }
      
      setAchievements(prev => [...prev, newAchievement]);
      setShowAchievementModal(false);
    };

    // Helper function to create custom achievement conditions
    const createCustomCondition = (triggerType: string, condition: string) => {
      switch (triggerType) {
        case 'level':
          const [attr, level] = condition.split(':');
          return (attributes: Attributes) => attributes[attr as keyof Attributes] && attributes[attr as keyof Attributes].level >= parseInt(level);
        
        case 'events':
          const count = parseInt(condition);
          return (attributes: Attributes, events: Event[]) => events.length >= count;
        
        case 'keyword':
          const keywords = condition.split(',').map(k => k.trim());
          return (attributes: Attributes, events: Event[]) => events.some(event => 
            keywords.some(keyword => 
              event.title.includes(keyword) || event.description.includes(keyword)
            )
          );
        
        case 'streak':
          const days = parseInt(condition);
          return (attributes: Attributes, events: Event[]) => {
            const today = new Date();
            for (let i = 0; i < days; i++) {
              const targetDate = new Date(today);
              targetDate.setDate(today.getDate() - i);
              const hasEventOnDate = events.some(event => {
                const eventDate = new Date(event.timestamp);
                return eventDate.toDateString() === targetDate.toDateString();
              });
              if (!hasEventOnDate) return false;
            }
            return true;
          };
        
        default:
          return () => false;
      }
    };

    // Handle user config change
    const handleUserConfigChange = (newConfig: UserConfig) => {
      setUserConfig(newConfig);
    };

    // 属性名称映射
    const attributeNames: Record<string, string> = {
      int: '智力',
      str: '体魄',
      vit: '精力',
      cha: '社交',
      eq: '情感',
      cre: '创造'
    };

    return (
      <div className="min-h-screen bg-[var(--bg-secondary)]" data-name="app" data-file="app.js">
        <Header 
          onAddEvent={() => setShowEventModal(true)} 
          onShowAchievements={() => setShowAchievementModal(true)}
          achievements={achievements}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <StatsOverview attributes={attributes} achievements={achievements} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">当前状态概览</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(attributes).map(([key, attr]) => {
                        // Get titles for this attribute
                        // 修复重复显示称号的问题：只显示选中的称号
                        const attributeTitles = achievements
                          .filter(a => a.isTitle && a.attributeRequirement === key && selectedTitles.includes(a.id))
                          .map(a => a.title);
                        
                        // 去除重复的称号显示
                        const uniqueTitles = Array.from(new Set(attributeTitles));
                        
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">
                                {key === 'int' && '🧠 智力'}
                                {key === 'str' && '💪 体魄'}
                                {key === 'vit' && '⚡ 精力'}
                                {key === 'cha' && '👥 社交'}
                                {key === 'eq' && '❤️ 情感'}
                                {key === 'cre' && '🎨 创造'}
                              </h3>
                              <span className="text-sm font-semibold text-blue-600">Lv.{attr.level}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{attr.exp} 经验值</p>
                            {uniqueTitles.length > 0 && (
                              <div className="mt-2">
                                {uniqueTitles.map((title, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                                  >
                                    {title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">当前任务</h2>
                    {projectEvents.filter(event => !event.completedAt).slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {projectEvents.filter(event => !event.completedAt).slice(0, 3).map(event => (
                          <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{event.title}</h3>
                              <span className="text-sm text-gray-500">{Math.round(event.progress)}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${event.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">当前没有进行中的任务</p>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">最近成就</h2>
                    {achievements.filter(a => a.unlockedAt).slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {achievements
                          .filter(a => a.unlockedAt)
                          .sort((a, b) => 
                            new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
                          )
                          .slice(0, 3)
                          .map(achievement => (
                            <div key={achievement.id} className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                {achievement.icon ? (
                                  <div className={`icon-${achievement.icon}`} />
                                ) : (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-gray-900">{achievement.title}</h3>
                                <p className="text-xs text-gray-500">
                                  {new Date(achievement.unlockedAt!).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">暂无成就</p>
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">当前道具</h2>
                    {items.filter(item => !item.used).length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {items.filter(item => !item.used).slice(0, 6).map(item => {
                          const createdAt = new Date(item.createdAt);
                          const now = new Date();
                          const hoursDiff = Math.abs(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                          const isNew = hoursDiff < 24;
                          
                          return (
                            <div 
                              key={item.id} 
                              className="flex flex-col items-center relative"
                              onClick={() => item.type === 'consumable' ? handleUseItem(item) : undefined}
                            >
                              {isNew && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                              )}
                              <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl ${item.type === 'consumable' ? 'cursor-pointer hover:bg-gray-200' : ''}`}>
                                {item.icon}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center truncate w-full">{item.name}</p>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.type === 'equipment' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : item.type === 'consumable' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {item.type === 'equipment' 
                                    ? '装备' 
                                    : item.type === 'consumable' 
                                      ? '消耗品' 
                                      : '收藏品'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {items.filter(item => !item.used).length > 6 && (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{items.filter(item => !item.used).length - 6}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">暂无道具</p>
                    )}
                  </div>
                  
                  {/* 最近活动 */}
                  <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">最近活动</h2>
                    {events.slice(0, 5).length > 0 ? (
                      <div className="space-y-4">
                        {events.slice(0, 5).map(event => (
                          <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{event.title}</h3>
                              <span className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                            {Object.entries(event.expGains).some(([_, exp]) => exp > 0) && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(event.expGains).map(([attr, exp]) => 
                                  exp > 0 ? (
                                    <span 
                                      key={attr} 
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {attributeNames[attr] || attr}: +{exp} EXP
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">暂无活动记录</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="mt-8">
              <EventManager 
                events={events} 
                onDeleteEvent={handleDeleteEvent}
                onUpdateEvent={handleUpdateEvent}
                attributeNames={attributeNames}
              />
            </div>
          )}
          
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="mt-8">
              <ItemSystem 
                items={items} 
                onAddItem={handleAddItem} 
                onUseItem={handleUseItem}
                onUndoUseItem={undoUseItem}
                attributeNames={attributeNames}
              />
            </div>
          )}
          
          {/* Tasks Tab */}
          {activeTab === 'projects' && (
            <div className="mt-8">
              <TaskManager 
                projectEvents={projectEvents}
                items={items}
                onAddProjectEvent={handleAddProjectEvent}
                onUpdateProjectEvent={handleUpdateProjectEvent}
                onCompleteProjectEvent={handleCompleteProjectEvent}
                onDeleteProjectEvent={handleDeleteProjectEvent}
                attributeNames={attributeNames}
              />
            </div>
          )}
          
          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="mt-8">
              <StatusPanel 
                attributes={attributes} 
                achievements={achievements}
                selectedTitles={selectedTitles}
                onTitleChange={handleTitleChange}
              />
            </div>
          )}
          
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="mt-8">
              <AchievementSystem 
                achievements={achievements}
                attributes={attributes}
                selectedTitles={selectedTitles}
                onTitleChange={handleTitleChange}
              />
            </div>
          )}
          
          {/* User Settings Tab */}
          {activeTab === 'user-settings' && (
            <UserSettings
              userConfig={userConfig}
              onUserConfigChange={handleUserConfigChange}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </main>

        {showEventModal && (
          <EventModal 
            onClose={() => setShowEventModal(false)}
            onSubmit={handleAddEvent}
          />
        )}

        {showAchievementModal && (
          <AchievementModal 
            onClose={() => setShowAchievementModal(false)}
            onSubmit={handleAddCustomAchievement}
            achievements={achievements}
          />
        )}

        {showUseItemModal && itemToUse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900">使用道具</h3>
                <div className="mt-2">
                  <p className="text-gray-500">
                    确定要使用道具 <span className="font-medium text-gray-900">{itemToUse.name}</span> 吗？
                  </p>
                  {itemToUse.effects && itemToUse.effects.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">道具效果:</p>
                      <ul className="mt-1 text-sm text-gray-500">
                        {itemToUse.effects.map((effect, index) => (
                          <li key={index}>
                            {attributeNames[effect.attribute] || effect.attribute}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                            {effect.type === 'percentage' ? '%' : ' EXP'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUseItemModal(false);
                      setItemToUse(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmUseItem}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    确认使用
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

export default App;