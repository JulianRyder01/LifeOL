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
  // [修改开始] 将刷新页面的逻辑移出，交由调用方处理，使函数职责更单一
  // Clear all stored data
  Object.values(APP_CONFIG.STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // The page reload will be handled by the caller hook
  // [修改结束]
}

export {
  getInitialUserConfig,
  saveUserConfig,
  loadUserConfig,
  resetUserData
};