import { Attributes, Event } from '../types/app.types';

// Local storage utilities for persisting user data
const STORAGE_KEYS = {
  ATTRIBUTES: 'lifeol_attributes',
  EVENTS: 'lifeol_events'
};

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

export { saveAttributes, loadAttributes, saveEvents, loadEvents, getInitialAttributes };