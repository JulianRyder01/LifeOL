import React, { useState } from 'react';
import { AttributeConfig } from '../types/app.types.ts';

interface EventModalProps {
  onClose: () => void;
  onSubmit: (eventData: { title: string; description: string; expGains: Record<string, number> }) => void;
}

interface AttributeOption {
  key: string;
  name: string;
  icon: string;
  color: string;
}

interface SelectedAttributes {
  [key: string]: number;
}

function EventModal({ onClose, onSubmit }: EventModalProps) {
  try {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>({});

    const attributeOptions: AttributeOption[] = [
      { key: 'int', name: '智力', icon: 'book-open', color: 'var(--int-color)' },
      { key: 'str', name: '体魄', icon: 'dumbbell', color: 'var(--str-color)' },
      { key: 'vit', name: '精力', icon: 'battery', color: 'var(--vit-color)' },
      { key: 'cha', name: '社交', icon: 'users', color: 'var(--cha-color)' },
      { key: 'eq', name: '情感', icon: 'heart', color: 'var(--eq-color)' },
      { key: 'cre', name: '创造', icon: 'palette', color: 'var(--cre-color)' }
    ];

    const handleAttributeToggle = (attrKey: string) => {
      setSelectedAttributes(prev => {
        const newSelected = { ...prev };
        if (newSelected[attrKey]) {
          delete newSelected[attrKey];
        } else {
          newSelected[attrKey] = 10; // Default EXP gain
        }
        return newSelected;
      });
    };

    const handleExpChange = (attrKey: string, exp: string) => {
      setSelectedAttributes(prev => ({
        ...prev,
        [attrKey]: Math.max(1, Math.min(50, parseInt(exp) || 0))
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || Object.keys(selectedAttributes).length === 0) return;

      const expGains: Record<string, number> = {};
      attributeOptions.forEach(attr => {
        expGains[attr.key] = selectedAttributes[attr.key] || 0;
      });

      onSubmit({
        title: title.trim(),
        description: description.trim(),
        expGains
      });
    };

    return (
      <div className="modal-overlay" onClick={onClose} data-name="event-modal" data-file="components/EventModal.js">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">记录人生事件</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <div className="icon-x text-lg text-[var(--text-secondary)]"></div>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                事件标题 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：读完《三体》第一章"
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                心情感悟
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="记录你的感想和收获..."
                rows={3}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                获得经验 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {attributeOptions.map(attr => (
                  <div
                    key={attr.key}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAttributes[attr.key] 
                        ? 'border-2' 
                        : 'border-[var(--border-color)] hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: selectedAttributes[attr.key] ? attr.color : undefined
                    }}
                    onClick={() => handleAttributeToggle(attr.key)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className={`icon-${attr.icon} text-lg`}
                        style={{ color: attr.color }}
                      ></div>
                      <span className="font-medium">{attr.name}</span>
                    </div>
                    {selectedAttributes[attr.key] && (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {[5, 10, 20].map(exp => (
                            <button
                              key={exp}
                              type="button"
                              onClick={() => handleExpChange(attr.key, exp.toString())}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedAttributes[attr.key] === exp
                                  ? 'text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              style={{
                                backgroundColor: selectedAttributes[attr.key] === exp ? attr.color : undefined
                              }}
                            >
                              {exp}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={selectedAttributes[attr.key]}
                          onChange={(e) => handleExpChange(attr.key, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                          placeholder="自定义经验值"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={!title.trim() || Object.keys(selectedAttributes).length === 0}
              >
                保存事件
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('EventModal component error:', error);
    return null;
  }
}

export default EventModal;