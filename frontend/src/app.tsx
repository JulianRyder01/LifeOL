import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import NotFound from './components/NotFound';
import DailyExpHeatmap from './components/DailyExpHeatmap';
import AllActivitiesView from './components/AllActivitiesView';
import { saveAttributes, loadAttributes, saveEvents, loadEvents, getInitialAttributes, saveItems, loadItems, getInitialItems, saveProjectEvents, loadProjectEvents, getInitialProjectEvents } from './utils/storage';
import { calculateLevel } from './utils/calculations';
import { checkAchievements, saveAchievements, loadAchievements, getInitialAchievements, checkAttributeDecay, getAvailableTitles, calculateAchievementProgress } from './utils/achievements';
import { saveUserConfig, loadUserConfig, getInitialUserConfig } from './utils/userConfig';
import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from './types/app.types';

// Lazy load components that are not immediately needed
const LazyEventManager = lazy(() => import('./components/EventManager'));
const LazyItemSystem = lazy(() => import('./components/ItemSystem'));
const LazyTaskManager = lazy(() => import('./components/TaskManager'));
const LazyStatusPanel = lazy(() => import('./components/StatusPanel'));
const LazyAchievementSystem = lazy(() => import('./components/AchievementSystem'));
const LazyUserSettings = lazy(() => import('./components/UserSettings'));
const LazyAllActivitiesView = lazy(() => import('./components/AllActivitiesView'));

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
    
    // State for first-time user guide
    const [showFirstTimeGuide, setShowFirstTimeGuide] = useState<boolean>(() => {
      const guideShown = localStorage.getItem('lifeol_first_time_guide_shown');
      return !guideShown; // Show guide if it hasn't been shown before
    });
    
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // For navigation
    const [showUseItemModal, setShowUseItemModal] = useState(false);
    const [itemToUse, setItemToUse] = useState<Item | null>(null);
    const [showAllActivities, setShowAllActivities] = useState(false);

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
      
      // Hide first-time guide after first event is added
      if (showFirstTimeGuide) {
        setShowFirstTimeGuide(false);
        localStorage.setItem('lifeol_first_time_guide_shown', 'true');
      }
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
      // Mark item as used with timestamp
      const updatedItems = items.map(i => 
        i.id === item.id ? { ...i, used: true, usedAt: new Date().toISOString() } : i
      );
      setItems(updatedItems);
      
      // Apply item effects to attributes
      if (item.effects && item.effects.length > 0) {
        const updatedAttributes = { ...attributes };
        let hasChanges = false;
        
        item.effects.forEach(effect => {
          if (effect.attribute in updatedAttributes) {
            hasChanges = true;
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
        
        if (hasChanges) {
          setAttributes(updatedAttributes);
          
          // Check for new achievements
          const newAchievements = checkAchievements(updatedAttributes, events, achievements);
          if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
          }
        }
      }
      
      // Create event for using item
      const useEvent: Event = {
        id: Date.now().toString(),
        title: `使用道具: ${item.name}`,
        description: item.description || `使用了 ${item.name}`,
        timestamp: new Date().toISOString(),
        expGains: item.effects?.reduce((acc, effect) => {
          acc[effect.attribute] = effect.type === 'fixed' 
            ? effect.value 
            : Math.floor(attributes[effect.attribute].exp * (effect.value / 100));
          return acc;
        }, {} as Record<string, number>) || {},
        relatedItemId: item.id
      };
      
      setEvents(prev => [useEvent, ...prev]);
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

    // Undo using an item
    const undoUseItem = (itemId: string) => {
      const item = items.find(i => i.id === itemId);
      if (!item || !item.used) return;
      
      // 检查是否超过两小时
      const usedTime = new Date(item.usedAt || new Date());
      const now = new Date();
      const hoursDiff = Math.abs(now.getTime() - usedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 2) {
        alert('超过两小时，无法撤销使用');
        return;
      }
      
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
      const useEvent = events.find(e => e.relatedItemId === itemId);
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

    // Handle item updates
    const handleUpdateItem = (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => {
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updates } 
            : item
        )
      );
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

    // Edit a project event
    const handleEditProjectEvent = (id: string, updates: Partial<ProjectEvent>) => {
      setProjectEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { ...event, ...updates } 
            : event
        )
      );
    };

    // Handle project event updates
    const handleUpdateProjectEvent = (id: string, progress: number, reason?: string) => {
      setProjectEvents(prev => 
        prev.map(event => {
          // 只有当事件存在且进度发生变化时才记录日志
          if (event.id === id && event.progress !== progress) {
            const change = progress - event.progress;
            const newLogEntry = {
              change,
              reason: reason || '',
              timestamp: new Date().toISOString()
            };
            
            return { 
              ...event, 
              progress,
              progressLog: event.progressLog 
                ? [...event.progressLog, newLogEntry] 
                : [newLogEntry]
            } as ProjectEvent & { progressLog: { change: number; reason: string; timestamp: string }[] };
          }
          return event;
        })
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

    // Reset a completed project event to ongoing status
    const handleResetProjectEvent = (id: string) => {
      setProjectEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { 
                ...event, 
                progress: 0,
                progressLog: [] // Clear progress log when resetting
              } 
          : event
        )
      );
    };

    // Delete a project event
    const handleDeleteProjectEvent = (id: string) => {
      setProjectEvents(prev => prev.filter(event => event.id !== id));
    };

    // Filter events to show in "Recent Activities"
    const getRecentActivities = () => {
      // Get regular events
      const regularEvents = [...events];
      
      // Get task completion events
      const taskEvents = projectEvents
        .filter(task => task.progress >= 100)
        .map(task => ({
          id: `task-${task.id}`,
          title: `完成任务: ${task.title}`,
          description: `成功完成了任务"${task.title}"`,
          timestamp: task.createdAt,
          expGains: {} as Record<string, number>
        }));
      
      // Get achievement unlock events
      const achievementEvents = achievements
        .filter(ach => ach.unlockedAt)
        .map(ach => ({
          id: `ach-${ach.id}`,
          title: `解锁成就: ${ach.title}`,
          description: ach.description || '',
          timestamp: ach.unlockedAt || new Date().toISOString(),
          expGains: {} as Record<string, number>
        }));
      
      // Get item acquisition events
      const itemEvents = items
        .filter(item => !item.used)
        .map(item => ({
          id: `item-${item.id}`,
          title: `获得道具: ${item.name}`,
          description: item.description || '',
          timestamp: item.createdAt,
          expGains: {} as Record<string, number>
        }));
      
      // Combine all events and sort by timestamp
      const allEvents = [...regularEvents, ...taskEvents, ...achievementEvents, ...itemEvents];
      return allEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };
    
    // Format time for recent activities
    const formatActivityTime = (timestamp: string) => {
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
      return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const handleAddCustomAchievement = (achievementData: Partial<Achievement>) => {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        title: achievementData.title || '自定义成就',
        description: achievementData.description || '',
        icon: achievementData.icon || '🏆',
        isCustom: true,
        unlockedAt: null,
        triggerType: achievementData.triggerType,
        triggerCondition: achievementData.triggerCondition,
        progress: achievementData.progress,
        target: achievementData.target,
        isTitle: achievementData.isTitle || false,
        attributeRequirement: achievementData.attributeRequirement,
        levelRequirement: achievementData.levelRequirement,
        ...(achievementData as any).useMarkdown !== undefined && { useMarkdown: (achievementData as any).useMarkdown }
      };
      
      setAchievements(prev => [...prev, newAchievement]);
      setShowAchievementModal(false);
    };

    const handleAddCustomTitle = (titleData: Partial<Achievement>) => {
      const newTitle: Achievement = {
        id: Date.now().toString(),
        title: titleData.title || '自定义称号',
        description: titleData.description || '',
        icon: titleData.icon || '🥇',
        isCustom: true,
        isTitle: true,
        unlockedAt: null,
        triggerType: titleData.triggerType || 'level',
        triggerCondition: titleData.triggerCondition,
        progress: titleData.progress,
        target: titleData.target,
        attributeRequirement: titleData.attributeRequirement,
        levelRequirement: titleData.levelRequirement,
        ...(titleData as any).useMarkdown !== undefined && { useMarkdown: (titleData as any).useMarkdown }
      };
      
      setAchievements(prev => [...prev, newTitle]);
    };

    const handleAddCustomBadge = (badgeData: Partial<Achievement>) => {
      const newBadge: Achievement = {
        id: Date.now().toString(),
        title: badgeData.title || '自定义徽章',
        description: badgeData.description || '',
        icon: badgeData.icon || '🎖️',
        isCustom: true,
        isTitle: false,
        unlockedAt: null,
        triggerType: badgeData.triggerType,
        triggerCondition: badgeData.triggerCondition,
        progress: badgeData.progress,
        target: badgeData.target,
        attributeRequirement: badgeData.attributeRequirement,
        levelRequirement: badgeData.levelRequirement,
        ...(badgeData as any).useMarkdown !== undefined && { useMarkdown: (badgeData as any).useMarkdown }
      };
      
      setAchievements(prev => [...prev, newBadge]);
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

    // State for error handling
    const [hasError, setHasError] = useState(false);

    // Handle tab change
    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      // Reset error state when changing tabs
      setHasError(false);
    };

    if (hasError) {
      return (
        <NotFound onReturnToDashboard={() => {
          setActiveTab('dashboard');
          setHasError(false);
        }} />
      );
    }

    if (showAllActivities) {
      return (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <LazyAllActivitiesView
            events={events}
            projectEvents={projectEvents}
            achievements={achievements}
            items={items}
            attributeNames={attributeNames}
            onReturn={() => setShowAllActivities(false)}
          />
        </Suspense>
      );
    }

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header 
            onAddEvent={() => setShowEventModal(true)}
            onShowAchievements={() => setActiveTab('achievements')}
            achievements={achievements}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="mt-4 sm:mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <StatsOverview attributes={attributes} achievements={achievements} />
                    
                    <div className="mt-8">
                      <TaskManager 
                        projectEvents={projectEvents}
                        items={items}
                        onAddProjectEvent={handleAddProjectEvent}
                        onUpdateProjectEvent={handleUpdateProjectEvent}
                        onCompleteProjectEvent={handleCompleteProjectEvent}
                        onDeleteProjectEvent={handleDeleteProjectEvent}
                        onResetProjectEvent={handleResetProjectEvent}
                        onEditProjectEvent={handleEditProjectEvent}
                        attributeNames={attributeNames}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* 每日经验热力图 */}
                    <DailyExpHeatmap events={events} attributes={attributes} />
                    
                    {/* 当前道具 */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">当前道具</h2>
                      {items.filter(item => !item.used).length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {items.filter(item => !item.used).slice(0, 6).map((item, index) => {
                            const isNew = new Date(item.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                            return (
                              <div 
                                key={item.id} 
                                className="relative flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm cursor-pointer"
                                onClick={() => {
                                  setItemToUse(item);
                                  setShowUseItemModal(true);
                                }}
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
                    <div className="mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">最近活动</h2>
                        <button 
                          onClick={() => setShowAllActivities(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>全部活动</span>
                          <div className="icon-arrow-right text-xs"></div>
                        </button>
                      </div>
                      
                      {getRecentActivities().slice(0, 6).length > 0 ? (
                        <div className="space-y-4">
                          {getRecentActivities().slice(0, 6).map(event => (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                              <div className="flex justify-between flex-wrap">
                                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{event.title}</h3>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {formatActivityTime(event.timestamp)}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              {event.expGains && Object.entries(event.expGains).some(([_, exp]) => exp > 0) && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {Object.entries(event.expGains).map(([attr, exp]) => 
                                    exp > 0 ? (
                                      <span 
                                        key={attr} 
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {attr === 'int' && '🧠'}
                                        {attr === 'str' && '💪'}
                                        {attr === 'vit' && '⚡'}
                                        {attr === 'cha' && '👥'}
                                        {attr === 'eq' && '❤️'}
                                        {attr === 'cre' && '🎨'}
                                        <span className="hidden sm:inline">{attributeNames[attr] || attr}</span>: +{exp} EXP
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
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyEventManager 
                    events={events} 
                    onDeleteEvent={handleDeleteEvent}
                    onUpdateEvent={handleUpdateEvent}
                    attributeNames={attributeNames}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyItemSystem 
                    items={items} 
                    onAddItem={handleAddItem} 
                    onUseItem={handleUseItem}
                    onUndoUseItem={undoUseItem}
                    onUpdateItem={handleUpdateItem}
                    attributeNames={attributeNames}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Tasks Tab */}
            {activeTab === 'projects' && (
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyTaskManager 
                    projectEvents={projectEvents}
                    items={items}
                    onAddProjectEvent={handleAddProjectEvent}
                    onUpdateProjectEvent={handleUpdateProjectEvent}
                    onCompleteProjectEvent={handleCompleteProjectEvent}
                    onDeleteProjectEvent={handleDeleteProjectEvent}
                    onResetProjectEvent={handleResetProjectEvent}
                    onEditProjectEvent={handleEditProjectEvent}
                    attributeNames={attributeNames}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Status Tab */}
            {activeTab === 'status' && (
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyStatusPanel 
                    attributes={attributes} 
                    achievements={achievements}
                    selectedTitles={selectedTitles}
                    onTitleChange={handleTitleChange}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyAchievementSystem 
                    achievements={achievements}
                    attributes={attributes}
                    selectedTitles={selectedTitles}
                    onTitleChange={handleTitleChange}
                    events={events}
                    onAddCustomAchievement={handleAddCustomAchievement}
                    onAddCustomTitle={handleAddCustomTitle}
                    onAddCustomBadge={handleAddCustomBadge}
                  />
                </Suspense>
              </div>
            )}
            
            {/* User Settings Tab */}
            {activeTab === 'user-settings' && (
              <div className="mt-4 sm:mt-8">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                  <LazyUserSettings
                    userConfig={userConfig}
                    onUserConfigChange={handleUserConfigChange}
                    onBack={() => setActiveTab('dashboard')}
                  />
                </Suspense>
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

          {showAllActivities && (
            <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
              <LazyAllActivitiesView
                events={events}
                projectEvents={projectEvents}
                achievements={achievements}
                items={items}
                attributeNames={attributeNames}
                onReturn={() => setShowAllActivities(false)}
              />
            </Suspense>
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
                      onClick={() => setShowUseItemModal(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      取消
                    </button>
                    <button
                      onClick={confirmUseItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      确认使用
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <NotFound onReturnToDashboard={() => window.location.reload()} />
    );
  }
}

export default App;