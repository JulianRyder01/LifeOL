// 用户配置相关工具函数

export interface UserConfig {
  username: string;
  avatar: string;
}

// 默认用户配置
const DEFAULT_USER_CONFIG: UserConfig = {
  username: '秋实',
  avatar: '🍁'
};

// 保存用户配置到localStorage
export function saveUserConfig(config: UserConfig): void {
  try {
    localStorage.setItem('lifeol_user_config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save user config:', error);
  }
}

// 从localStorage加载用户配置
export function loadUserConfig(): UserConfig | null {
  try {
    const stored = localStorage.getItem('lifeol_user_config');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load user config:', error);
    return null;
  }
}

// 获取初始用户配置
export function getInitialUserConfig(): UserConfig {
  return DEFAULT_USER_CONFIG;
}

// 重置所有用户数据
export function resetUserData(): void {
  try {
    // 清除所有用户数据
    localStorage.removeItem('lifeol_attributes');
    localStorage.removeItem('lifeol_events');
    localStorage.removeItem('lifeol_achievements');
    localStorage.removeItem('lifeol_items');
    localStorage.removeItem('lifeol_project_events');
    localStorage.removeItem('lifeol_consumable_usage');
    localStorage.removeItem('lifeol_selected_titles');
    
    // 重新加载页面以应用初始状态
    window.location.reload();
  } catch (error) {
    console.error('Failed to reset user data:', error);
  }
}