import { Attributes, Event, Achievement, DecayConfig, DecayWarning } from '../types/app.types';
import { calculateLevel, getExpForLevel } from './calculations';
import { APP_CONFIG } from './config';

// Achievement system utilities

// Get initial achievements (system-defined)
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // 智识成就
  {
    id: 'int_novice',
    title: '初窥门径',
    description: '智识达到5级',
    icon: 'book',
    condition: (attributes) => attributes.int.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  {
    id: 'int_scholar',
    title: '学富五车',
    description: '智识达到10级',
    icon: 'graduation-cap',
    condition: (attributes) => attributes.int.level >= 10,
    isCustom: false,
    unlockedAt: null
  },
  // 体魄成就
  {
    id: 'str_beginner',
    title: '小试牛刀',
    description: '体魄达到5级',
    icon: 'dumbbell',
    condition: (attributes) => attributes.phy.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  {
    id: 'str_robust',
    title: '身强体健',
    description: '体魄达到10级',
    icon: 'shield',
    condition: (attributes) => attributes.phy.level >= 10,
    isCustom: false,
    unlockedAt: null
  },
  // 意志成就
  {
    id: 'vit_respite',
    title: '稍作休憩',
    description: '意志达到5级',
    icon: 'battery',
    condition: (attributes) => attributes.wil.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  // 魅力成就
  {
    id: 'cha_encounter',
    title: '初次见面',
    description: '魅力达到5级',
    icon: 'users',
    condition: (attributes) => attributes.cha.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  // 心境成就
  {
    id: 'eq_awareness',
    title: '情绪感知',
    description: '心境达到5级',
    icon: 'heart',
    condition: (attributes) => attributes.men.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  // 创造成就
  {
    id: 'cre_inspiration',
    title: '灵感迸发',
    description: '创造达到5级',
    icon: 'palette',
    condition: (attributes) => attributes.cre.level >= 5,
    isCustom: false,
    unlockedAt: null
  },
  // 综合成就
  {
    id: 'first_event',
    title: '初探人生',
    description: '记录第一个事件',
    icon: 'calendar-check',
    condition: (attributes, events) => events.length >= 1,
    isCustom: false,
    unlockedAt: null
  },
  {
    id: 'consistency_beacon',
    title: '持之以恒',
    description: '连续7天记录事件',
    icon: 'bolt',
    condition: (attributes, events) => {
      // Check for 7 consecutive days of events
      let consecutiveDays = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);
        const hasEventOnDate = events.some(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate.toDateString() === targetDate.toDateString();
        });
        if (hasEventOnDate) {
          consecutiveDays++;
        } else {
          break;
        }
      }
      return consecutiveDays >= 7;
    },
    isCustom: false,
    unlockedAt: null
  },
  {
    id: 'century_events',
    title: '百事通',
    description: '累计记录100个事件',
    icon: 'book-open',
    condition: (attributes, events) => events.length >= 100,
    isCustom: false,
    unlockedAt: null
  },
  {
    id: 'all_level_10',
    title: '六边形战士',
    description: '所有属性均达到10级',
    icon: 'star',
    condition: (attributes) => {
      return Object.values(attributes).every(attr => attr.level >= 10);
    },
    isCustom: false,
    unlockedAt: null
  },
  // 称号类成就
  {
    id: 'title_int_5',
    title: '智识新秀',
    description: '智识达到5级后可获得的称号',
    icon: 'lightbulb',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'int',
    levelRequirement: 5
  },
  {
    id: 'title_int_10',
    title: '智慧大师',
    description: '智识达到10级后可获得的称号',
    icon: 'brain',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'int',
    levelRequirement: 10
  },
  {
    id: 'title_str_5',
    title: '力量新秀',
    description: '体魄达到5级后可获得的称号',
    icon: 'bolt',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'phy',
    levelRequirement: 5
  },
  {
    id: 'title_str_10',
    title: '体魄王者',
    description: '体魄达到10级后可获得的称号',
    icon: 'shield-alt',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'phy',
    levelRequirement: 10
  },
  {
    id: 'title_vit_5',
    title: '活力先锋',
    description: '意志达到5级后可获得的称号',
    icon: 'battery-full',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'wil',
    levelRequirement: 5
  },
  {
    id: 'title_cha_5',
    title: '社交达人',
    description: '魅力达到5级后可获得的称号',
    icon: 'user-friends',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'cha',
    levelRequirement: 5
  },
  {
    id: 'title_eq_5',
    title: '情感专家',
    description: '心境达到5级后可获得的称号',
    icon: 'heartbeat',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'men',
    levelRequirement: 5
  },
  {
    id: 'title_cre_5',
    title: '创意天才',
    description: '创造达到5级后可获得的称号',
    icon: 'paint-brush',
    isCustom: false,
    unlockedAt: null,
    isTitle: true,
    attributeRequirement: 'cre',
    levelRequirement: 5
  }
];

// 属性衰减配置
export const DECAY_CONFIG: Record<string, { inactiveThreshold: number; decayRate: number }> = {
  phy: { inactiveThreshold: 3, decayRate: 0.05 }, // 体魄3天未活动，每天衰减5%
  wil: { inactiveThreshold: 5, decayRate: 0.03 }, // 意志5天未活动，每天衰减3%
  cha: { inactiveThreshold: 7, decayRate: 0.02 }, // 魅力7天未活动，每天衰减2%
  men: { inactiveThreshold: 4, decayRate: 0.04 }, // 心境4天未活动，每天衰减4%
  cre: { inactiveThreshold: 6, decayRate: 0.025 } // 创造6天未活动，每天衰减2.5%
};

// Check for newly unlocked achievements
function checkAchievements(attributes: Attributes, events: Event[], currentAchievements: Achievement[]): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  currentAchievements.forEach(achievement => {
    // Skip already unlocked achievements
    if (achievement.unlockedAt) return;
    
    // For title achievements
    if (achievement.isTitle && achievement.attributeRequirement && achievement.levelRequirement) {
      if (attributes[achievement.attributeRequirement].level >= achievement.levelRequirement) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    } 
    // For regular achievements with conditions (both built-in and custom)
    else if (achievement.condition) {
      if (achievement.condition(attributes, events)) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    }
  });
  
  return newlyUnlocked;
}

