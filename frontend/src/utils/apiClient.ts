import { APP_CONFIG } from './config';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = APP_CONFIG.API.BASE_URL;
    
    // 从localStorage中获取token
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      this.token = token;
    }
  }

  /**
   * 设置认证token
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * 清除认证token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * 通用请求方法
   * @param endpoint API端点
   * @param options 请求选项
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // 设置默认选项
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 如果有token，添加到Authorization头
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // 如果是401未授权，尝试刷新token
      if (response.status === 401) {
        // 这里可以实现token刷新逻辑
        this.clearToken();
        window.location.reload();
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: unknown) {
      const e = error as Error;
      console.error(`API request failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * GET请求
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST请求
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH请求
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * 导入数据
   */
  async importData(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<{ message: string }>('/data/import', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器设置正确的Content-Type
    });
  }
}

// 创建并导出API客户端实例
const apiClient = new ApiClient();

// 创建一个公共的导入方法而不是直接调用私有方法
export const importData = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.importData(file);
};

// 导出认证相关的方法
export const authApi = {
  /**
   * 用户注册
   */
  register: (userData: { username: string; email: string; password: string }) => 
    apiClient.post('/auth/register', userData),

  /**
   * 用户登录
   */
  login: (credentials: { email: string; password: string }) => 
    apiClient.post<{ user: any; token: string }>('/auth/login', credentials),

  /**
   * 刷新token
   */
  refresh: (refreshToken: string) => 
    apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
};

// 导出用户相关的方法
export const userApi = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => apiClient.get('/users/me'),

  /**
   * 更新当前用户信息
   */
  updateCurrentUser: (userData: { username?: string; avatar?: string }) => 
    apiClient.put('/users/me', userData),
};

// 导出属性相关的方法
export const attributeApi = {
  /**
   * 获取用户属性
   */
  getAttributes: () => apiClient.get('/attributes'),

  /**
   * 更新用户属性
   */
  updateAttributes: (attributes: any) => apiClient.put('/attributes', attributes),
};

// 导出事件相关的方法
export const eventApi = {
  /**
   * 获取事件列表
   */
  getEvents: (params?: { limit?: number; offset?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get(`/events${query}`);
  },

  /**
   * 创建事件
   */
  createEvent: (eventData: any) => apiClient.post('/events', eventData),

  /**
   * 更新事件
   */
  updateEvent: (id: string, eventData: any) => apiClient.put(`/events/${id}`, eventData),

  /**
   * 删除事件
   */
  deleteEvent: (id: string) => apiClient.delete(`/events/${id}`),
};

// 导出项目事件相关的方法
export const projectEventApi = {
  /**
   * 获取项目事件列表
   */
  getProjectEvents: (params?: { limit?: number; offset?: number; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get(`/project-events${query}`);
  },

  /**
   * 创建项目事件
   */
  createProjectEvent: (projectEventData: any) => apiClient.post('/project-events', projectEventData),

  /**
   * 更新项目事件
   */
  updateProjectEvent: (id: string, projectEventData: any) => 
    apiClient.put(`/project-events/${id}`, projectEventData),

  /**
   * 更新项目事件进度
   */
  updateProjectEventProgress: (id: string, progressData: { change: number; reason?: string }) => 
    apiClient.patch(`/project-events/${id}/progress`, progressData),

  /**
   * 删除项目事件
   */
  deleteProjectEvent: (id: string) => apiClient.delete(`/project-events/${id}`),
};

// 导出道具相关的方法
export const itemApi = {
  /**
   * 获取道具列表
   */
  getItems: (params?: { type?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get(`/items${query}`);
  },

  /**
   * 创建道具
   */
  createItem: (itemData: any) => apiClient.post('/items', itemData),

  /**
   * 更新道具
   */
  updateItem: (id: string, itemData: any) => apiClient.put(`/items/${id}`, itemData),

  /**
   * 使用道具
   */
  useItem: (id: string) => apiClient.post(`/items/${id}/use`),

  /**
   * 删除道具
   */
  deleteItem: (id: string) => apiClient.delete(`/items/${id}`),
};

// 导出成就相关的方法
export const achievementApi = {
  /**
   * 获取成就列表
   */
  getAchievements: (params?: { status?: string; type?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.get(`/achievements${query}`);
  },

  /**
   * 创建自定义成就
   */
  createAchievement: (achievementData: any) => apiClient.post('/achievements', achievementData),

  /**
   * 解锁成就
   */
  unlockAchievement: (id: string) => apiClient.patch(`/achievements/${id}/unlock`),

  /**
   * 删除自定义成就
   */
  deleteAchievement: (id: string) => apiClient.delete(`/achievements/${id}`),
};

// 导出配置相关的方法
export const configApi = {
  /**
   * 获取用户配置
   */
  getConfig: () => apiClient.get('/config'),

  /**
   * 更新用户配置
   */
  updateConfig: (configData: any) => apiClient.put('/config', configData),
};

// 导出数据导入导出相关的方法
export const dataService = {
  /**
   * 导出用户数据
   */
  exportData: () => {
    return apiClient.get<Blob>('/data/export');
  },
};

export default apiClient;
