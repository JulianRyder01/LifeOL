import { Attributes, Event, Achievement, DecayConfig, DecayWarning } from '../types/app.types';
import { calculateLevel, getExpForLevel } from './calculations';
import { APP_CONFIG } from './config';

// Achievement system utilities

// Get initial achievements (system-defined)
function getInitialAchievements(): Achievement[] {
  return [
    // I. 属性成长系列 (Attribute Growth Series)
    // 智力成就
    {
      id: 'int_novice',
      title: '初窥门径',
      description: '智力达到5级',
      icon: 'book-open',
      condition: (attributes) => attributes.int.level >= 5,
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'int_scholar',
      title: '博学者',
      description: '智力达到10级',
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
      condition: (attributes) => attributes.str.level >= 5,
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'str_robust',
      title: '身强体健',
      description: '体魄达到10级',
      icon: 'shield',
      condition: (attributes) => attributes.str.level >= 10,
      isCustom: false,
      unlockedAt: null
    },
    // 精力成就
    {
      id: 'vit_respite',
      title: '稍作休憩',
      description: '精力达到5级',
      icon: 'battery',
      condition: (attributes) => attributes.vit.level >= 5,
      isCustom: false,
      unlockedAt: null
    },
    // 社交成就
    {
      id: 'cha_encounter',
      title: '初次见面',
      description: '社交达到5级',
      icon: 'users',
      condition: (attributes) => attributes.cha.level >= 5,
      isCustom: false,
      unlockedAt: null
    },
    // 情感成就
    {
      id: 'eq_awareness',
      title: '情绪感知',
      description: '情感达到5级',
      icon: 'heart',
      condition: (attributes) => attributes.eq.level >= 5,
      isCustom: false,
      unlockedAt: null
    },
    // 创造成就
    {
      id: 'cre_inspiration',
      title: '灵感萌芽',
      description: '创造达到5级',
      icon: 'palette',
      condition: (attributes) => attributes.cre.level >= 5,
      isCustom: false,
      unlockedAt: null
    },

    // II. 行为习惯系列 (Behavior & Habit Series)
    {
      id: 'first_event',
      title: '初出茅庐',
      description: '记录第一个人生事件',
      icon: 'calendar',
      condition: (attributes, events) => events.length >= 1,
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'consistency_beacon',
      title: '持续之光',
      description: '连续7天记录事件',
      icon: 'flame',
      condition: (attributes, events) => {
        if (events.length < 7) return false;
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() - i);
          const hasEventOnDate = events.some(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate.toDateString() === targetDate.toDateString();
          });
          if (!hasEventOnDate) return false;
        }
        return true;
      },
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'balanced_weekly',
      title: '雨露均沾',
      description: '一周内为所有6个属性都增加经验',
      icon: 'target',
      condition: (attributes, events) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentEvents = events.filter(event => new Date(event.timestamp) > weekAgo);
        
        const attributesTouched = new Set();
        recentEvents.forEach(event => {
          Object.entries(event.expGains).forEach(([attr, exp]) => {
            if (exp > 0) attributesTouched.add(attr);
          });
        });
        
        return attributesTouched.size >= 6;
      },
      isCustom: false,
      unlockedAt: null
    },

    // III. 里程碑系列 (Milestone Series)
    {
      id: 'century_events',
      title: '百炼成钢',
      description: '累计记录100个事件',
      icon: 'trophy',
      condition: (attributes, events) => events.length >= 100,
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'all_level_10',
      title: '六边形战士',
      description: '所有属性都达到10级',
      icon: 'hexagon',
      condition: (attributes) => Object.values(attributes).every(attr => attr.level >= 10),
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'month_user',
      title: '人生旅者',
      description: '使用应用满30天',
      icon: 'map',
      condition: (attributes, events) => {
        if (events.length === 0) return false;
        const firstEvent = events[events.length - 1];
        const daysSinceFirst = Math.floor((new Date().getTime() - new Date(firstEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceFirst >= 30;
      },
      isCustom: false,
      unlockedAt: null
    },

    // IV. 特殊事件系列 (Special Event Series)
    {
      id: 'new_horizons',
      title: '探索新境',
      description: '记录一次旅行或探险经历',
      icon: 'compass',
      condition: (attributes, events) => {
        const keywords = ['旅行', '探险', '新城市', '旅游', '出差', '远行'];
        return events.some(event => 
          keywords.some(keyword => 
            event.title.includes(keyword) || event.description.includes(keyword)
          )
        );
      },
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'deep_thinker',
      title: '灵光乍现',
      description: '写下超过200字的深度感悟',
      icon: 'lightbulb',
      condition: (attributes, events) => {
        return events.some(event => event.description && event.description.length >= 200);
      },
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'helping_hand',
      title: '助人为乐',
      description: '记录一次帮助他人的经历',
      icon: 'hand-heart',
      condition: (attributes, events) => {
        const keywords = ['帮助', '志愿', '分享', '支持', '协助', '服务'];
        return events.some(event => 
          keywords.some(keyword => 
            event.title.includes(keyword) || event.description.includes(keyword)
          ) && (event.expGains.cha > 0 || event.expGains.eq > 0)
        );
      },
      isCustom: false,
      unlockedAt: null
    },
    {
      id: 'breakthrough',
      title: '突破自我',
      description: '单次事件获得超过30经验值',
      icon: 'mountain',
      condition: (attributes, events) => {
        return events.some(event => {
          const totalExp = Object.values(event.expGains).reduce((sum, exp) => sum + exp, 0);
          return totalExp >= 30;
        });
      },
      isCustom: false,
      unlockedAt: null
    },

    // V. 称号成就 (Title Achievements)
    {
      id: 'title_int_5',
      title: '智慧新星',
      description: '智力达到5级后可获得的称号',
      icon: 'star',
      isCustom: false,
      unlockedAt: null,
      isTitle: true,
      attributeRequirement: 'int',
      levelRequirement: 5
    },
    {
      id: 'title_int_10',
      title: '知识大师',
      description: '智力达到10级后可获得的称号',
      icon: 'crown',
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
      attributeRequirement: 'str',
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
      attributeRequirement: 'str',
      levelRequirement: 10
    },
    {
      id: 'title_vit_5',
      title: '活力先锋',
      description: '精力达到5级后可获得的称号',
      icon: 'battery-full',
      isCustom: false,
      unlockedAt: null,
      isTitle: true,
      attributeRequirement: 'vit',
      levelRequirement: 5
    },
    {
      id: 'title_cha_5',
      title: '社交达人',
      description: '社交达到5级后可获得的称号',
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
      description: '情感达到5级后可获得的称号',
      icon: 'heartbeat',
      isCustom: false,
      unlockedAt: null,
      isTitle: true,
      attributeRequirement: 'eq',
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
}

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
function calculateAchievementProgress(achievement: Achievement, attributes: Attributes, events: Event[]): number {
  // For unlocked achievements, always show 100% progress
  if (achievement.unlockedAt) {
    return 100;
  }
  
  // For title achievements
  if (achievement.isTitle && achievement.attributeRequirement && achievement.levelRequirement) {
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
      return Math.min(100, (attributes.str.level / 5) * 100);
    case 'str_robust':
      return Math.min(100, (attributes.str.level / 10) * 100);
    case 'vit_respite':
      return Math.min(100, (attributes.vit.level / 5) * 100);
    case 'cha_encounter':
      return Math.min(100, (attributes.cha.level / 5) * 100);
    case 'eq_awareness':
      return Math.min(100, (attributes.eq.level / 5) * 100);
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
    str: [],
    vit: [],
    cha: [],
    eq: [],
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
const DECAY_CONFIG: Record<string, DecayConfig> = {
  int: { inactiveThreshold: 14, decayRate: 0.005 }, // 14 days, 0.5% per day
  str: { inactiveThreshold: 7, decayRate: 0.01 },   // 7 days, 1% per day
  vit: { inactiveThreshold: 5, decayRate: 0.008 },  // 5 days, 0.8% per day
  cha: { inactiveThreshold: 10, decayRate: 0.007 }, // 10 days, 0.7% per day
  eq: { inactiveThreshold: 12, decayRate: 0.006 },  // 12 days, 0.6% per day
  cre: { inactiveThreshold: 21, decayRate: 0.004 }  // 21 days, 0.4% per day
};

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
  getInitialAchievements, 
  checkAchievements, 
  calculateAchievementProgress,
  getAvailableTitles,
  saveAchievements, 
  loadAchievements, 
  checkAttributeDecay, 
  getDecayWarnings,
  DECAY_CONFIG
};