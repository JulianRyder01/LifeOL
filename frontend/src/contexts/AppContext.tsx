import React, { createContext, useContext } from 'react';
import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from '../types/app.types';

// Define the context type
interface AppContextType {
  // States
  attributes: Attributes;
  events: Event[];
  achievements: Achievement[];
  items: Item[];
  projectEvents: ProjectEvent[];
  selectedTitles: string[];
  userConfig: UserConfig;
  showFirstTimeGuide: boolean;
  showEventModal: boolean;
  setShowEventModal: (show: boolean) => void;
  showAchievementModal: boolean;
  setShowAchievementModal: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showUseItemModal: boolean;
  setShowUseItemModal: (show: boolean) => void;
  itemToUse: Item | null;
  setItemToUse: (item: Item | null) => void;
  showAllActivities: boolean;
  setShowAllActivities: (show: boolean) => void;
  
  // Functions
  handleAddEvent: (eventData: { title: string; description: string; expGains: Record<string, number> }) => void;
  handleDeleteEvent: (id: string) => void;
  handleUpdateEvent: (id: string, updatedEvent: Partial<Event>) => void;
  handleAddItem: (itemData: Omit<Item, 'id' | 'createdAt'>) => void;
  handleUseItem: (item: Item) => void;
  confirmUseItem: () => void;
  undoUseItem: (itemId: string) => void;
  handleUpdateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => void;
  handleTitleChange: (titleIds: string[]) => void;
  handleAddProjectEvent: (projectEventData: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  handleEditProjectEvent: (id: string, updates: Partial<ProjectEvent>) => void;
  handleUpdateProjectEvent: (id: string, progress: number, reason?: string) => void;
  handleCompleteProjectEvent: (id: string) => void;
  handleResetProjectEvent: (id: string) => void;
  handleDeleteProjectEvent: (id: string) => void;
  getRecentActivities: () => (Event & { type: string })[];
  formatActivityTime: (timestamp: string) => string;
  handleAddCustomAchievement: (achievementData: Partial<Achievement>) => void;
  handleAddCustomTitle: (titleData: Partial<Achievement>) => void;
  handleAddCustomBadge: (badgeData: Partial<Achievement>) => void;
  createCustomCondition: (triggerType: string, condition: string) => (attributes: Attributes, events: Event[]) => boolean;
  handleUserConfigChange: (newConfig: UserConfig) => void;
  attributeNames: Record<string, string>;
  // [修改开始] 添加缺失的函数类型定义
  handleImportData: (file: File, setStatus: (status: { type: 'success' | 'error' | null; message: string }) => void) => void;
  handleResetData: () => void;
  // [修改结束]
}

// Create the context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider: React.FC<{ 
  value: AppContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};