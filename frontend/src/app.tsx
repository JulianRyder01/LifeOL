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
import { saveAttributes, loadAttributes, saveEvents, loadEvents, getInitialAttributes, saveItems, loadItems, getInitialItems, saveProjectEvents, loadProjectEvents, getInitialProjectEvents } from './utils/storage';
import { calculateLevel } from './utils/calculations';
import { checkAchievements, saveAchievements, loadAchievements, getInitialAchievements, checkAttributeDecay } from './utils/achievements';
import { Attributes, Event, Achievement, Item, ProjectEvent } from './types/app.types';

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
    
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // For navigation

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
                      {Object.entries(attributes).map(([key, attr]) => (
                        <div key={key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900">
                              {key === 'int' && '智力'}
                              {key === 'str' && '体魄'}
                              {key === 'vit' && '精力'}
                              {key === 'cha' && '社交'}
                              {key === 'eq' && '情感'}
                              {key === 'cre' && '创造'}
                            </h3>
                            <span className="text-sm font-semibold text-blue-600">Lv.{attr.level}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{attr.exp} 经验值</p>
                        </div>
                      ))}
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
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">当前道具</h2>
                    {items.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {items.slice(0, 6).map(item => (
                          <div key={item.id} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                              {item.icon}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center truncate w-full">{item.name}</p>
                          </div>
                        ))}
                        {items.length > 6 && (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{items.length - 6}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">暂无道具</p>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <EventList events={events} />
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
              />
            </div>
          )}
          
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="mt-8">
              <ItemSystem 
                items={items} 
                onAddItem={handleAddItem} 
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
              />
            </div>
          )}
          
          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="mt-8">
              <StatusPanel attributes={attributes} />
            </div>
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
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

export default App;