// Calculate achievement progress
export function calculateAchievementProgress(
  achievement: Achievement, 
  attributes: Attributes, 
  events: Event[]
): number {
  // For title achievements with level requirements
  if (achievement.isTitle && achievement.levelRequirement && achievement.attributeRequirement) {
    const currentLevel = attributes[achievement.attributeRequirement].level;
    return Math.min(100, (currentLevel / achievement.levelRequirement) * 100);
  }
  
  // For regular achievements with conditions
  switch (achievement.id) {
    case 'int_novice':
      return Math.min(100, (attributes.int.level / 5) * 100);
    case 'int_scholar':
      return Math.min(100, (attributes.int.level / 10) * 100);
    case 'str_beginner':
      return Math.min(100, (attributes.phy.level / 5) * 100);
    case 'str_robust':
      return Math.min(100, (attributes.phy.level / 10) * 100);
    case 'vit_respite':
      return Math.min(100, (attributes.wil.level / 5) * 100);
    case 'cha_encounter':
      return Math.min(100, (attributes.cha.level / 5) * 100);
    case 'eq_awareness':
      return Math.min(100, (attributes.men.level / 5) * 100);
    case 'cre_inspiration':
      return Math.min(100, (attributes.cre.level / 5) * 100);
    case 'first_event':
      return Math.min(100, (events.length / 1) * 100);
    case 'consistency_beacon':
      // Check how many consecutive days we have
      let consecutiveDays = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);
        const hasEventOnDate = events.some(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate.toDateString() === targetDate.toDateString();
        });
        if (hasEventOnDate) {
          consecutiveDays++;
        } else {
          break;
        }
      }
      return (consecutiveDays / 7) * 100;
    case 'century_events':
      return Math.min(100, (events.length / 100) * 100);
    case 'all_level_10':
      const levels = Object.values(attributes).map(attr => attr.level);
      const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      return Math.min(100, (avgLevel / 10) * 100);
    default:
      // For custom achievements or those without specific progress logic, return 0
      return 0;
  }
}

// Get available titles for each attribute
function getAvailableTitles(achievements: Achievement[], attributes: Attributes): Record<string, Achievement[]> {
  const titles: Record<string, Achievement[]> = {
    int: [],
    phy: [],
    wil: [],
    cha: [],
    men: [],
    cre: []
  };
  
  achievements
    .filter(a => a.isTitle && a.unlockedAt)
    .forEach(title => {
      if (title.attributeRequirement) {
        titles[title.attributeRequirement].push(title);
      }
    });
  
  return titles;
}

// Save achievements to localStorage
function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

// Load achievements from localStorage
function loadAchievements(): Achievement[] | null {
  try {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load achievements:', error);
    return null;
  }
}

// Attribute decay system

// Check and apply attribute decay
function checkAttributeDecay(attributes: Attributes, events: Event[]): { updatedAttributes: Attributes, warnings: DecayWarning[] } {
  const now = new Date();
  const updatedAttributes = { ...attributes };
  const warnings: DecayWarning[] = [];
  
  Object.keys(attributes).forEach(attrKey => {
    const config = DECAY_CONFIG[attrKey];
    if (!config) return;
    
    // Find last event for this attribute
    const lastEvent = events.find(event => event.expGains[attrKey] > 0);
    
    if (!lastEvent) return;
    
    const daysSinceLastEvent = Math.floor(
      (now.getTime() - new Date(lastEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastEvent > config.inactiveThreshold) {
      const decayDays = daysSinceLastEvent - config.inactiveThreshold;
      const currentExp = attributes[attrKey as keyof Attributes].exp;
      const decayAmount = Math.floor(currentExp * config.decayRate * decayDays);
      
      if (decayAmount > 0) {
        const newExp = Math.max(0, currentExp - decayAmount);
        updatedAttributes[attrKey as keyof Attributes] = {
          ...attributes[attrKey as keyof Attributes],
          exp: newExp,
          level: calculateLevel(newExp)
        };
        
        warnings.push({
          attribute: attrKey,
          daysSinceLastEvent,
          decayAmount
        });
      }
    }
  });
  
  return { updatedAttributes, warnings };
}

// Get decay warnings for attributes approaching decay threshold
function getDecayWarnings(attributes: Attributes, events: Event[]): DecayWarning[] {
  const now = new Date();
  const warnings: DecayWarning[] = [];
  
  Object.keys(attributes).forEach(attrKey => {
    const config = DECAY_CONFIG[attrKey];
    if (!config) return;
    
    const lastEvent = events.find(event => event.expGains[attrKey] > 0);
    if (!lastEvent) return;
    
    const daysSinceLastEvent = Math.floor(
      (now.getTime() - new Date(lastEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const daysUntilDecay = config.inactiveThreshold - daysSinceLastEvent;
    
    if (daysUntilDecay <= 2 && daysUntilDecay > 0) {
      warnings.push({
        attribute: attrKey,
        daysUntilDecay
      });
    }
  });
  
  return warnings;
}

export { 
  checkAchievements, 
  getAvailableTitles,
  saveAchievements, 
  loadAchievements, 
  checkAttributeDecay, 
  getDecayWarnings,
};
