import { Attributes, Event, Item, ProjectEvent } from '../types/app.types';
import { APP_CONFIG } from './config';

// Storage keys
const STORAGE_KEYS = APP_CONFIG.STORAGE_KEYS;

// Save attributes to localStorage
function saveAttributes(attributes: Attributes): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTES, JSON.stringify(attributes));
  } catch (error) {
    console.error('Failed to save attributes:', error);
  }
}

// Load attributes from localStorage
function loadAttributes(): Attributes | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTRIBUTES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load attributes:', error);
    return null;
  }
}

// Save events to localStorage
function saveEvents(events: Event[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events:', error);
  }
}

// Load events from localStorage
function loadEvents(): Event[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load events:', error);
    return null;
  }
}

// Get initial attributes with default values
function getInitialAttributes(): Attributes {
  return {
    int: { level: 1, exp: 0 },
    str: { level: 1, exp: 0 },
    vit: { level: 1, exp: 0 },
    cha: { level: 1, exp: 0 },
    eq: { level: 1, exp: 0 },
    cre: { level: 1, exp: 0 }
  };
}

// Save items to localStorage
function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save items:', error);
  }
}

// Load items from localStorage
function loadItems(): Item[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load items:', error);
    return null;
  }
}

// Get initial items with sample items
function getInitialItems(): Item[] {
  return [
    {
      id: 'sample-item-1',
      name: '地球仪',
      description: 'LifeOL官方为了纪念你到来，给你献上的小礼物~',
      icon: '🌍',
      type: 'trophy',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-item-2',
      name: '探索LifeOL使用指南',
      description: '通过探索LifeOL的各个功能，激发你的创造力',
      icon: '📘',
      type: 'consumable',
      effects: [
        {
          attribute: 'cre',
          type: 'fixed',
          value: 10
        }
      ],
      createdAt: new Date().toISOString()
    }
  ];
}

// Save project events to localStorage
function saveProjectEvents(projectEvents: ProjectEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECT_EVENTS, JSON.stringify(projectEvents));
  } catch (error) {
    console.error('Failed to save project events:', error);
  }
}

// Load project events from localStorage
function loadProjectEvents(): ProjectEvent[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_EVENTS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load project events:', error);
    return null;
  }
}

// Get initial project events with sample project
function getInitialProjectEvents(): ProjectEvent[] {
  return [
    {
      id: 'sample-project-1',
      title: '熟悉LifeOL的使用',
      description: '慢慢熟悉使用吧~随着渐渐熟悉，可以点击下方各种按钮让进度达到100%，或点击"标记完成"来直接完成这个任务哦！',
      progress: 0,
      createdAt: new Date().toISOString()
    }
  ];
}

interface ConsumableUsage {
  [itemId: string]: {
    usedCount: number;
    lastUsedTime: number;
  };
}

// Save consumable usage to localStorage
function saveConsumableUsage(usage: ConsumableUsage): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONSUMABLE_USAGE, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to save consumable usage:', error);
  }
}

// Load consumable usage from localStorage
function loadConsumableUsage(): ConsumableUsage | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONSUMABLE_USAGE);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load consumable usage:', error);
    return null;
  }
}

export {
  saveAttributes,
  loadAttributes,
  getInitialAttributes,
  saveEvents,
  loadEvents,
  getInitialItems,
  saveItems,
  loadItems,
  saveProjectEvents,
  loadProjectEvents,
  getInitialProjectEvents,
  saveConsumableUsage,
  loadConsumableUsage
};