/**
 * 事件相关类型定义
 */

export interface Event {
  /**
   * 事件唯一标识符
   */
  id: string;
  
  /**
   * 事件标题
   */
  title: string;
  
  /**
   * 事件描述
   */
  description: string;
  
  /**
   * 事件时间戳
   */
  timestamp: string;
  
  /**
   * 经验值增益记录
   * 键为属性名，值为获得的经验值
   */
  expGains: Record<string, number>;
  
  /**
   * 关联道具ID（可选）
   */
  relatedItemId?: string;
}

export interface ProjectEventProgressLog {
  /**
   * 进度变化值，正数表示增加，负数表示减少
   */
  change: number;
  
  /**
   * 变化原因
   */
  reason: string;
  
  /**
   * 变化时间
   */
  timestamp: string;
}

export interface ProjectEvent {
  /**
   * 项目事件唯一标识符
   */
  id: string;
  
  /**
   * 项目事件标题
   */
  title: string;
  
  /**
   * 项目事件描述（可选）
   */
  description?: string;
  
  /**
   * 项目进度（0-100）
   */
  progress: number;
  
  /**
   * 属性奖励（可选）
   * 键为属性名，值为获得的经验值
   */
  attributeRewards?: Record<string, number>;
  
  /**
   * 道具奖励ID数组（可选）
   */
  itemRewards?: string[];
  
  /**
   * 创建时间
   */
  createdAt: string;
  
  /**
   * 完成时间（可选）
   */
  completedAt?: string;
  
  /**
   * 进度变更记录（可选）
   */
  progressLog?: ProjectEventProgressLog[];
}