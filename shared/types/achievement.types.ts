/**
 * 成就相关类型定义
 */

export interface Achievement {
  /**
   * 成就唯一标识符
   */
  id: string;
  
  /**
   * 成就标题
   */
  title: string;
  
  /**
   * 成就描述
   */
  description: string;
  
  /**
   * 成就图标
   */
  icon: string;
  
  /**
   * 是否为自定义成就
   */
  isCustom?: boolean;
  
  /**
   * 解锁时间，未解锁为null
   */
  unlockedAt: string | null;
  
  /**
   * 触发类型（可选）
   */
  triggerType?: string;
  
  /**
   * 触发条件（可选）
   */
  triggerCondition?: string;
  
  /**
   * 进度（可选）
   */
  progress?: number;
  
  /**
   * 目标值（可选）
   */
  target?: number;
  
  /**
   * 是否为称号
   */
  isTitle?: boolean;
  
  /**
   * 属性要求（可选）
   */
  attributeRequirement?: string;
  
  /**
   * 等级要求（可选）
   */
  levelRequirement?: number;
}