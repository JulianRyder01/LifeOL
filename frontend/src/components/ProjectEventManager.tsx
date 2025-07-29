import React, { useState } from 'react';
import { ProjectEvent, Item } from '../types/app.types';

interface ProjectEventManagerProps {
  projectEvents: ProjectEvent[];
  items: Item[];
  onAddProjectEvent: (event: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  onUpdateProjectEvent: (id: string, progress: number) => void;
  onCompleteProjectEvent: (id: string) => void;
}

function ProjectEventManager({ 
  projectEvents, 
  items, 
  onAddProjectEvent, 
  onUpdateProjectEvent, 
  onCompleteProjectEvent 
}: ProjectEventManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    progress: 0,
    attributeRewards: {} as Record<string, number>,
    itemRewards: [] as string[]
  });

  const handleCreateEvent = () => {
    onAddProjectEvent({
      ...newEvent
      // createdAt will be added in the parent component
    });
    setNewEvent({
      title: '',
      description: '',
      progress: 0,
      attributeRewards: {},
      itemRewards: []
    });
    setShowCreateModal(false);
  };

  const handleProgressUpdate = (id: string, progress: number) => {
    // Ensure progress is between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));
    onUpdateProjectEvent(id, clampedProgress);
    
    // Auto-complete if progress reaches 100
    if (clampedProgress === 100) {
      setTimeout(() => onCompleteProjectEvent(id), 500);
    }
  };

  const handleAddAttributeReward = () => {
    setNewEvent({
      ...newEvent,
      attributeRewards: {
        ...newEvent.attributeRewards,
        int: 0 // Default to adding 0 INT exp
      }
    });
  };

  const handleAttributeRewardChange = (attribute: string, value: number) => {
    setNewEvent({
      ...newEvent,
      attributeRewards: {
        ...newEvent.attributeRewards,
        [attribute]: value
      }
    });
  };

  const handleRemoveAttributeReward = (attribute: string) => {
    const updatedRewards = { ...newEvent.attributeRewards };
    delete updatedRewards[attribute];
    setNewEvent({
      ...newEvent,
      attributeRewards: updatedRewards
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">事件管理器</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          创建项目
        </button>
      </div>

      {projectEvents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
          <p className="mt-1 text-sm text-gray-500">创建你的第一个项目开始追踪进度</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              创建项目
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {projectEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                {event.completedAt && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已完成
                  </span>
                )}
              </div>
              
              {event.description && (
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
              )}
              
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">进度</span>
                  <span className="text-gray-500">{Math.round(event.progress)}%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${event.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {!event.completedAt && (
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => handleProgressUpdate(event.id, Math.max(0, event.progress - 10))}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    -10%
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={event.progress}
                    onChange={(e) => handleProgressUpdate(event.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  
                  <button
                    onClick={() => handleProgressUpdate(event.id, Math.min(100, event.progress + 10))}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    +10%
                  </button>
                  
                  <button
                    onClick={() => handleProgressUpdate(event.id, 100)}
                    className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    完成
                  </button>
                </div>
              )}
              
              {(event.attributeRewards || event.itemRewards) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700">完成奖励:</p>
                  <ul className="mt-1 text-xs text-gray-500">
                    {event.attributeRewards && Object.entries(event.attributeRewards).map(([attr, value]) => (
                      <li key={attr}>{attr}: +{value} EXP</li>
                    ))}
                    {event.itemRewards && event.itemRewards.map(itemId => {
                      const item = items.find(i => i.id === itemId);
                      return item ? <li key={itemId}>{item.name} (道具)</li> : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">创建新项目</h3>
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
                    <label className="block text-sm font-medium text-gray-700">项目标题</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="例如：阅读《未来简史》"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="对目标的进一步说明"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">属性奖励</label>
                      <button
                        type="button"
                        onClick={handleAddAttributeReward}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        添加奖励
                      </button>
                    </div>
                    
                    {Object.entries(newEvent.attributeRewards).map(([attribute, value]) => (
                      <div key={attribute} className="mt-2 flex items-center">
                        <select
                          value={attribute}
                          onChange={(e) => {
                            handleRemoveAttributeReward(attribute);
                            handleAttributeRewardChange(e.target.value, value);
                          }}
                          className="block w-1/2 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                        >
                          <option value="int">智力</option>
                          <option value="str">体魄</option>
                          <option value="vit">精力</option>
                          <option value="cha">社交</option>
                          <option value="eq">情感</option>
                          <option value="cre">创造</option>
                        </select>
                        
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleAttributeRewardChange(attribute, parseInt(e.target.value) || 0)}
                          className="ml-2 block w-1/2 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                          placeholder="经验值"
                        />
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveAttributeReward(attribute)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
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
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
                    !newEvent.title
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  创建项目
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectEventManager;