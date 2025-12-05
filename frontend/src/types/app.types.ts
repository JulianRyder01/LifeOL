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
  useMarkdown?: boolean;
  relatedItemId?: string;
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
  progressLog?: ProjectEventProgressLog[];
  customProgressButtons?: ProgressButtonConfig[];
  useMarkdown?: boolean;
}

export interface ItemEffect {
  attribute: keyof Attributes;
  type: 'fixed' | 'percentage';
  value: number;
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
  usedAt?: string;
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

export interface UserConfig {
  username: string;
  avatar: string;
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

// 定义 Context 类型，解决 TS2739 和 TS2339 错误
export interface AppContextType {
  // States
  attributes: Attributes;
  events: Event[];
  achievements: Achievement[];
  items: Item[];
  projectEvents: ProjectEvent[];
  selectedTitles: string[];
  userConfig: UserConfig;
  showFirstTimeGuide: boolean;
  showEventModal: boolean;
  setShowEventModal: (show: boolean) => void;
  showAchievementModal: boolean;
  setShowAchievementModal: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showUseItemModal: boolean;
  setShowUseItemModal: (show: boolean) => void;
  itemToUse: Item | null;
  setItemToUse: (item: Item | null) => void;
  showAllActivities: boolean;
  setShowAllActivities: (show: boolean) => void;
  
  // Functions
  handleAddEvent: (eventData: { title: string; description: string; expGains: Record<string, number> }) => void;
  handleDeleteEvent: (id: string) => void;
  handleUpdateEvent: (id: string, updatedEvent: Partial<Event>) => void;
  handleAddItem: (itemData: Omit<Item, 'id' | 'createdAt'>) => void;
  handleUseItem: (item: Item) => void;
  confirmUseItem: () => void;
  undoUseItem: (itemId: string) => void;
  handleUpdateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => void;
  handleTitleChange: (titleIds: string[]) => void;
  handleAddProjectEvent: (projectEventData: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  handleEditProjectEvent: (id: string, updates: Partial<ProjectEvent>) => void;
  handleUpdateProjectEvent: (id: string, progress: number, reason?: string) => void;
  handleCompleteProjectEvent: (id: string) => void;
  handleResetProjectEvent: (id: string) => void;
  handleDeleteProjectEvent: (id: string) => void;
  getRecentActivities: () => (Event & { type: string })[];
  formatActivityTime: (timestamp: string) => string;
  handleAddCustomAchievement: (achievementData: Partial<Achievement>) => void;
  handleAddCustomTitle: (titleData: Partial<Achievement>) => void;
  handleAddCustomBadge: (badgeData: Partial<Achievement>) => void;
  createCustomCondition: (triggerType: string, condition: string) => (attributes: Attributes, events: Event[]) => boolean;
  handleUserConfigChange: (newConfig: UserConfig) => void;
  attributeNames: Record<string, string>;
  
  // 新增缺失的方法定义
  handleImportData: (file: File, setStatus: (status: { type: 'success' | 'error' | null; message: string }) => void) => void;
  handleResetData: () => void;
}