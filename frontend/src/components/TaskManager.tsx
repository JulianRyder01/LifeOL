import React, { useState } from 'react';
import { ProjectEvent, Item, ProjectEventProgressLog, ProgressButtonConfig } from '../types/app.types';

interface TaskManagerProps {
  projectEvents: ProjectEvent[];
  items: Item[];
  onAddProjectEvent: (event: Omit<ProjectEvent, 'id' | 'createdAt'>) => void;
  onUpdateProjectEvent: (id: string, progress: number, reason?: string) => void;
  onCompleteProjectEvent: (id: string) => void;
  onDeleteProjectEvent: (id: string) => void;
  onResetProjectEvent: (id: string) => void;
  onEditProjectEvent: (id: string, updates: Partial<ProjectEvent>) => void;
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

function TaskManager({ projectEvents, items, onAddProjectEvent, onUpdateProjectEvent, onCompleteProjectEvent, onDeleteProjectEvent, onResetProjectEvent, onEditProjectEvent, attributeNames = {} }: TaskManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [progressChangeReason, setProgressChangeReason] = useState<Record<string, string>>({});
  
  const [newProjectEvent, setNewProjectEvent] = useState({
    title: '',
    description: '',
    progress: 0,
    attributeRewards: {} as Record<string, number>,
    itemRewards: [] as string[],
    customProgressButtons: [
      { label: '-50%', value: -50 },
      { label: '-20%', value: -20 },
      { label: '-10%', value: -10 },
      { label: '-5%', value: -5 },
      { label: '+5%', value: 5 },
      { label: '+10%', value: 10 },
      { label: '+20%', value: 20 },
      { label: '+50%', value: 50 },
{ label: '标记完成✔', value: 100 }
    ] as ProgressButtonConfig[]
  });
  
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    description: '',
    progress: 0,
    customProgressButtons: [] as ProgressButtonConfig[]
  });
  
  // For editing custom progress buttons
  const [editingButtons, setEditingButtons] = useState<ProgressButtonConfig[]>([]);
  
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
      itemRewards: [],
      customProgressButtons: [
        { label: '-50%', value: -50 },
        { label: '-20%', value: -20 },
        { label: '-10%', value: -10 },
        { label: '-5%', value: -5 },
        { label: '+5%', value: 5 },
        { label: '+10%', value: 10 },
        { label: '+20%', value: 20 },
        { label: '+50%', value: 50 },
{ label: '标记完成✔', value: 100 }
      ]
    });
    setShowAddForm(false);
  };

  const handleDeleteProjectEvent = (id: string) => {
    const eventToDelete = projectEvents.find(e => e.id === id);
    if (eventToDelete) {
      setShowDeleteConfirm({
        id,
        title: eventToDelete.title
      });
    }
  };

  const confirmDeleteProjectEvent = (id: string) => {
    onDeleteProjectEvent(id);
    setShowDeleteConfirm(null);
  };

  const handleProgressChange = (id: string, change: number, reason?: string) => {
    const projectEvent = projectEvents.find(e => e.id === id);
    if (projectEvent) {
      const newProgress = Math.max(0, Math.min(100, projectEvent.progress + change));
      onUpdateProjectEvent(id, newProgress, reason);
      
      // Auto-complete if progress reaches 100%
      if (newProgress >= 100) {
        setTimeout(() => {
          const event = projectEvents.find(e => e.id === id);
          if (event) {
            onCompleteProjectEvent(id);
          }
        }, 500);
      }
    }
  };

  const startEditingTask = (task: ProjectEvent) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      progress: task.progress,
      customProgressButtons: task.customProgressButtons || [
        { label: '-50%', value: -50 },
        { label: '-20%', value: -20 },
        { label: '-10%', value: -10 },
        { label: '-5%', value: -5 },
        { label: '+5%', value: 5 },
        { label: '+10%', value: 10 },
        { label: '+20%', value: 20 },
        { label: '+50%', value: 50 },
{ label: '标记完成✔', value: 100 }
      ]
    });
    setEditingButtons(task.customProgressButtons || [
      { label: '-50%', value: -50 },
      { label: '-20%', value: -20 },
      { label: '-10%', value: -10 },
      { label: '-5%', value: -5 },
      { label: '+5%', value: 5 },
      { label: '+10%', value: 10 },
      { label: '+20%', value: 20 },
      { label: '+50%', value: 50 },
{ label: '标记完成✔', value: 100 }
    ]);
  };

  const saveTaskEdit = (id: string) => {
    onEditProjectEvent(id, {
      title: editTaskForm.title,
      description: editTaskForm.description,
      progress: editTaskForm.progress,
      customProgressButtons: editingButtons
    });
    setEditingTaskId(null);
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
  };

  // Custom progress button functions
  const addCustomButton = () => {
    if (showAddForm) {
      setNewProjectEvent({
        ...newProjectEvent,
        customProgressButtons: [
          ...newProjectEvent.customProgressButtons,
          { label: '+10%', value: 10 }
        ]
      });
    } else if (editingTaskId) {
      setEditingButtons([
        ...editingButtons,
        { label: '+10%', value: 10 }
      ]);
    }
  };

  const updateCustomButton = (index: number, field: keyof ProgressButtonConfig, value: string | number) => {
    const updatedButtons = [...editingButtons];
    if (field === 'label') {
      updatedButtons[index][field] = value as string;
    } else {
      updatedButtons[index][field] = value as number;
    }
    
    if (showAddForm) {
      setNewProjectEvent({
        ...newProjectEvent,
        customProgressButtons: updatedButtons
      });
    } else if (editingTaskId) {
      setEditingButtons(updatedButtons);
    }
  };

  const removeCustomButton = (index: number) => {
    const updatedButtons = [...editingButtons];
    updatedButtons.splice(index, 1);
    
    if (showAddForm) {
      setNewProjectEvent({
        ...newProjectEvent,
        customProgressButtons: updatedButtons
      });
    } else if (editingTaskId) {
      setEditingButtons(updatedButtons);
    }
  };

  // Separate ongoing and completed tasks
  const ongoingTasks = projectEvents.filter(task => task.progress < 100);
  const completedTasks = projectEvents.filter(task => task.progress >= 100);

  return (
    <div className="card" data-name="task-manager" data-file="components/TaskManager.js">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="icon-tasks text-lg text-[var(--primary-color)]"></div>
          <h2 className="text-lg sm:text-xl font-semibold">进行中的任务</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary px-3 py-1.5 text-sm sm:px-4 sm:py-2"
        >
          <span className="flex items-center gap-1">
            <div className="icon-plus text-sm"></div>
            <span>添加任务</span>
          </span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
          <h3 className="font-medium mb-3">添加新任务</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务名称"
              value={newProjectEvent.title}
              onChange={(e) => setNewProjectEvent({...newProjectEvent, title: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
            <textarea
              placeholder="任务描述（可选）"
              value={newProjectEvent.description || ''}
              onChange={(e) => setNewProjectEvent({...newProjectEvent, description: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                placeholder="初始进度"
                value={newProjectEvent.progress || ''}
                onChange={(e) => setNewProjectEvent({...newProjectEvent, progress: Number(e.target.value) || 0})}
                className="px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] w-32"
                min="0"
                max="100"
              />
            </div>
            
            {/* Custom Progress Buttons Section */}
            <div className="border-t border-[var(--border-color)] pt-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-[var(--text-primary)]">自定义进度按钮</h4>
                <button
                  onClick={addCustomButton}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  添加按钮
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newProjectEvent.customProgressButtons.map((button, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={button.label}
                      onChange={(e) => {
                        const updatedButtons = [...newProjectEvent.customProgressButtons];
                        updatedButtons[index].label = e.target.value;
                        setNewProjectEvent({
                          ...newProjectEvent,
                          customProgressButtons: updatedButtons
                        });
                      }}
                      placeholder="按钮标签"
                      className="flex-1 px-2 py-1 text-sm border border-[var(--border-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    />
                    <input
                      type="number"
                      value={button.value}
                      onChange={(e) => {
                        const updatedButtons = [...newProjectEvent.customProgressButtons];
                        updatedButtons[index].value = Number(e.target.value) || 0;
                        setNewProjectEvent({
                          ...newProjectEvent,
                          customProgressButtons: updatedButtons
                        });
                      }}
                      placeholder="值"
                      className="w-20 px-2 py-1 text-sm border border-[var(--border-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    />
                    <button
                      onClick={() => {
                        const updatedButtons = [...newProjectEvent.customProgressButtons];
                        updatedButtons.splice(index, 1);
                        setNewProjectEvent({
                          ...newProjectEvent,
                          customProgressButtons: updatedButtons
                        });
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <div className="icon-trash text-sm"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddProjectEvent}
                className="btn btn-primary px-4 py-2"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary px-4 py-2"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {ongoingTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="icon-tasks text-4xl text-[var(--text-muted)] mb-4"></div>
          <p className="text-[var(--text-secondary)]">还没有进行中的任务</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">点击"添加任务"来创建你的第一个任务吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ongoingTasks.map(projectEvent => (
            <div key={projectEvent.id} className="border border-[var(--border-color)] rounded-lg p-4 hover:shadow-sm transition-shadow">
              {editingTaskId === projectEvent.id ? (
                // Edit mode
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTaskForm.title}
                    onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  <textarea
                    value={editTaskForm.description}
                    onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[var(--text-secondary)]">当前进度:</label>
                    <input
                      type="number"
                      value={editTaskForm.progress}
                      onChange={(e) => setEditTaskForm({...editTaskForm, progress: Number(e.target.value) || 0})}
                      className="px-2 py-1 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">%</span>
                  </div>
                  
                  {/* Custom Progress Buttons Section */}
                  <div className="border-t border-[var(--border-color)] pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-[var(--text-primary)]">自定义进度按钮</h4>
                      <button
                        onClick={addCustomButton}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        添加按钮
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editingButtons.map((button, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={button.label}
                            onChange={(e) => updateCustomButton(index, 'label', e.target.value)}
                            placeholder="按钮标签"
                            className="flex-1 px-2 py-1 text-sm border border-[var(--border-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          />
                          <input
                            type="number"
                            value={button.value}
                            onChange={(e) => updateCustomButton(index, 'value', e.target.value)}
                            placeholder="值"
                            className="w-20 px-2 py-1 text-sm border border-[var(--border-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          />
                          <button
                            onClick={() => removeCustomButton(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <div className="icon-trash text-sm"></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelTaskEdit}
                      className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => saveTaskEdit(projectEvent.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-medium text-[var(--text-primary)]">{projectEvent.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        projectEvent.progress >= 100 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {projectEvent.progress >= 100 ? '已完成' : '进行中'}
                      </span>
                    </div>
                    
                    {projectEvent.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        {projectEvent.description}
                      </p>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>进度: {projectEvent.progress}/100</span>
                        <span>{projectEvent.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${projectEvent.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(projectEvent.customProgressButtons || [
                        { label: '-50%', value: -50 },
                        { label: '-20%', value: -20 },
                        { label: '-10%', value: -10 },
                        { label: '-5%', value: -5 },
                        { label: '+5%', value: 5 },
                        { label: '+10%', value: 10 },
                        { label: '+20%', value: 20 },
                        { label: '+50%', value: 50 },
{ label: '标记完成✔', value: 100 }
                      ]).map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleProgressChange(projectEvent.id, option.value, progressChangeReason[projectEvent.id])}
                          className={`px-2 py-1 text-xs rounded ${
                            option.value > 0 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={progressChangeReason[projectEvent.id] || ''}
                        onChange={(e) => setProgressChangeReason({
                          ...progressChangeReason,
                          [projectEvent.id]: e.target.value
                        })}
                        placeholder="变更原因（可选）"
                        className="flex-1 min-w-0 px-2 py-1 text-sm border border-[var(--border-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                      />
                    </div>
                    
                    {projectEvent.progressLog && projectEvent.progressLog.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2">进度变更记录</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {projectEvent.progressLog.map((log, index) => (
                            <div key={index} className="text-xs text-[var(--text-secondary)]">
                              <span className={log.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                {log.change > 0 ? '+' : ''}{log.change}%
                              </span>
                              {log.reason && (
                                <span> {log.reason}</span>
                              )}
                              <span className="ml-1">
                                {new Date(log.timestamp).toLocaleDateString('zh-CN')} {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditingTask(projectEvent)}
                      className="self-start p-1 text-gray-400 hover:text-blue-500"
                    >
                      <div className="icon-settings text-lg"></div>
                    </button>
                    <button
                      onClick={() => handleDeleteProjectEvent(projectEvent.id)}
                      className="self-start p-1 text-gray-400 hover:text-red-500"
                    >
                      <div className="icon-trash text-lg"></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="icon-check-circle text-lg text-[var(--primary-color)]"></div>
            <h2 className="text-lg sm:text-xl font-semibold">已完成的任务</h2>
          </div>
          
          <div className="space-y-4">
            {completedTasks.map(projectEvent => (
              <div key={projectEvent.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-medium text-[var(--text-primary)] line-through">{projectEvent.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        已完成
                      </span>
                    </div>
                    
                    {projectEvent.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-through">
                        {projectEvent.description}
                      </p>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>进度: {projectEvent.progress}/100</span>
                        <span>{projectEvent.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${projectEvent.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onResetProjectEvent(projectEvent.id)}
                    className="self-start px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center gap-1"
                  >
                    <div className="icon-rotate-ccw text-sm"></div>
                    <span>重新编排</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
              <p className="text-gray-500 mb-6">
                确定要删除任务 <span className="font-medium text-gray-900">{showDeleteConfirm.title}</span> 吗？
                此操作无法撤销。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={() => confirmDeleteProjectEvent(showDeleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  删除
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