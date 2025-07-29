import React, { useState } from 'react';
import { Item, ItemEffect } from '../types/app.types';

interface ItemSystemProps {
  items: Item[];
  onAddItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  onUseItem: (item: Item) => void;
  onUndoUseItem: (itemId: string) => void;
  onUpdateItem?: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'used'>>) => void;
  attributeNames?: Record<string, string>;
}

const attributeConfig: Record<string, { name: string; icon: string; color: string }> = {
  int: { name: '智力', icon: 'book-open', color: 'var(--int-color)' },
  str: { name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
  vit: { name: '精力', icon: 'battery', color: 'var(--vit-color)' },
  cha: { name: '社交', icon: 'users', color: 'var(--cha-color)' },
  eq: { name: '情感', icon: 'heart', color: 'var(--eq-color)' },
  cre: { name: '创造', icon: 'palette', color: 'var(--cre-color)' }
};

function ItemSystem({ items, onAddItem, onUseItem, onUndoUseItem, onUpdateItem, attributeNames = {} }: ItemSystemProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    icon: '🎁',
    type: 'consumable' as 'equipment' | 'consumable' | 'trophy',
    effects: [] as ItemEffect[]
  });
  
  // Merge default attribute names with provided ones
  const mergedAttributeNames: Record<string, { name: string; icon: string; color: string } | string> = { ...attributeConfig, ...attributeNames };
  
  const [newEffect, setNewEffect] = useState({
    attribute: 'int' as keyof typeof attributeConfig,
    type: 'fixed' as 'fixed' | 'percentage',
    value: 10
  });

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    onAddItem(newItem);
    setNewItem({
      name: '',
      description: '',
      icon: '🎁',
      type: 'consumable',
      effects: []
    });
    setShowAddForm(false);
  };

  const handleAddEffect = () => {
    setNewItem({
      ...newItem,
      effects: [...newItem.effects, { ...newEffect } as ItemEffect]
    });
    setNewEffect({
      attribute: 'int',
      type: 'fixed',
      value: 10
    });
  };

  const handleRemoveEffect = (index: number) => {
    const newEffects = [...newItem.effects];
    newEffects.splice(index, 1);
    setNewItem({ ...newItem, effects: newEffects });
  };

  // Group items by status
  const unusedItems = items.filter(item => !item.used);
  const usedItems = items.filter(item => item.used);

  // 获取属性名称的辅助函数
  const getAttributeName = (attrKey: string) => {
    const attr = mergedAttributeNames[attrKey];
    if (typeof attr === 'string') {
      return attr;
    }
    return attr?.name || attrKey;
  };

  // Handle adding effect to editing item
  const handleAddEffectToEdit = () => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        effects: [...(editingItem.effects || []), { attribute: 'int', type: 'fixed', value: 10 }]
      });
    }
  };

  // Handle removing effect from editing item
  const handleRemoveEffectFromEdit = (index: number) => {
    if (editingItem && editingItem.effects) {
      const newEffects = [...editingItem.effects];
      newEffects.splice(index, 1);
      setEditingItem({ ...editingItem, effects: newEffects });
    }
  };

  // Handle saving item edits
  const handleSaveItemEdit = () => {
    if (editingItem && onUpdateItem) {
      const { id, createdAt, used, ...updates } = editingItem;
      onUpdateItem(id, updates);
      setIsEditing(false);
      setEditingItem(null);
      setShowItemDetail(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-900">道具系统</h2>
          <div className="group relative ml-2">
            <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-400 cursor-help">
              ?
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-80 bg-gray-800 text-white text-xs rounded py-2 px-3 z-10">
              <p>道具分为收藏品、消耗品、装备三种。</p>
              <p className="mt-1">收藏品和装备都可以选择"装备上身"、"取消装备"（互斥选择），如果选择装备上身，就可以享受收藏品和装备的增益效果。取消装备，则增益效果消失。</p>
              <p className="mt-1">而消耗品使用才会生效，直接获得增益效果。消耗品在使用后两小时内可以撤销使用。</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          添加道具
        </button>
      </div>

      {/* Unused Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">未使用道具</h3>
        {unusedItems.length === 0 ? (
          <p className="text-gray-500">暂无未使用道具</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unusedItems.map(item => {
              const createdAt = new Date(item.createdAt);
              const now = new Date();
              const hoursDiff = Math.abs(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
              const isNew = hoursDiff < 24;
              
              return (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setShowItemDetail(item);
                    setIsEditing(false);
                    setEditingItem(null);
                  }}
                >
                  {isNew && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                  )}
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'equipment' 
                        ? 'bg-blue-100 text-blue-800' 
                        : item.type === 'consumable' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'equipment' ? '装备' : item.type === 'consumable' ? '消耗品' : '收藏品'}
                    </span>
                  </div>
                  {item.effects && item.effects.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {item.effects.map((effect, index) => (
                        <div key={index}>
                          {getAttributeName(effect.attribute)}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                          {effect.type === 'percentage' ? '%' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === 'consumable' && (
                    <button 
                      className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseItem(item);
                      }}
                    >
                      使用
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Used Items */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">已使用道具</h3>
        {usedItems.length === 0 ? (
          <p className="text-gray-500">暂无已使用道具</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {usedItems.map(item => (
              <div 
                key={item.id} 
                className="border border-gray-200 rounded-lg p-4 text-center opacity-60"
                onClick={() => {
                  setShowItemDetail(item);
                  setIsEditing(false);
                  setEditingItem(null);
                }}
              >
                <div className="text-3xl mb-2 grayscale">{item.icon}</div>
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                )}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.type === 'equipment' 
                      ? 'bg-blue-100 text-blue-800' 
                      : item.type === 'consumable' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'equipment' ? '装备' : item.type === 'consumable' ? '消耗品' : '收藏品'}
                  </span>
                </div>
                {item.effects && item.effects.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {item.effects.map((effect, index) => (
                      <div key={index}>
                        {getAttributeName(effect.attribute)}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                        {effect.type === 'percentage' ? '%' : ''}
                      </div>
                    ))}
                  </div>
                )}
                {item.type === 'consumable' && (
                  <button 
                    className="mt-2 w-full text-xs text-gray-600 hover:text-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      // 检查是否超过两小时
                      const usedTime = new Date(item.usedAt || new Date());
                      const now = new Date();
                      const hoursDiff = Math.abs(now.getTime() - usedTime.getTime()) / (1000 * 60 * 60);
                      
                      if (hoursDiff > 2) {
                        alert('超过两小时，无法撤销使用');
                        return;
                      }
                      
                      onUndoUseItem(item.id);
                    }}
                  >
                    撤销使用
                  </button>
                )}
                <div className="text-xs text-gray-400 mt-1">已使用</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加新道具</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <input
                    type="text"
                    value={newItem.icon}
                    onChange={(e) => setNewItem({...newItem, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入emoji或字符"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="equipment">装备</option>
                    <option value="consumable">消耗品</option>
                    <option value="trophy">收藏品</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">效果</label>
                    <button
                      type="button"
                      onClick={handleAddEffect}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      添加效果
                    </button>
                  </div>
                  
                  {newItem.effects.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3 space-y-2">
                      {newItem.effects.map((effect, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm">
                            <span className="font-medium">
                              {getAttributeName(effect.attribute)}
                            </span>
                            <span className="ml-2">
                              {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                              {effect.type === 'percentage' ? '%' : ' EXP'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEffect(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {newItem.effects.length === 0 && (
                    <p className="text-gray-500 text-sm">暂无效果</p>
                  )}
                  
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">属性</label>
                      <select
                        value={newEffect.attribute}
                        onChange={(e) => setNewEffect({...newEffect, attribute: e.target.value as any})}
                        className="mt-1 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      >
                        {Object.entries(attributeConfig).map(([key, config]) => (
                          <option key={key} value={key}>{config.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">类型</label>
                      <select
                        value={newEffect.type}
                        onChange={(e) => setNewEffect({...newEffect, type: e.target.value as any})}
                        className="mt-1 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      >
                        <option value="fixed">固定值</option>
                        <option value="percentage">百分比</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">数值</label>
                      <input
                        type="number"
                        value={newEffect.value}
                        onChange={(e) => setNewEffect({...newEffect, value: parseInt(e.target.value) || 0})}
                        className="mt-1 block w-full px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({
                      name: '',
                      description: '',
                      icon: '🎁',
                      type: 'consumable',
                      effects: []
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">道具详情</h3>
                <button
                  onClick={() => {
                    setShowItemDetail(null);
                    setIsEditing(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showItemDetail && (
                <>
                  {isEditing && editingItem ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                        <textarea
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                        <input
                          type="text"
                          value={editingItem.icon}
                          onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                        <select
                          value={editingItem.type}
                          onChange={(e) => setEditingItem({...editingItem, type: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="equipment">装备</option>
                          <option value="consumable">消耗品</option>
                          <option value="trophy">收藏品</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">效果</label>
                          <button
                            type="button"
                            onClick={handleAddEffectToEdit}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            添加效果
                          </button>
                        </div>
                        
                        {editingItem.effects && editingItem.effects.length > 0 && (
                          <div className="border border-gray-200 rounded-md p-3 space-y-2">
                            {editingItem.effects.map((effect, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <select
                                  value={effect.attribute}
                                  onChange={(e) => {
                                    const newEffects = [...editingItem.effects!];
                                    newEffects[index].attribute = e.target.value as any;
                                    setEditingItem({...editingItem, effects: newEffects});
                                  }}
                                  className="flex-1 px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded"
                                >
                                  {Object.entries(attributeConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.name}</option>
                                  ))}
                                </select>
                                
                                <select
                                  value={effect.type}
                                  onChange={(e) => {
                                    const newEffects = [...editingItem.effects!];
                                    newEffects[index].type = e.target.value as 'fixed' | 'percentage';
                                    setEditingItem({...editingItem, effects: newEffects});
                                  }}
                                  className="px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded"
                                >
                                  <option value="fixed">固定值</option>
                                  <option value="percentage">百分比</option>
                                </select>
                                
                                <input
                                  type="number"
                                  value={effect.value}
                                  onChange={(e) => {
                                    const newEffects = [...editingItem.effects!];
                                    newEffects[index].value = parseInt(e.target.value) || 0;
                                    setEditingItem({...editingItem, effects: newEffects});
                                  }}
                                  className="w-16 px-2 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded"
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEffectFromEdit(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {(!editingItem.effects || editingItem.effects.length === 0) && (
                          <p className="text-gray-500 text-sm">暂无效果</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditingItem(null);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveItemEdit}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center text-4xl mb-2">
                        {showItemDetail.icon}
                      </div>
                      
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900">{showItemDetail.name}</h4>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            showItemDetail.type === 'equipment' 
                              ? 'bg-blue-100 text-blue-800' 
                              : showItemDetail.type === 'consumable' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-purple-100 text-purple-800'
                          }`}>
                            {showItemDetail.type === 'equipment' ? '装备' : showItemDetail.type === 'consumable' ? '消耗品' : '收藏品'}
                          </span>
                        </div>
                      </div>
                      
                      {showItemDetail.description && (
                        <div className="border-t border-gray-200 pt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">描述</h5>
                          <p className="text-gray-600">{showItemDetail.description}</p>
                        </div>
                      )}
                      
                      {showItemDetail.effects && showItemDetail.effects.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">效果</h5>
                          <div className="space-y-1">
                            {showItemDetail.effects.map((effect, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{getAttributeName(effect.attribute)}</span>
                                <span className="font-medium">
                                  {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                                  {effect.type === 'percentage' ? '%' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-1">创建时间</h5>
                        <p className="text-gray-600">
                          {new Date(showItemDetail.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setEditingItem({...showItemDetail});
                            setIsEditing(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          编辑
                        </button>
                        {showItemDetail.type === 'consumable' && !showItemDetail.used && (
                          <button
                            onClick={() => {
                              onUseItem(showItemDetail);
                              setShowItemDetail(null);
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            使用
                          </button>
                        )}
                        {showItemDetail.type === 'consumable' && showItemDetail.used && (
                          <button
                            onClick={() => {
                              onUndoUseItem(showItemDetail.id);
                              setShowItemDetail(null);
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                          >
                            撤销使用
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemSystem;