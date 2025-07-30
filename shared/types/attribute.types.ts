/**
 * 属性相关类型定义
 */

export interface Attribute {
  /**
   * 属性等级
   */
  level: number;
  
  /**
   * 属性经验值
   */
  exp: number;
}

export interface Attributes {
  /**
   * 智力 (INTelligence)
   */
  int: Attribute;
  
  /**
   * 体魄 (STRength)
   */
  str: Attribute;
  
  /**
   * 精力 (VITality)
   */
  vit: Attribute;
  
  /**
   * 社交 (CHArisma)
   */
  cha: Attribute;
  
  /**
   * 情感 (Emotional Quotient)
   */
  eq: Attribute;
  
  /**
   * 创造 (CREativity)
   */
  cre: Attribute;
}