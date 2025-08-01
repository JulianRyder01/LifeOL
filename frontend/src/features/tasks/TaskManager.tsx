import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectEvent, Item, ProjectEventProgressLog, ProgressButtonConfig } from '../../types/app.types';
import { Plus, Trash2, Settings, RotateCcw, CheckCircle, Clock, Calendar, ListTodo } from 'lucide-react';

// AnimatedNumber component for smooth number transitions
const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    const prevValue = prevValueRef.current;
    
    if (prevValue !== value) {
      const startTime = performance.now();
      const duration = 500; // 0.5 seconds
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out function for smooth deceleration
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.floor(prevValue + (value - prevValue) * easeOutProgress);
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
    
    prevValueRef.current = value;
  }, [value]);
  
  return <span className={className}>{displayValue}%</span>;
};

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
  
  // Animation states
  const [completingTasks, setCompletingTasks] = useState<Record<string, boolean>>({});
  const [completedTaskStates, setCompletedTaskStates] = useState<Record<string, { progress: number; opacity: number; transform: string }>>({});
  
  const [newProjectEvent, setNewProjectEvent] = useState({
    title: '',
    description: '',
    useMarkdown: false, // 添加Markdown支持选项
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
    useMarkdown: false, // 添加Markdown支持选项
    progress: 0,
    customProgressButtons: [] as ProgressButtonConfig[],
    attributeRewards: {} as Record<string, number>
  });
  
  // For editing custom progress buttons
  const [editingButtons, setEditingButtons] = useState<ProgressButtonConfig[]>([]);
  
  // Merge default attribute names with provided ones
  const mergedAttributeNames: Record<string, { name: string; icon: string; color: string } | string> = { ...attributeConfig, ...attributeNames };
  
  const [newReward, setNewReward] = useState({
    attribute: 'int' as keyof typeof attributeConfig,
    exp: 50
  });

  // 添加新奖励的函数
  const addAttributeReward = () => {
    if (showAddForm) {
      setNewProjectEvent({
        ...newProjectEvent,
        attributeRewards: {
          ...newProjectEvent.attributeRewards,
          [newReward.attribute]: (newProjectEvent.attributeRewards[newReward.attribute] || 0) + newReward.exp
        }
      });
    } else if (editingTaskId) {
      // 在编辑模式下更新编辑表单的奖励
      setEditTaskForm({
        ...editTaskForm,
        attributeRewards: {
          ...editTaskForm.attributeRewards,
          [newReward.attribute]: (editTaskForm.attributeRewards[newReward.attribute] || 0) + newReward.exp
        }
      });
    }
  };

  // 移除属性奖励
  const removeAttributeReward = (attribute: string) => {
    if (showAddForm) {
      const updatedRewards = { ...newProjectEvent.attributeRewards };
      delete updatedRewards[attribute];
      setNewProjectEvent({
        ...newProjectEvent,
        attributeRewards: updatedRewards
      });
    } else if (editingTaskId) {
      const updatedRewards = { ...editTaskForm.attributeRewards };
      delete updatedRewards[attribute];
      setEditTaskForm({
        ...editTaskForm,
        attributeRewards: updatedRewards
      });
    }
  };

  const handleAddProjectEvent = () => {
    if (!newProjectEvent.title.trim()) return;
    
    onAddProjectEvent(newProjectEvent);
    setNewProjectEvent({
      title: '',
      description: '',
      useMarkdown: false,
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

  // Render description with optional markdown support
  const renderDescription = (description: string, useMarkdown: boolean = false) => {
    if (useMarkdown) {
      // Simple markdown rendering for basic formatting
      return (
        <div className="markdown-content">
          {description.split('\n').map((line, i) => (
            <p key={i} className="mb-2">
              {line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>|<code>.*?<\/code>)/g)
                .map((part, j) => {
                  if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                    return <strong key={j}>{part.slice(8, -9)}</strong>;
                  }
                  if (part.startsWith('<em>') && part.endsWith('</em>')) {
                    return <em key={j}>{part.slice(4, -5)}</em>;
                  }
                  if (part.startsWith('<code>') && part.endsWith('</code>')) {
                    return <code key={j}>{part.slice(6, -7)}</code>;
                  }
                  return part;
                })
              }
            </p>
          ))}
        </div>
      );
    }
    return description;
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

  const [animationState, setAnimationState] = useState<Record<string, string>>({});

  const handleProgressChange = useCallback((id: string, change: number, reason?: string) => {
    const projectEvent = projectEvents.find(e => e.id === id);
    if (projectEvent) {
      const newProgress = Math.max(0, Math.min(100, projectEvent.progress + change));
      onUpdateProjectEvent(id, newProgress, reason);
      
      // Auto-complete if progress reaches 100%
      if (newProgress >= 100 && projectEvent.progress < 100) {
        // Start completion animation
        setCompletingTasks(prev => ({ ...prev, [id]: true }));
        
        // After 1 second, actually move the task to completed
        setTimeout(() => {
          const event = projectEvents.find(e => e.id === id);
          if (event) {
            onCompleteProjectEvent(id);
            // Remove from completing tasks after a short delay to allow UI to update
            setTimeout(() => {
              setCompletingTasks(prev => {
                const newCompleting = { ...prev };
                delete newCompleting[id];
                return newCompleting;
              });
            }, 100);
          }
        }, 1000);
      }
      
      // Update animation state for progress change
      setAnimationState(prev => ({
        ...prev,
        [id]: 'progress-change'
      }));
      
      // Reset animation state after animation duration
      setTimeout(() => {
        setAnimationState(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 1000); // Match this with your CSS transition duration
    }
  }, [projectEvents, onUpdateProjectEvent, onCompleteProjectEvent]);

  const startEditingTask = (task: ProjectEvent) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      useMarkdown: task.useMarkdown || false,
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
      ],
      attributeRewards: task.attributeRewards || {}
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
      useMarkdown: editTaskForm.useMarkdown,
      progress: editTaskForm.progress,
      customProgressButtons: editingButtons,
      attributeRewards: editTaskForm.attributeRewards
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

  // Handle completion animations
  useEffect(() => {
    Object.keys(completingTasks).forEach(id => {
      if (completingTasks[id]) {
        // Initialize animation state
        setCompletedTaskStates(prev => ({
          ...prev,
          [id]: {
            progress: 100,
            opacity: 1,
            transform: 'translateY(0)'
          }
        }));
        
        // Start animation after a small delay
        setTimeout(() => {
          setCompletedTaskStates(prev => {
            const newState = { ...prev };
            if (newState[id]) {
              newState[id] = {
                ...newState[id],
                opacity: 0.5,
                transform: 'translateY(20px)' // Move down slightly
              };
            }
            return newState;
          });
        }, 50);
      }
    });
  }, [completingTasks]);
  
  // Separate ongoing and completed tasks
  const ongoingTasks = projectEvents.filter(task => task.progress < 100 || completingTasks[task.id]);
  const completedTasks = projectEvents.filter(task => task.progress >= 100 && !completingTasks[task.id]);

  return (
    <div className="card" data-name="task-manager" data-file="components/TaskManager.js">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="text-[var(--primary-color)]" size={20} />
          <h2 className="text-lg sm:text-xl font-semibold">进行中的任务</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary px-3 py-1.5 text-sm sm:px-4 sm:py-2"
        >
          <span className="flex items-center gap-1">
            <Plus size={16} />
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
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  任务描述（可选）
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="task-markdown"
                    checked={newProjectEvent.useMarkdown}
                    onChange={(e) => setNewProjectEvent({...newProjectEvent, useMarkdown: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="task-markdown" className="ml-1 text-sm text-gray-600">
                    使用Markdown
                  </label>
                </div>
              </div>
              <textarea
                placeholder="任务描述"
                value={newProjectEvent.description || ''}
                onChange={(e) => setNewProjectEvent({...newProjectEvent, description: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                rows={2}
              />
              {newProjectEvent.useMarkdown && (
                <p className="mt-1 text-xs text-gray-500">
                  支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                </p>
              )}
            </div>
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
            
            {/* Rewards Section */}
            <div className="border-t border-[var(--border-color)] pt-3">
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">任务奖励</h4>
              
              {/* Attribute Rewards */}
              <div className="mb-3">
                <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-1">属性奖励</h5>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(newProjectEvent.attributeRewards).map(([attr, exp]) => (
                    <div 
                      key={attr} 
                      className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      <span>{attributeConfig[attr].name} +{exp}</span>
                      <button 
                        onClick={() => removeAttributeReward(attr)}
                        className="ml-1 text-blue-600 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newReward.attribute}
                    onChange={(e) => setNewReward({...newReward, attribute: e.target.value as keyof typeof attributeConfig})}
                    className="px-2 py-1 border border-[var(--border-color)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                  >
                    {Object.entries(attributeConfig).map(([key, attr]) => (
                      <option key={key} value={key}>{attr.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newReward.exp}
                    onChange={(e) => setNewReward({...newReward, exp: Number(e.target.value) || 0})}
                    className="w-20 px-2 py-1 border border-[var(--border-color)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    min="1"
                  />
                  <button
                    onClick={addAttributeReward}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    添加
                  </button>
                </div>
              </div>
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
                      <Trash2 size={16} />
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
          <ListTodo className="text-[var(--text-muted)] mb-4" size={48} />
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
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-[var(--text-primary)]">
                        任务描述（可选）
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit-task-markdown"
                          checked={editTaskForm.useMarkdown}
                          onChange={(e) => setEditTaskForm({...editTaskForm, useMarkdown: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="edit-task-markdown" className="ml-1 text-sm text-gray-600">
                          使用Markdown
                        </label>
                      </div>
                    </div>
                    <textarea
                      value={editTaskForm.description}
                      onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                      rows={2}
                    />
                    {editTaskForm.useMarkdown && (
                      <p className="mt-1 text-xs text-gray-500">
                        支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                      </p>
                    )}
                  </div>
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
                  
                  {/* Rewards Section in Edit Mode */}
                  <div className="border-t border-[var(--border-color)] pt-3">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">任务奖励</h4>
                    
                    {/* Attribute Rewards in Edit Mode */}
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-1">属性奖励</h5>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(editTaskForm.attributeRewards).map(([attr, exp]) => (
                          <div 
                            key={attr} 
                            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{attributeConfig[attr].name} +{exp}</span>
                            <button 
                              onClick={() => removeAttributeReward(attr)}
                              className="ml-1 text-blue-600 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={newReward.attribute}
                          onChange={(e) => setNewReward({...newReward, attribute: e.target.value as keyof typeof attributeConfig})}
                          className="px-2 py-1 border border-[var(--border-color)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                        >
                          {Object.entries(attributeConfig).map(([key, attr]) => (
                            <option key={key} value={key}>{attr.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={newReward.exp}
                          onChange={(e) => setNewReward({...newReward, exp: Number(e.target.value) || 0})}
                          className="w-20 px-2 py-1 border border-[var(--border-color)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          min="1"
                        />
                        <button
                          onClick={addAttributeReward}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          添加
                        </button>
                      </div>
                    </div>
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
                            <Trash2 size={16} />
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
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-medium text-purple-600 text-lg">{projectEvent.title}</h3>
                      <AnimatedNumber 
                        value={projectEvent.progress} 
                        className={`text-3xl font-bold ${
                          projectEvent.progress < 25 ? 'text-red-500' :
                          projectEvent.progress < 50 ? 'text-yellow-500' :
                          projectEvent.progress < 80 ? 'text-blue-500' :
                          projectEvent.progress < 100 ? 'text-purple-500' :
                          'text-green-500'
                        } ${
                          animationState[projectEvent.id] === 'completed' 
                            ? 'animate-bounce' 
                            : ''
                        }`} 
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
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
                        {renderDescription(projectEvent.description, projectEvent.useMarkdown)}
                      </p>
                    )}
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            animationState[projectEvent.id] === 'progress-change' 
                              ? 'transition duration-500 ease-in-out' 
                              : ''
                          } ${
                            projectEvent.progress < 25 ? 'bg-red-500' :
                            projectEvent.progress < 50 ? 'bg-yellow-500' :
                            projectEvent.progress < 80 ? 'bg-blue-500' :
                            projectEvent.progress < 100 ? 'bg-purple-500' :
                            'bg-green-500'
                          } ${
                            animationState[projectEvent.id] === 'completed' 
                              ? 'animate-pulse bg-green-500' 
                              : ''
                          }`}
                          style={{ width: `${projectEvent.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Display Rewards */}
                    {projectEvent.attributeRewards && Object.keys(projectEvent.attributeRewards).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">完成奖励:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(projectEvent.attributeRewards).map(([attr, exp]) => (
                            <div 
                              key={attr} 
                              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                              <span>{attributeConfig[attr].name} +{exp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProjectEvent(projectEvent.id)}
                      className="self-start p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
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
            <CheckCircle className="text-[var(--primary-color)]" size={20} />
            <h2 className="text-lg sm:text-xl font-semibold">已完成的任务</h2>
          </div>
          
          <div className="space-y-4">
            {completedTasks.map(projectEvent => (
              <div key={projectEvent.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-medium text-purple-600 text-lg">{projectEvent.title}</h3>
                      <AnimatedNumber 
                        value={projectEvent.progress} 
                        className="text-3xl font-bold text-green-500" 
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        已完成
                      </span>
                    </div>
                    
                    {projectEvent.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        {renderDescription(projectEvent.description, projectEvent.useMarkdown)}
                      </p>
                    )}
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 bg-green-500"
                          style={{ 
                            width: `${projectEvent.progress}%`,
                            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Display Rewards for Completed Tasks */}
                    {projectEvent.attributeRewards && Object.keys(projectEvent.attributeRewards).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">完成奖励:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(projectEvent.attributeRewards).map(([attr, exp]) => (
                            <div 
                              key={attr} 
                              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                              <span>{attributeConfig[attr].name} +{exp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onResetProjectEvent(projectEvent.id)}
                    className="self-start px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center gap-1"
                  >
                    <RotateCcw size={16} />
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