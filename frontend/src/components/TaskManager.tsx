import React, { useState } from 'react';
import { ProjectEvent, Item, ProjectEventProgressLog } from '../types/app.types';

interface TaskManagerProps {
  projectEvents: ProjectEvent[];
  items: Item[];
  onAddProjectEvent: (event: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  onUpdateProjectEvent: (id: string, progress: number, reason?: string) => void;
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
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [progressChangeReason, setProgressChangeReason] = useState<Record<string, string>>({});
  const [newProjectEvent, setNewProjectEvent] = useState({
    title: '',
    description: '',
    progress: 0,
    attributeRewards: {} as Record<string, number>,
    itemRewards: [] as string[]
  });
  
  // Merge default attribute names with provided ones
  const mergedAttributeNames: Record<string, { name: string; icon: string; color: string } | string> = { ...attributeConfig, ...attributeNames };
  
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
    const attr = mergedAttributeNames[attrKey];
    if (typeof attr === 'string') {
      return attr;
    }
    return attr?.name || attrKey;
  };

  // 处理进度更新
  const handleProgressUpdate = (id: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress)); // 确保进度在0-100之间
    const reason = progressChangeReason[id] || '';
    
    onUpdateProjectEvent(id, clampedProgress, reason);
    
    // 清除该任务的变更原因输入
    setProgressChangeReason(prev => {
      const newReasons = { ...prev };
      delete newReasons[id];
      return newReasons;
    });
    
    // 如果进度达到100%且用户未选择不再提示，则显示确认对话框
    const projectEvent = projectEvents.find(event => event.id === id);
    if (clampedProgress >= 100 && projectEvent && !projectEvent.completedAt) {
      const userConfig = localStorage.getItem('lifeol_user_config');
      const dontShow = userConfig ? JSON.parse(userConfig).dontShowTaskCompleteConfirm : false;
      if (!dontShow) {
        setShowCompleteConfirm({ id, title: projectEvent.title });
      } else {
        // 直接标记为完成
        onCompleteProjectEvent(id);
      }
    }
  };

  // 确认标记完成
  const confirmComplete = () => {
    if (showCompleteConfirm) {
      onCompleteProjectEvent(showCompleteConfirm.id);
      if (dontShowAgain) {
        // 保存用户配置到localStorage
        const userConfig = localStorage.getItem('lifeol_user_config');
        const config = userConfig ? JSON.parse(userConfig) : {};
        config.dontShowTaskCompleteConfirm = true;
        localStorage.setItem('lifeol_user_config', JSON.stringify(config));
      }
    }
    setShowCompleteConfirm(null);
    setDontShowAgain(false);
  };

  // 取消标记完成
  const cancelComplete = () => {
    setShowCompleteConfirm(null);
    setDontShowAgain(false);
  };

  // 显示删除确认
  const showDeleteConfirmation = (id: string, title: string) => {
    setShowDeleteConfirm({ id, title });
  };

  // 确认删除
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteProjectEvent(showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
  };

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // 更新进度变更原因
  const handleReasonChange = (id: string, reason: string) => {
    setProgressChangeReason(prev => ({
      ...prev,
      [id]: reason
    }));
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
                
                {/* Progress Change Reason Input */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={progressChangeReason[event.id] || ''}
                    onChange={(e) => handleReasonChange(event.id, e.target.value)}
                    placeholder="本次进度改变原因描述（可选）"
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress - 50)}
                      className="px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      -50%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress - 20)}
                      className="px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      -20%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress - 10)}
                      className="px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress - 5)}
                      className="px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      -5%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress + 5)}
                      className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress + 10)}
                      className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress + 20)}
                      className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +20%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(event.id, event.progress + 50)}
                      className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      +50%
                    </button>
                  </div>
                </div>
                
                {/* Progress Change Log */}
                {(event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog && 
                 (event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog!.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">进度变更记录</h4>
                    <div className="mt-1 space-y-1">
                      {(event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog!.map((log, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className={log.change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {log.change > 0 ? '+' : ''}{log.change}% 
                          </span> 
                          {log.reason && ` ${log.reason}`} 
                          {' '}{new Date(log.timestamp).toLocaleDateString('zh-CN')} 
                          {' '}{new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <div></div> {/* Empty div for spacing */}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleProgressUpdate(event.id, 100)}
                      disabled={event.progress < 100}
                      className={`px-3 py-1 text-sm rounded-md ${
                        event.progress >= 100
                          ? 'text-white bg-green-600 hover:bg-green-700'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      标记完成
                    </button>
                    <button
                      onClick={() => showDeleteConfirmation(event.id, event.title)}
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
                
                {/* Progress Change Log for completed events */}
                {(event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog && 
                 (event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog!.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">进度变更记录</h4>
                    <div className="mt-1 space-y-1">
                      {(event as ProjectEvent & { progressLog?: ProjectEventProgressLog[] }).progressLog!.map((log, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className={log.change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {log.change > 0 ? '+' : ''}{log.change}% 
                          </span> 
                          {log.reason && ` ${log.reason}`} 
                          {' '}{new Date(log.timestamp).toLocaleDateString('zh-CN')} 
                          {' '}{new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                    </div>
                  </div>
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

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">进度条已达到100%！</h3>
              <p className="text-gray-500 mb-4">
                是否标记任务 "{showCompleteConfirm.title}" 完成？
              </p>
              
              <div className="flex items-center mb-4">
                <input
                  id="dont-show-again"
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="dont-show-again" className="ml-2 block text-sm text-gray-700">
                  不再提示
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelComplete}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={confirmComplete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  确认完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除任务</h3>
              <p className="text-gray-500 mb-4">
                确定要删除任务 "{showDeleteConfirm.title}" 吗？此操作无法撤销。
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  确认删除
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