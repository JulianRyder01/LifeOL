import { useState, useEffect } from 'react';
import { Item } from '../../types/app.types';
import { loadItems, getInitialItems, saveItems } from '../../utils/storage';
import { Attributes } from '../../types/app.types';

export const useItems = () => {
  const [items, setItems] = useState<Item[]>(() => {
    return loadItems() || getInitialItems();
  });

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    const newItem: Item = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString()
    };
    
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates } 
          : item
      )
    );
  };

  const useItem = (item: Item) => {
    // Mark item as used with timestamp
    const updatedItems = items.map(i => 
      i.id === item.id ? { ...i, used: true, usedAt: new Date().toISOString() } : i
    );
    setItems(updatedItems);
    return updatedItems;
  };

  const undoUseItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.used) return null;
    
    // 检查是否超过两小时
    const usedTime = new Date(item.usedAt || new Date());
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - usedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 2) {
      alert('超过两小时，无法撤销使用');
      return null;
    }
    
    // Mark item as unused
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, used: false } : item
    );
    setItems(updatedItems);
    return updatedItems;
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    useItem,
    undoUseItem
  };
};