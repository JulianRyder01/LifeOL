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
   * 智识 (INTelligence)
   */
  int: Attribute;
  
  /**
   * 体魄 (PHYsique)
   */
  phy: Attribute;
  
  /**
   * 意志 (WILlpower)
   */
  wil: Attribute;
  
  /**
   * 魅力 (CHArisma)
   */
  cha: Attribute;
  
  /**
   * 心境 (MENtality)
   */
  men: Attribute;
  
  /**
   * 创造 (CREativity)
   */
  cre: Attribute;
}

/**
 * 属性配置接口，包含属性的显示名称、图标和颜色等信息
 */
export interface AttributeConfig {
  key: keyof Attributes;
  name: string;
  icon: string;
  color: string;
}

/**
 * 所有属性的配置信息，集中管理便于维护
 */
export const ATTRIBUTE_CONFIG: Record<keyof Attributes, AttributeConfig> = {
  int: {
    key: 'int',
    name: '智识',
    icon: 'book-open',
    color: 'var(--int-color)'
  },
  phy: {
    key: 'phy',
    name: '体魄',
    icon: 'dumbbell',
    color: 'var(--str-color)'
  },
  wil: {
    key: 'wil',
    name: '意志',
    icon: 'battery',
    color: 'var(--vit-color)'
  },
  cha: {
    key: 'cha',
    name: '魅力',
    icon: 'users',
    color: 'var(--cha-color)'
  },
  men: {
    key: 'men',
    name: '心境',
    icon: 'heart',
    color: 'var(--eq-color)'
  },
  cre: {
    key: 'cre',
    name: '创造',
    icon: 'palette',
    color: 'var(--cre-color)'
  }
};

/**
 * 属性类型列表，便于遍历所有属性
 */
export const ATTRIBUTE_KEYS: (keyof Attributes)[] = ['int', 'phy', 'wil', 'cha', 'men', 'cre'];

/**
 * 获取属性的显示名称
 * @param attributeKey 属性键名
 * @returns 属性显示名称
 */
export function getAttributeName(attributeKey: keyof Attributes): string {
  return ATTRIBUTE_CONFIG[attributeKey]?.name || attributeKey;
}

/**
 * 获取属性的完整配置
 * @param attributeKey 属性键名
 * @returns 属性配置对象
 */
export function getAttributeConfig(attributeKey: keyof Attributes): AttributeConfig {
  return ATTRIBUTE_CONFIG[attributeKey];
}