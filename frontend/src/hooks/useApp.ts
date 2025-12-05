import { useState, useEffect, useMemo, useCallback } from 'react';
import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from '../types/app.types';
import { 
  saveAttributes, 
  loadAttributes, 
  getInitialAttributes,
  saveEvents, 
  loadEvents,
  saveItems, 
  loadItems, 
  getInitialItems,
  saveProjectEvents, 
  loadProjectEvents, 
  getInitialProjectEvents
} from '../utils/storage';
import { calculateLevel } from '../utils/calculations';
import { 
  checkAchievements, 
  saveAchievements, 
  loadAchievements, 
  INITIAL_ACHIEVEMENTS, 
  checkAttributeDecay 
} from '../utils/achievements';
import { saveUserConfig, loadUserConfig, getInitialUserConfig, resetUserData } from '../utils/userConfig';
// [修改开始] 引入数据导入工具
import { importUserDataFromFile } from '../utils/dataImportExport';
// [修改结束]

export const useApp = () => {
  // Attribute names mapping
  const attributeNames: Record<string, string> = {
    'int': '智力',
    'str': '体魄',
    'vit': '精力',
    'cha': '社交',
    'eq': '情感',
    'cre': '创造'
  };

  const [attributes, setAttributes] = useState<Attributes>(() => {
    return loadAttributes() || getInitialAttributes();
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    return loadEvents() || [];
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return loadAchievements() || INITIAL_ACHIEVEMENTS;
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

  // Memoize expensive calculations
  const recentActivities = useMemo(() => {
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
  }, [events, projectEvents, achievements, items]);

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
        // Add decay event to activities log
        const decayEvent: Event = {
          id: `decay-${Date.now()}`,
          title: '属性衰减',
          description: `由于长期未使用，部分属性经验值已衰减`,
          expGains: {},
          timestamp: new Date().toISOString()
        };
        
        warnings.forEach((warning: any) => {
          decayEvent.expGains[warning.attribute] = -warning.decayAmount;
          toast.warn(`您的${attributeNames[warning.attribute]}属性因长期未使用，已衰减${warning.decayAmount}点经验值`);
        });
        
        setEvents(prev => [decayEvent, ...prev]);
      }
    };

    checkDecay();
    // Check decay every 30 minutes instead of every hour to reduce frequency
    const interval = setInterval(checkDecay, 30 * 60 * 1000);
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

  const handleAddEvent = useCallback((eventData: { title: string; description: string; expGains: Record<string, number> }) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      timestamp: new Date().toISOString()
    };
    
    setEvents(prev => [newEvent, ...prev]);
    
    // Update attributes with gained EXP
    const updatedAttributes = { ...attributes };
    let hasAttributeChanges = false;
    
    Object.entries(eventData.expGains).forEach(([attr, exp]) => {
      if (exp > 0 && attr in updatedAttributes) {
        hasAttributeChanges = true;
        updatedAttributes[attr as keyof Attributes] = {
          ...updatedAttributes[attr as keyof Attributes],
          exp: updatedAttributes[attr as keyof Attributes].exp + exp,
          level: calculateLevel(updatedAttributes[attr as keyof Attributes].exp + exp)
        };
      }
    });
    
    if (hasAttributeChanges) {
      setAttributes(updatedAttributes);
      
      // Check for new achievements
      const newAchievements = checkAchievements(updatedAttributes, [newEvent, ...events], achievements);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
      }
    }
    
    // Show success notification
    toast.success('事件记录成功！');
    
    setShowEventModal(false);
    
    // Hide first-time guide after first event is added
    if (showFirstTimeGuide) {
      setShowFirstTimeGuide(false);
      localStorage.setItem('lifeol_first_time_guide_shown', 'true');
    }
  }, [attributes, events, achievements, showFirstTimeGuide]);

  // Delete an event
  const handleDeleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  // Update an event
  const handleUpdateEvent = useCallback((id: string, updatedEvent: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, ...updatedEvent } as Event
          : event
      )
    );
  }, []);

  // Add a new item to the inventory
  const handleAddItem = useCallback((itemData: Omit<Item, 'id' | 'createdAt'>) => {
    const newItem: Item = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString()
    };
    
    setItems(prev => [...prev, newItem]);
  }, []);

  // Use a consumable item
  const handleUseItem = useCallback((item: Item) => {
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
          const currentExp = updatedAttributes[effect.attribute as keyof Attributes].exp;
          const expGain = effect.type === 'fixed' 
            ? effect.value 
            : Math.floor(currentExp * (effect.value / 100));
        
          updatedAttributes[effect.attribute as keyof Attributes] = {
              ...updatedAttributes[effect.attribute as keyof Attributes],
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
                    : Math.floor(attributes[effect.attribute as keyof Attributes].exp * (effect.value / 100));
        return acc;
      }, {} as Record<string, number>) || {},
      relatedItemId: item.id
    };
    
    setEvents(prev => [useEvent, ...prev]);
    
    // Show success notification
    toast.success(`道具"${item.name}"使用成功！`);
  }, [attributes, events, achievements]);

  // Confirm using a consumable item
  const confirmUseItem = useCallback(() => {
    if (!itemToUse) return;
    
    // Mark item as used
    const updatedItems = items.map(item => 
            item.id === itemToUse.id ? { ...item, used: true, usedAt: new Date().toISOString() } : item
    );
    setItems(updatedItems);
    
    // Apply item effects to attributes if it has any
    if (itemToUse.effects && itemToUse.effects.length > 0) {
      const updatedAttributes = { ...attributes };
      let hasAttributeChanges = false;
      
      itemToUse.effects.forEach(effect => {
        if (effect.attribute in updatedAttributes) {
          hasAttributeChanges = true;
                    const currentExp = updatedAttributes[effect.attribute as keyof Attributes].exp;
          const expGain = effect.type === 'fixed' 
            ? effect.value 
            : Math.floor(currentExp * (effect.value / 100));
          
                    updatedAttributes[effect.attribute as keyof Attributes] = {
                        ...updatedAttributes[effect.attribute as keyof Attributes],
            exp: currentExp + expGain,
            level: calculateLevel(currentExp + expGain)
          };
        }
      });
      
      if (hasAttributeChanges) {
        setAttributes(updatedAttributes);
        
        // Create event for using the item
        const effectDescriptions = itemToUse.effects?.map(effect => 
                    `${attributeNames[effect.attribute] || effect.attribute}: +${effect.type === 'fixed' ? effect.value : effect.value + '%'}`
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
  }, [itemToUse, items, attributes, events, achievements]);

  // Undo using an item
  const undoUseItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.used) return;
    
    // 检查是否超过两小时
    const usedTime = new Date(item.usedAt || new Date());
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - usedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 2) {
      toast.error('超过两小时，无法撤销使用');
      return;
    }
    
    // Revert attribute changes if the item had effects
    if (item.effects && item.effects.length > 0) {
      const updatedAttributes = { ...attributes };
      let hasChanges = false;
      
      item.effects.forEach(effect => {
        if (effect.attribute in updatedAttributes) {
          hasChanges = true;
                    const currentExp = updatedAttributes[effect.attribute as keyof Attributes].exp;
          const expLoss = effect.type === 'fixed' 
            ? effect.value 
            : Math.floor(currentExp * (effect.value / 100));
          
                    updatedAttributes[effect.attribute as keyof Attributes] = {
                        ...updatedAttributes[effect.attribute as keyof Attributes],
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
            item.id === itemId ? { ...item, used: false, usedAt: undefined } : item
    );
    setItems(updatedItems);
  }, [attributes, events, items]);

  // Handle item updates
  const handleUpdateItem = useCallback((id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates } 
          : item
      )
    );
  }, []);

  // Handle title change
  const handleTitleChange = useCallback((titleIds: string[]) => {
    setSelectedTitles(titleIds);
  }, []);

  // Add a new project event (task)
  const handleAddProjectEvent = useCallback((projectEventData: Omit<ProjectEvent, 'id' | 'createdAt'>) => {
    const newProjectEvent: ProjectEvent = {
      id: Date.now().toString(),
      ...projectEventData,
      createdAt: new Date().toISOString()
    };
    
    setProjectEvents(prev => [...prev, newProjectEvent]);
  }, []);

  // Edit a project event
  const handleEditProjectEvent = useCallback((id: string, updates: Partial<ProjectEvent>) => {
    setProjectEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, ...updates } 
          : event
      )
    );
  }, []);

  // Handle project event updates
  const handleUpdateProjectEvent = useCallback((id: string, progress: number, reason?: string) => {
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
  }, []);

  // Complete a project event and award rewards
  const handleCompleteProjectEvent = useCallback((id: string) => {
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
    
    // Show success notification
    toast.success(`项目"${projectEvent.title}"已完成，奖励已发放！`);
  }, [attributes, events, achievements, projectEvents]);

  // Reset a completed project event to ongoing status
  const handleResetProjectEvent = useCallback((id: string) => {
    setProjectEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { 
              ...event, 
              progress: 0,
                        completedAt: undefined, // Make sure to reset completedAt
              progressLog: [] // Clear progress log when resetting
            } 
        : event
      )
    );
  }, []);

  // Delete a project event
  const handleDeleteProjectEvent = useCallback((id: string) => {
    setProjectEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  // Filter events to show in "Recent Activities"
  const getRecentActivities = () => {
    // Get regular events
        const regularEvents = [...events].map(e => ({ ...e, type: 'event' }));
    
    // Get task completion events
    const taskEvents = projectEvents
            .filter(task => task.completedAt)
      .map(task => ({
        id: `task-${task.id}`,
        title: `完成任务: ${task.title}`,
        description: `成功完成了任务"${task.title}"`,
                timestamp: task.completedAt!,
                expGains: {} as Record<string, number>,
                type: 'task'
      }));
    
    // Get achievement unlock events
    const achievementEvents = achievements
      .filter(ach => ach.unlockedAt)
      .map(ach => ({
        id: `ach-${ach.id}`,
        title: `解锁成就: ${ach.title}`,
        description: ach.description || '',
                timestamp: ach.unlockedAt!,
                expGains: {} as Record<string, number>,
                type: 'achievement'
      }));
    
    // Get item acquisition events
    const itemEvents = items
      .map(item => ({
        id: `item-${item.id}`,
        title: `获得道具: ${item.name}`,
        description: item.description || '',
        timestamp: item.createdAt,
                expGains: {} as Record<string, number>,
                type: 'item'
      }));
    
    // Combine all events and sort by timestamp
    const allEvents = [...regularEvents, ...taskEvents, ...achievementEvents, ...itemEvents];
    return allEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Format time for recent activities
  const formatActivityTime = useCallback((timestamp: string) => {
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
  }, []);

  const handleAddCustomAchievement = useCallback((achievementData: Partial<Achievement>) => {
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
            ...((achievementData as any).useMarkdown !== undefined && { useMarkdown: (achievementData as any).useMarkdown })
    };
    
    setAchievements(prev => [...prev, newAchievement]);
    setShowAchievementModal(false);
  }, []);

  const handleAddCustomTitle = useCallback((titleData: Partial<Achievement>) => {
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
            ...((titleData as any).useMarkdown !== undefined && { useMarkdown: (titleData as any).useMarkdown })
    };
    
    setAchievements(prev => [...prev, newTitle]);
  }, []);

  const handleAddCustomBadge = useCallback((badgeData: Partial<Achievement>) => {
    const newBadge: Achievement = {
      id: Date.now().toString(),
      title: badgeData.title || '自定义徽章',
      description: badgeData.description || '',
      icon: badgeData.icon || '🎖️',
      isCustom: true,
            isTitle: false, // Badges are not titles
      unlockedAt: null,
      triggerType: badgeData.triggerType,
      triggerCondition: badgeData.triggerCondition,
      progress: badgeData.progress,
      target: badgeData.target,
      attributeRequirement: badgeData.attributeRequirement,
      levelRequirement: badgeData.levelRequirement,
            ...((badgeData as any).useMarkdown !== undefined && { useMarkdown: (badgeData as any).useMarkdown })
    };
    
    setAchievements(prev => [...prev, newBadge]);
  }, []);


  // Helper function to create custom achievement conditions
  const createCustomCondition = useCallback((triggerType: string, condition: string) => {
    switch (triggerType) {
      case 'level':
        const [attr, level] = condition.split(':');
        return (attributes: Attributes) => attributes[attr as keyof Attributes] && attributes[attr as keyof Attributes].level >= parseInt(level);
      
      case 'events':
        const count = parseInt(condition);
                return (_attributes: Attributes, events: Event[]) => events.length >= count;
      
      case 'keyword':
        const keywords = condition.split(',').map(k => k.trim());
                return (_attributes: Attributes, events: Event[]) => events.some(event =>
          keywords.some(keyword => 
                        event.title.includes(keyword) || (event.description && event.description.includes(keyword))
          )
        );
      
      case 'streak':
        const days = parseInt(condition);
                return (_attributes: Attributes, events: Event[]) => {
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
  }, []);

  // Handle user config change
  const handleUserConfigChange = useCallback((newConfig: UserConfig) => {
    setUserConfig(newConfig);
  };
    
    // [修改开始] 添加数据导入和重置的处理函数
    const handleImportData = (file: File, setStatus: (status: { type: 'success' | 'error' | null; message: string }) => void) => {
        if (window.confirm('导入数据将会覆盖您当前的所有本地数据，确定要继续吗？')) {
            importUserDataFromFile(file, (success) => {
                if (success) {
                    setStatus({ type: 'success', message: '数据导入成功！页面将自动刷新。' });
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    setStatus({ type: 'error', message: '数据导入失败，请检查文件格式是否正确。' });
                    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
                }
            });
        }
    };

    const handleResetData = () => {
        if (window.confirm('警告：此操作将清除所有本地数据并重置应用，且无法撤销。您确定要重开人生吗？')) {
            resetUserData();
            // 在 utils/userConfig.ts 中已移除 reload，此处执行以确保状态刷新
            window.location.reload();
        }
    };
    // [修改结束]

  // 属性名称映射
  const attributeNames: Record<string, string> = {
    int: '智识',
    phy: '体魄',
    wil: '意志',
    cha: '魅力',
    men: '心境',
    cre: '创造'
  };

  return {
    // States
    attributes,
    events,
    achievements,
    items,
    projectEvents,
    selectedTitles,
    userConfig,
    showFirstTimeGuide,
    showEventModal,
    setShowEventModal,
    showAchievementModal,
    setShowAchievementModal,
    activeTab,
    setActiveTab,
    showUseItemModal,
    setShowUseItemModal,
    itemToUse,
    setItemToUse,
    showAllActivities,
    setShowAllActivities,
    
    // Functions
    handleAddEvent,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddItem,
    handleUseItem,
    confirmUseItem,
    undoUseItem,
    handleUpdateItem,
    handleTitleChange,
    handleAddProjectEvent,
    handleEditProjectEvent,
    handleUpdateProjectEvent,
    handleCompleteProjectEvent,
    handleResetProjectEvent,
    handleDeleteProjectEvent,
    getRecentActivities,
    formatActivityTime,
    handleAddCustomAchievement,
    handleAddCustomTitle,
    handleAddCustomBadge,
    createCustomCondition,
    handleUserConfigChange,
    attributeNames
  };
};