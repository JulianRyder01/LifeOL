import { Attributes, Event, Achievement, Item, ProjectEvent } from '../types/app.types';
import { 
  loadAttributes, 
  loadEvents, 
  loadItems, 
  loadProjectEvents,
  saveAttributes,
  saveEvents,
  saveItems,
  saveProjectEvents,
  getInitialAttributes
} from './storage';
import { loadAchievements, saveAchievements, getInitialAchievements } from './achievements';
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

/**
 * Export all user data to a JSON object
 */
export function exportUserData(): ExportedData {
  const data: ExportedData = {
    version: APP_CONFIG.DATA_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    attributes: loadAttributes() || getInitialAttributes(),
    events: loadEvents() || [],
    achievements: loadAchievements() || getInitialAchievements(),
    items: loadItems() || [],
    projectEvents: loadProjectEvents() || [],
    selectedTitles: JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SELECTED_TITLES) || '[]'),
    userConfig: JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_CONFIG) || '{}')
  };
  
  return data;
}

/**
 * Import user data from a JSON object
 * @param data The exported data to import
 * @returns boolean indicating success or failure
 */
export function importUserData(data: ExportedData): boolean {
  try {
    // Validate data structure
    if (!data.version || !data.exportDate) {
      console.error('Invalid data format: missing version or exportDate');
      return false;
    }
    
    // Save all data components
    if (data.attributes) {
      saveAttributes(data.attributes);
    }
    
    if (data.events) {
      saveEvents(data.events);
    }
    
    if (data.achievements) {
      saveAchievements(data.achievements);
    }
    
    if (data.items) {
      saveItems(data.items);
    }
    
    if (data.projectEvents) {
      saveProjectEvents(data.projectEvents);
    }
    
    if (data.selectedTitles) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SELECTED_TITLES, JSON.stringify(data.selectedTitles));
    }
    
    if (data.userConfig) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_CONFIG, JSON.stringify(data.userConfig));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
}

/**
 * Download user data as a JSON file
 * @param filename The name of the file to download
 */
export function downloadUserData(filename: string = 'lifeol-export.json') {
  const data = exportUserData();
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Import user data from a JSON file
 * @param file The JSON file to import
 * @param onComplete Callback function to execute after import
 */
export function importUserDataFromFile(file: File, onComplete: (success: boolean) => void) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const jsonData = event.target?.result as string;
      if (!jsonData) {
        onComplete(false);
        return;
      }
      
      const data: ExportedData = JSON.parse(jsonData);
      const success = importUserData(data);
      onComplete(success);
    } catch (error) {
      console.error('Error parsing import file:', error);
      onComplete(false);
    }
  };
  
  reader.onerror = () => {
    console.error('Error reading file');
    onComplete(false);
  };
  
  reader.readAsText(file);
}