import { Attributes, Event, Achievement, Item, ProjectEvent, UserConfig } from '../types/app.types';
import { saveAttributes, loadAttributes, getInitialAttributes } from './storage';
import { saveEvents, loadEvents } from './storage';
import { saveItems, loadItems, getInitialItems } from './storage';
import { saveProjectEvents, loadProjectEvents, getInitialProjectEvents } from './storage';
import { loadAchievements, saveAchievements, INITIAL_ACHIEVEMENTS } from './achievements';
import { saveUserConfig, loadUserConfig, getInitialUserConfig } from './userConfig';
import { APP_CONFIG } from './config';

// Define the data structure for export
export interface ExportedData {
  version: string;
  exportDate: string;
  attributes: Attributes;
  events: Event[];
  achievements: Achievement[];
  items: Item[];
  projectEvents: ProjectEvent[];
  selectedTitles: string[];
  userConfig: any;
}

export function exportData(): ExportedData {
  return {
    version: APP_CONFIG.DATA_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    attributes: loadAttributes() || getInitialAttributes(),
    events: loadEvents() || [],
    achievements: loadAchievements() || INITIAL_ACHIEVEMENTS,
    items: loadItems() || getInitialItems(),
    projectEvents: loadProjectEvents() || getInitialProjectEvents(),
    selectedTitles: JSON.parse(localStorage.getItem('lifeol_selected_titles') || '[]'),
    userConfig: loadUserConfig() || getInitialUserConfig()
  };
}

export function downloadUserData(): void {
  try {
    const data = exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `lifeol-export-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('导出数据时出错:', error);
    throw error;
  }
}

export function importUserDataFromFile(file: File, callback: (success: boolean) => void): void {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target?.result as string);
      importData(data);
      callback(true);
    } catch (error) {
      console.error('导入数据时出错:', error);
      callback(false);
    }
  };
  reader.readAsText(file);
}

export function importData(data: ExportedData): void {
  try {
    // Import attributes
    saveAttributes(data.attributes);
    
    // Import events
    saveEvents(data.events);
    
    // Import achievements
    saveAchievements(data.achievements);
    
    // Import items
    saveItems(data.items);
    
    // Import project events
    saveProjectEvents(data.projectEvents);
    
    // Import selected titles
    if (data.selectedTitles) {
      localStorage.setItem('lifeol_selected_titles', JSON.stringify(data.selectedTitles));
    }
    
    // Import user config
    if (data.userConfig) {
      saveUserConfig(data.userConfig);
    }
  } catch (error) {
    console.error('导入数据时出错:', error);
    throw error;
  }
}

export function getInitialData(): ExportedData {
  return {
    version: APP_CONFIG.DATA_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    attributes: getInitialAttributes(),
    events: [],
    achievements: INITIAL_ACHIEVEMENTS,
    items: getInitialItems(),
    projectEvents: getInitialProjectEvents(),
    selectedTitles: [],
    userConfig: getInitialUserConfig()
  };
}