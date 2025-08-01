import { useState, useEffect } from 'react';
import { ProjectEvent } from '../../types/app.types';
import { loadProjectEvents, getInitialProjectEvents, saveProjectEvents } from '../../utils/storage';

export const useTasks = () => {
  const [projectEvents, setProjectEvents] = useState<ProjectEvent[]>(() => {
    return loadProjectEvents() || getInitialProjectEvents();
  });

  useEffect(() => {
    saveProjectEvents(projectEvents);
  }, [projectEvents]);

  const addProjectEvent = (projectEventData: Omit<ProjectEvent, 'id' | 'createdAt'>) => {
    const newProjectEvent: ProjectEvent = {
      id: Date.now().toString(),
      ...projectEventData,
      createdAt: new Date().toISOString()
    };
    
    setProjectEvents(prev => [...prev, newProjectEvent]);
    return newProjectEvent;
  };

  const editProjectEvent = (id: string, updates: Partial<ProjectEvent>) => {
    setProjectEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, ...updates } 
          : event
      )
    );
  };

  const updateProjectEvent = (id: string, progress: number, reason?: string) => {
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

  const completeProjectEvent = (id: string) => {
    // Mark as completed
    const completedAt = new Date().toISOString();
    setProjectEvents(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, completedAt, progress: 100 } 
          : event
      )
    );
  };

  const resetProjectEvent = (id: string) => {
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

  const deleteProjectEvent = (id: string) => {
    setProjectEvents(prev => prev.filter(event => event.id !== id));
  };

  return {
    projectEvents,
    setProjectEvents,
    addProjectEvent,
    editProjectEvent,
    updateProjectEvent,
    completeProjectEvent,
    resetProjectEvent,
    deleteProjectEvent
  };
};