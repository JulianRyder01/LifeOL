import React, { useState } from 'react';
import { Item, ItemEffect } from '../types/app.types';

interface ItemSystemProps {
  items: Item[];
  onAddItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
}

function ItemSystem({ items, onAddItem }: ItemSystemProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    icon: '🍀', // Default emoji
    type: 'trophy' as 'equipment' | 'consumable' | 'trophy',
    effects: [] as ItemEffect[]
  });

  const handleCreateItem = () => {
    onAddItem({
      ...newItem,
      effects: newItem.type === 'trophy' ? [] : newItem.effects
    });
    setNewItem({
      name: '',
      description: '',
      icon: '🍀',
      type: 'trophy',
      effects: []
    });
    setShowCreateModal(false);
  };

  const handleAddEffect = () => {
    setNewItem({
      ...newItem,
      effects: [
        ...newItem.effects,
        {
          attribute: 'int',
          type: 'fixed',
          value: 0
        }
      ]
    });
  };

  const handleEffectChange = (index: number, field: keyof ItemEffect, value: any) => {
    const updatedEffects = [...newItem.effects];
    updatedEffects[index] = {
      ...updatedEffects[index],
      [field]: value
    };
    setNewItem({
      ...newItem,
      effects: updatedEffects
    });
  };

  const handleRemoveEffect = (index: number) => {
    const updatedEffects = [...newItem.effects];
    updatedEffects.splice(index, 1);
    setNewItem({
      ...newItem,
      effects: updatedEffects
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">道具系统</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          创建道具
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无道具</h3>
          <p className="mt-1 text-sm text-gray-500">创建你的第一个道具开始游戏</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              创建道具
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'equipment' 
                        ? 'bg-blue-100 text-blue-800' 
                        : item.type === 'consumable' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'equipment' 
                        ? '装备' 
                        : item.type === 'consumable' 
                          ? '消耗品' 
                          : '收藏品'}
                    </span>
                  </div>
                  {item.effects && item.effects.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">效果:</p>
                      <ul className="mt-1 text-xs text-gray-500">
                        {item.effects.map((effect, index) => (
                          <li key={index}>
                            {effect.attribute}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                            {effect.type === 'percentage' ? '%' : ' EXP'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">创建新道具</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">道具名称</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="例如：三叶草"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="例如：发现了友谊的秘密。对友谊更自信了"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">图标</label>
                    <input
                      type="text"
                      value={newItem.icon}
                      onChange={(e) => setNewItem({...newItem, icon: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="例如：🍀 (emoji) 或图片URL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">类型</label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="trophy">收藏品</option>
                      <option value="equipment">装备</option>
                      <option value="consumable">消耗品</option>
                    </select>
                  </div>
                  
                  {(newItem.type === 'equipment' || newItem.type === 'consumable') && (
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">效果</label>
                        <button
                          type="button"
                          onClick={handleAddEffect}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          添加效果
                        </button>
                      </div>
                      
                      {newItem.effects.map((effect, index) => (
                        <div key={index} className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              <label className="block text-xs text-gray-500">属性</label>
                              <select
                                value={effect.attribute}
                                onChange={(e) => handleEffectChange(index, 'attribute', e.target.value)}
                                className="mt-1 block w-full text-xs border border-gray-300 rounded-md shadow-sm p-1"
                              >
                                <option value="int">智力</option>
                                <option value="str">体魄</option>
                                <option value="vit">精力</option>
                                <option value="cha">社交</option>
                                <option value="eq">情感</option>
                                <option value="cre">创造</option>
                              </select>
                            </div>
                            
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-500">类型</label>
                              <select
                                value={effect.type}
                                onChange={(e) => handleEffectChange(index, 'type', e.target.value)}
                                className="mt-1 block w-full text-xs border border-gray-300 rounded-md shadow-sm p-1"
                              >
                                <option value="fixed">固定值</option>
                                <option value="percentage">百分比</option>
                              </select>
                            </div>
                            
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-500">数值</label>
                              <input
                                type="number"
                                value={effect.value}
                                onChange={(e) => handleEffectChange(index, 'value', parseFloat(e.target.value) || 0)}
                                className="mt-1 block w-full text-xs border border-gray-300 rounded-md shadow-sm p-1"
                              />
                            </div>
                            
                            <div className="col-span-1 flex items-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveEffect(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateItem}
                  disabled={!newItem.name || !newItem.description}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
                    !newItem.name || !newItem.description
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  创建道具
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemSystem;