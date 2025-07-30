/**
 * 用户配置相关类型定义
 */

export interface UserConfig {
  /**
   * 用户名
   */
  username: string;
  
  /**
   * 用户头像
   */
  avatar: string;
}

export interface AppConfig {
  /**
   * 是否不显示任务完成确认提示
   */
  dontShowTaskCompleteConfirm?: boolean;
  
  /**
   * 选择的称号ID数组
   */
  selectedTitles?: string[];
}