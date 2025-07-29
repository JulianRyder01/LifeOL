export interface Attribute {
  level: number;
  exp: number;
}

export interface Attributes {
  int: Attribute; // 智力
  str: Attribute; // 体魄
  vit: Attribute; // 精力
  cha: Attribute; // 社交
  eq: Attribute;  // 情感
  cre: Attribute; // 创造
}

export interface Event {
  id: string;
  title: string;
  description: string;
  expGains: Record<string, number>;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isCustom?: boolean;
  unlockedAt: string | null;
  triggerType?: string;
  triggerCondition?: string;
  condition?: (attributes: Attributes, events: Event[]) => boolean;
}

export interface AttributeConfig {
  name: string;
  icon: string;
  color: string;
}

export interface DecayConfig {
  inactiveThreshold: number;
  decayRate: number;
}

export interface DecayWarning {
  attribute: string;
  daysSinceLastEvent?: number;
  decayAmount?: number;
  daysUntilDecay?: number;
}