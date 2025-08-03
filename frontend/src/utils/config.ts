// 从 package.json 获取应用版本号
import packageJson from '../../package.json';

// Add type declaration for Node.js process object
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

// App global configuration
export const APP_CONFIG = {
  // 应用版本号，来自 package.json，标识整个应用程序的版本
  // 用于: 应用发布、部署、功能标识
  VERSION: packageJson.version,
  
  // 数据导出格式版本号，独立于应用版本
  // 当用户数据结构发生变化时需要更新此版本号
  // 用于: 数据导入/导出兼容性检查
  DATA_FORMAT_VERSION: '1.0.0',
  
  // 应用名称
  APP_NAME: 'LifeOL',
  
  // 后端API配置
  API: {
    // 开发环境API地址
    BASE_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/v1' 
      : '/api/v1', // 生产环境使用相对路径
    
    // API端点
    ENDPOINTS: {
      AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh'
      },
      USERS: {
        ME: '/users/me'
      },
      ATTRIBUTES: {
        ROOT: '/attributes'
      },
      EVENTS: {
        ROOT: '/events'
      },
      PROJECT_EVENTS: {
        ROOT: '/project-events',
        PROGRESS: (id: string) => `/project-events/${id}/progress`
      },
      ITEMS: {
        ROOT: '/items',
        USE: (id: string) => `/items/${id}/use`
      },
      ACHIEVEMENTS: {
        ROOT: '/achievements',
        UNLOCK: (id: string) => `/achievements/${id}/unlock`
      },
      CONFIG: {
        ROOT: '/config'
      },
      DATA: {
        EXPORT: '/data/export',
        IMPORT: '/data/import'
      }
    }
  },
  
  // 存储键名常量
  STORAGE_KEYS: {
    ATTRIBUTES: 'lifeol_attributes',
    EVENTS: 'lifeol_events',
    ACHIEVEMENTS: 'lifeol_achievements',
    ITEMS: 'lifeol_items',
    PROJECT_EVENTS: 'lifeol_project_events',
    CONSUMABLE_USAGE: 'lifeol_consumable_usage',
    SELECTED_TITLES: 'lifeol_selected_titles',
    USER_CONFIG: 'lifeol_user_config',
    // 新增认证相关键名
    AUTH_TOKEN: 'lifeol_auth_token',
    REFRESH_TOKEN: 'lifeol_refresh_token'
  }
};