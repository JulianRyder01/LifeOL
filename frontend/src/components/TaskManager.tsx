import React, { useState } from 'react';
import { ProjectEvent, Item } from '../types/app.types';

interface TaskManagerProps {
  projectEvents: ProjectEvent[];
  items: Item[];
  onAddProjectEvent: (event: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  onUpdateProjectEvent: (id: string, progress: number) => void;
  onCompleteProjectEvent: (id: string) => void;
  onDeleteProjectEvent: (id: string) => void;
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

function TaskManager({ projectEvents, items, onAddProjectEvent, onUpdateProjectEvent, onCompleteProjectEvent, onDeleteProjectEvent, attributeNames = {} }: TaskManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectEvent, setNewProjectEvent] = useState({
    title: '',
    description: '',
    progress: 0,
    attributeRewards: {} as Record<string, number>,
    itemRewards: [] as string[]
  });
  
  // Merge default attribute names with provided ones
  const mergedAttributeNames: Record<string, { name: string; icon: string; color: string }> = { ...attributeConfig, ...attributeNames };
  
  const [newReward, setNewReward] = useState({
    attribute: 'int' as keyof typeof attributeConfig,
    exp: 50
  });

  const handleAddProjectEvent = () => {
    if (!newProjectEvent.title.trim()) return;
    
    onAddProjectEvent(newProjectEvent);
    setNewProjectEvent({
      title: '',
      description: '',
      progress: 0,
      attributeRewards: {},
      itemRewards: []
    });
    setShowAddForm(false);
  };

  const handleAddReward = () => {
    setNewProjectEvent({
      ...newProjectEvent,
      attributeRewards: {
        ...newProjectEvent.attributeRewards,
        [newReward.attribute]: newReward.exp
      }
    });
    setNewReward({
      attribute: 'int',
      exp: 50
    });
  };

  const handleRemoveReward = (attribute: string) => {
    const newRewards = { ...newProjectEvent.attributeRewards };
    delete newRewards[attribute];
    setNewProjectEvent({ ...newProjectEvent, attributeRewards: newRewards });
  };

  // Group events by status
  const incompleteEvents = projectEvents.filter(event => !event.completedAt);
  const completedEvents = projectEvents.filter(event => event.completedAt);

  // 获取属性名称的辅助函数
  const getAttributeName = (attrKey: string) => {
    return mergedAttributeNames[attrKey]?.name || attrKey;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">任务管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          添加任务
        </button>
      </div>

      {/* Incomplete Events */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">进行中的任务</h3>
        {incompleteEvents.length === 0 ? (
          <p className="text-gray-500">暂无进行中的任务</p>
        ) : (
          <div className="space-y-4">
            {incompleteEvents.map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <span className="text-sm text-gray-500">{Math.round(event.progress)}%</span>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                )}
                
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${event.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdateProjectEvent(event.id, Math.min(100, event.progress + 10))}
                      className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => onUpdateProjectEvent(event.id, Math.min(100, event.progress + 25))}
                      className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +25%
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onCompleteProjectEvent(event.id)}
                      disabled={event.progress < 100}
                      className={`px-3 py-1 text-sm rounded-md ${
                        event.progress >= 100
                          ? 'text-white bg-green-600 hover:bg-green-700'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      完成
                    </button>
                    <button
                      onClick={() => onDeleteProjectEvent(event.id)}
                      className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                {event.attributeRewards && Object.keys(event.attributeRewards).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">奖励</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(event.attributeRewards).map(([attr, exp]) => (
                        <span 
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getAttributeName(attr)}: +{exp} EXP
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Events */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">已完成的任务</h3>
        {completedEvents.length === 0 ? (
          <p className="text-gray-500">暂无已完成的任务</p>
        ) : (
          <div className="space-y-4">
            {completedEvents.map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <span className="text-sm text-green-600 font-medium">已完成</span>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                )}
                
                {event.completedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    完成于 {new Date(event.completedAt).toLocaleDateString('zh-CN')}
                  </p>
                )}
                
                {event.attributeRewards && Object.keys(event.attributeRewards).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">奖励</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(event.attributeRewards).map(([attr, exp]) => (
                        <span 
                          key={attr}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getAttributeName(attr)}: +{exp} EXP
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加新任务</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={newProjectEvent.title}
                    onChange={(e) => setNewProjectEvent({...newProjectEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={newProjectEvent.description}
                    onChange={(e) => setNewProjectEvent({...newProjectEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">属性奖励</label>
                    <button
                      type="button"
                      onClick={handleAddReward}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      添加奖励
                    </button>
                  </div>
                  
                  {Object.keys(newProjectEvent.attributeRewards).length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3 space-y-2">
                      {Object.entries(newProjectEvent.attributeRewards).map(([attr, exp]) => (
                        <div key={attr} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm">
                            <span className="font-medium">
                              {getAttributeName(attr)}
                            </span>
                            <span className="ml-2">+{exp} EXP</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReward(attr)}
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
                  
                  {Object.keys(newProjectEvent.attributeRewards).length === 0 && (
                    <p className="text-gray-500 text-sm">暂无属性奖励</p>
                  )}
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">属性</label>
                      <select
                        value={newReward.attribute}
                        onChange={(e) => setNewReward({...newReward, attribute: e.target.value as any})}
                        className="mt-1 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      >
                        {Object.entries(attributeConfig).map(([key, config]) => (
                          <option key={key} value={key}>{config.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">经验值</label>
                      <input
                        type="number"
                        value={newReward.exp}
                        onChange={(e) => setNewReward({...newReward, exp: parseInt(e.target.value) || 0})}
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
                    setNewProjectEvent({
                      title: '',
                      description: '',
                      progress: 0,
                      attributeRewards: {},
                      itemRewards: []
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddProjectEvent}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;