/**
 * 道具相关类型定义
 */

export interface ItemEffect {
  /**
   * 影响的属性
   */
  attribute: string;
  
  /**
   * 效果类型：固定值或百分比
   */
  type: 'fixed' | 'percentage';
  
  /**
   * 效果值
   */
  value: number;
}

export interface Item {
  /**
   * 道具唯一标识符
   */
  id: string;
  
  /**
   * 道具名称
   */
  name: string;
  
  /**
   * 道具描述
   */
  description: string;
  
  /**
   * 道具图标
   */
  icon: string;
  
  /**
   * 道具类型
   * - equipment: 装备
   * - consumable: 消耗品
   * - trophy: 收藏品
   */
  type: 'equipment' | 'consumable' | 'trophy';
  
  /**
   * 道具效果（可选）
   */
  effects?: ItemEffect[];
  
  /**
   * 创建时间
   */
  createdAt: string;
  
  /**
   * 是否已使用（可选）
   */
  used?: boolean;
  
  /**
   * 使用时间（可选）
   */
  usedAt?: string;
}