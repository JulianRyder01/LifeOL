import React, { useState } from 'react';
import { Achievement } from '../types/app.types.ts';

interface AchievementModalProps {
  onClose: () => void;
  onSubmit: (achievementData: Partial<Achievement>) => void;
  achievements: Achievement[];
}

interface TriggerType {
  value: string;
  label: string;
}

function AchievementModal({ onClose, onSubmit, achievements }: AchievementModalProps) {
  try {
    const [showAddForm, setShowAddForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('star');
    const [triggerType, setTriggerType] = useState('manual');
    const [triggerCondition, setTriggerCondition] = useState('');

    const iconOptions = ['star', 'trophy', 'medal', 'crown', 'target', 'flame', 'heart', 'zap', 'compass', 'lightbulb', 'hand-heart', 'mountain'];
    
    const triggerTypes: TriggerType[] = [
      { value: 'manual', label: '手动解锁' },
      { value: 'level', label: '等级达成' },
      { value: 'events', label: '事件数量' },
      { value: 'keyword', label: '关键词匹配' },
      { value: 'streak', label: '连续天数' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      const achievementData: Partial<Achievement> = {
        title: title.trim(),
        description: description.trim(),
        icon: icon,
        triggerType: triggerType
      };

      if (triggerType !== 'manual') {
        achievementData.triggerCondition = triggerCondition.trim();
        achievementData.unlockedAt = null; // Will be checked automatically
      }

      onSubmit(achievementData);

      setTitle('');
      setDescription('');
      setIcon('star');
      setTriggerType('manual');
      setTriggerCondition('');
      setShowAddForm(false);
    };

    const unlockedAchievements = achievements.filter(a => a.unlockedAt);
    const systemAchievements = achievements.filter(a => !a.isCustom);

    return (
      <div className="modal-overlay" onClick={onClose} data-name="achievement-modal" data-file="components/AchievementModal.js">
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="icon-award text-xl text-yellow-600"></div>
                成就系统
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <div className="icon-x text-lg text-[var(--text-secondary)]"></div>
              </button>
            </div>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">已获得成就 ({unlockedAchievements.length})</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary text-sm"
              >
                <div className="icon-plus text-sm"></div>
                添加成就
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">成就标题 *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：第一次马拉松"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">描述</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="完成人生第一次全程马拉松"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">触发条件</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] mb-2"
                  >
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  
                  {triggerType !== 'manual' && (
                    <input
                      type="text"
                      value={triggerCondition}
                      onChange={(e) => setTriggerCondition(e.target.value)}
                      placeholder={
                        triggerType === 'level' ? '例如：int:10（智力达到10级）' :
                        triggerType === 'events' ? '例如：100（记录100个事件）' :
                        triggerType === 'keyword' ? '例如：旅行,探险（包含关键词）' :
                        triggerType === 'streak' ? '例如：7（连续7天）' : ''
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">图标</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-colors ${
                          icon === iconName 
                            ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`icon-${iconName} text-lg`}></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">保存</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">取消</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map(achievement => (
                <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <div className={`icon-${achievement.icon} text-lg text-yellow-600`}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.description && (
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('zh-CN') : ''}
                  </div>
                </div>
              ))}
            </div>

            {unlockedAchievements.length === 0 && (
              <div className="text-center py-8">
                <div className="icon-award text-4xl text-gray-400 mb-4"></div>
                <p className="text-gray-600">还没有获得任何成就</p>
                <p className="text-sm text-gray-500 mt-1">继续努力，解锁你的第一个成就吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AchievementModal component error:', error);
    return null;
  }
}

export default AchievementModal;