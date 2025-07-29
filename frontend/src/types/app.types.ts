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

// TODO: Add support for long-term events with progress tracking
export interface ProjectEvent {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  attributeRewards?: Record<string, number>;
  itemRewards?: string[]; // IDs of items to reward
  createdAt: string;
  completedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string; // Could be emoji, URL to image, or AI-generated image identifier
  type: 'equipment' | 'consumable' | 'trophy';
  effects?: ItemEffect[];
  createdAt: string;
  used?: boolean; // Track if a consumable item has been used
}

export interface ItemEffect {
  attribute: keyof Attributes; // Which attribute this affects
  type: 'fixed' | 'percentage'; // Fixed value or percentage boost
  value: number; // The value of the effect
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
  // For progress tracking
  progress?: number;
  target?: number;
  // For titles
  isTitle?: boolean;
  attributeRequirement?: keyof Attributes;
  levelRequirement?: number;
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

export interface UserConfig {
  username: string;
  avatar: string;
}