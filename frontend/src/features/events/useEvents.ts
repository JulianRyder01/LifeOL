import { useState, useEffect } from 'react';
import { Event } from '../../types/app.types';
import { loadEvents, saveEvents } from '../../utils/storage';
import { Attributes } from '../../types/app.types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>(() => {
    return loadEvents() || [];
  });

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const addEvent = (eventData: { title: string; description: string; expGains: Record<string, number> }) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      timestamp: new Date().toISOString()
    };
    
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, ...updatedEvent } as Event
          : event
      )
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

  // Get recent activities
  const getRecentActivities = (projectEvents: any[], achievements: any[], items: any[]) => {
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
      .filter((ach: any) => ach.unlockedAt)
      .map((ach: any) => ({
        id: `ach-${ach.id}`,
        title: `解锁成就: ${ach.title}`,
        description: ach.description || '',
        timestamp: ach.unlockedAt || new Date().toISOString(),
        expGains: {} as Record<string, number>
      }));
    
    // Get item acquisition events
    const itemEvents = items
      .filter((item: any) => !item.used)
      .map((item: any) => ({
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

  return {
    events,
    setEvents,
    addEvent,
    deleteEvent,
    updateEvent,
    formatActivityTime,
    getRecentActivities
  };
};