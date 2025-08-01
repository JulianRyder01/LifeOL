import React, { useState } from 'react';
import { AttributeConfig } from '../types/app.types';
import { X } from 'lucide-react';

interface EventModalProps {
  onClose: () => void;
  onSubmit: (eventData: { title: string; description: string; expGains: Record<string, number>; useMarkdown?: boolean }) => void;
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
    const [useMarkdown, setUseMarkdown] = useState(false);
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
        [attrKey]: Math.max(-50, Math.min(50, parseInt(exp) || 0))
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return; // 移除了经验选择的必填限制

      const expGains: Record<string, number> = {};
      attributeOptions.forEach(attr => {
        expGains[attr.key] = selectedAttributes[attr.key] || 0;
      });

      onSubmit({
        title: title.trim(),
        description: description.trim(),
        expGains,
        useMarkdown
      });
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

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">记录人生事件</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">事件标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：读完《三体》第一章"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">心灵感悟</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="event-markdown"
                      checked={useMarkdown}
                      onChange={(e) => setUseMarkdown(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="event-markdown" className="ml-1 text-sm text-gray-600">
                      使用Markdown
                    </label>
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="记录你的感想和收获..."
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {useMarkdown && (
                  <p className="mt-1 text-xs text-gray-500">
                    支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  经验值变化（可选）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {attributeOptions.map(attr => (
                    <div
                      key={attr.key}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedAttributes[attr.key] 
                          ? 'border-2' 
                          : 'border-gray-200 hover:border-gray-300'
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
                          <div className="flex gap-1 flex-wrap">
                            {[-10, -5, 5, 10, 20].map(exp => (
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
                                {exp > 0 ? `+${exp}` : exp}
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            min="-50"
                            max="50"
                            value={selectedAttributes[attr.key]}
                            onChange={(e) => handleExpChange(attr.key, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="自定义经验值"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!title.trim()}
                >
                  保存事件
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('EventModal component error:', error);
    return null;
  }
}

export default EventModal;