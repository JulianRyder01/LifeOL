import { UserConfig } from '../types/app.types';
import { APP_CONFIG } from './config';

// Get initial user configuration
function getInitialUserConfig(): UserConfig {
  return {
    username: '冒险者',
    avatar: '😊'
  };
}

// Save user configuration to localStorage
function saveUserConfig(config: UserConfig): void {
  try {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save user config:', error);
  }
}

// Load user configuration from localStorage
function loadUserConfig(): UserConfig | null {
  try {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_CONFIG);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load user config:', error);
    return null;
  }
}

// Reset all user data
function resetUserData(): void {
  // Clear all stored data
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ATTRIBUTES);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.EVENTS);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACHIEVEMENTS);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ITEMS);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PROJECT_EVENTS);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.CONSUMABLE_USAGE);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SELECTED_TITLES);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_CONFIG);
  
  // Reload the page to reflect changes
  window.location.reload();
}

export {
  getInitialUserConfig,
  saveUserConfig,
  loadUserConfig,
  resetUserData
};