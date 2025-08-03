export interface Attribute {
  level: number;
  exp: number;
}

export interface Attributes {
  int: Attribute; // 智识
  phy: Attribute; // 体魄
  wil: Attribute; // 意志
  cha: Attribute; // 魅力
  men: Attribute; // 心境
  cre: Attribute; // 创造
}

export interface Event {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  expGains: Record<string, number>;
  useMarkdown?: boolean; // 添加Markdown支持选项
  relatedItemId?: string; // 添加关联道具ID字段
}

// TODO: Add support for long-term events with progress tracking
export interface ProjectEventProgressLog {
  change: number;
  reason?: string;
  timestamp: string;
}

export interface ProgressButtonConfig {
  label: string;
  value: number;
}

export interface ProjectEvent {
  id: string;
  title: string;
  description?: string;
  progress: number;
  attributeRewards?: Record<string, number>;
  itemRewards?: string[];
  createdAt: string;
  completedAt?: string;
  progressLog?: ProjectEventProgressLog[]; // 进度变更记录
  customProgressButtons?: ProgressButtonConfig[]; // 自定义进度按钮
  useMarkdown?: boolean; // 添加Markdown支持选项
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'equipment' | 'consumable' | 'trophy'; // 装备/消耗品/收藏品
  effects?: ItemEffect[];
  createdAt: string;
  used?: boolean;
  usedAt?: string; // 添加使用时间字段
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
  // For markdown support
  useMarkdown?: boolean;
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