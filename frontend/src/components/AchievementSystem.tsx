import React, { useMemo, useState } from 'react';
import { Achievement, Event, Attributes } from '../types/app.types';
import { calculateAchievementProgress } from '../utils/achievements';
import SevenDaySummaryBadge from './SevenDaySummaryBadge';
import { ATTRIBUTE_CONFIG, ATTRIBUTE_KEYS } from '../types/attribute.types';

interface AchievementSystemProps {
  achievements: Achievement[];
  attributes: Attributes;
  onTitleChange: (selectedTitles: string[]) => void;
  selectedTitles: string[];
  events: Event[];
  onAddCustomAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedAt' | 'isTitle'>) => void;
  onAddCustomTitle: (title: Omit<Achievement, 'id' | 'unlockedAt'>) => void;
  onAddCustomBadge: (badge: Omit<Achievement, 'id' | 'unlockedAt' | 'isTitle'>) => void;
}

// 定义徽章类型
interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition?: string;
  unlocked: boolean;
  unlockDate?: Date;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  attributes,
  onTitleChange,
  selectedTitles,
  events,
  onAddCustomAchievement,
  onAddCustomTitle,
  onAddCustomBadge
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeCategory, setActiveCategory] = useState<'achievement' | 'title' | 'badge'>('achievement');
  const [showAddAchievementForm, setShowAddAchievementForm] = useState(false);
  const [showAddTitleForm, setShowAddTitleForm] = useState(false);
  const [showAddBadgeForm, setShowAddBadgeForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    icon: '🏆',
    triggerType: 'manual' as 'manual' | 'level' | 'events' | 'keyword' | 'streak',
    triggerCondition: '',
    useMarkdown: false
  });
  const [newTitle, setNewTitle] = useState({
    title: '',
    description: '',
    icon: '🥇',
    attributeRequirement: 'int' as keyof Attributes,
    levelRequirement: 5,
    useMarkdown: false
  });
  const [newBadge, setNewBadge] = useState({
    title: '',
    description: '',
    icon: '🎖️',
    useMarkdown: false
  });

  // 计算最近七天的统计数据
  const sevenDayStats = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 包含今天，共7天

    // 过滤最近七天的事件
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= sevenDaysAgo && eventDate <= today;
    });

    // 计算总经验值增益
    let totalExpGain = 0;
    
    // 计算各属性经验值增益
    const attributeGains: Record<string, number> = {
      int: 0,
      str: 0,
      vit: 0,
      cha: 0,
      eq: 0,
      cre: 0
    };

    // 遍历事件计算经验值
    recentEvents.forEach(event => {
      if (event.expGains) {
        Object.entries(event.expGains).forEach(([attr, exp]) => {
          if (attributeGains.hasOwnProperty(attr)) {
            attributeGains[attr] += exp as number;
          }
          totalExpGain += exp as number;
        });
      }
    });

    return {
      totalExpGain,
      attributeGains,
      eventCount: recentEvents.length
    };
  }, [events]);

  // 获取所有可能的徽章
  const allBadges = useMemo(() => {
    const { totalExpGain, attributeGains } = sevenDayStats;
    
    // 徽章列表（按优先级排序）
    const badges: Badge[] = [
      // 属性专项类徽章
      ...ATTRIBUTE_KEYS.map((key) => {
        const config = ATTRIBUTE_CONFIG[key];
        return {
          id: `${config.name.toLowerCase()}-enthusiast`,
          title: `${config.name}爱好者`,
          description: `你在${config.name}方面表现出浓厚兴趣！`,
          icon: config.icon,
          condition: `${config.name}属性经验值 ≥ 50`,
          unlocked: false // Default to false, will be updated based on user progress
        };
      }),
      
      // 总经验值类徽章
      {
        id: 'beginner',
        title: '初入江湖',
        description: '刚刚起步，未来可期！',
        icon: '🌱',
        condition: '总经验值 ≥ 100',
        unlocked: false
      },
      {
        id: 'explorer',
        title: '探索者',
        description: '继续探索，发现更多可能！',
        icon: '🔍',
        condition: '总经验值 ≥ 500',
        unlocked: false
      },
      {
        id: 'veteran',
        title: '资深玩家',
        description: '你已经积累了不少经验！',
        icon: '🏆',
        condition: '总经验值 ≥ 1000',
        unlocked: false
      },
      
      // 特殊成就类徽章
      {
        id: 'well-rounded',
        title: '全能战士',
        description: '你全面发展，没有短板！',
        icon: '🏅',
        condition: '所有属性经验值 ≥ 10',
        unlocked: false
      },
      {
        id: 'breakthrough',
        title: '突破自我',
        description: '恭喜你，又一次超越了自己！',
        icon: '🌟',
        condition: '任意单个属性经验值 ≥ 200',
        unlocked: false
      }
    ];

    return badges;
  }, [sevenDayStats]);

  // 根据当前标签筛选徽章
  const filteredBadges = useMemo(() => {
    switch (activeTab) {
      case 'unlocked':
        return allBadges.filter(badge => badge.unlocked);
      case 'locked':
        return allBadges.filter(badge => !badge.unlocked);
      default:
        return allBadges;
    }
  }, [allBadges, activeTab]);

  // Filter achievements based on active tab and category
  const filteredItems = useMemo(() => {
    let items = achievements;
    
    // Filter by category first
    switch (activeCategory) {
      case 'achievement':
        items = items.filter(item => !item.isTitle);
        break;
      case 'title':
        items = items.filter(item => item.isTitle);
        break;
      case 'badge':
        // Badges are handled separately
        return [];
    }
    
    // Then filter by tab
    switch (activeTab) {
      case 'unlocked':
        return items.filter(item => item.unlockedAt !== null);
      case 'locked':
        return items.filter(item => item.unlockedAt === null);
      default:
        return items;
    }
  }, [achievements, activeTab, activeCategory]);

  // Count achievements
  const achievementUnlockedCount = achievements.filter(a => a.unlockedAt && !a.isTitle).length;
  const achievementTotalCount = achievements.filter(a => !a.isTitle).length;
  const titleUnlockedCount = achievements.filter(a => a.isTitle && a.unlockedAt).length;
  const titleTotalCount = achievements.filter(a => a.isTitle).length;
  const badgeUnlockedCount = allBadges.filter(b => b.unlocked).length;
  const badgeTotalCount = allBadges.length;

  // Handle title selection
  const handleTitleSelect = (titleId: string) => {
    const newSelectedTitles = [...selectedTitles];
    const titleIndex = newSelectedTitles.indexOf(titleId);

    if (titleIndex >= 0) {
      // Remove title if already selected
      newSelectedTitles.splice(titleIndex, 1);
    } else {
      // Add title if not selected and we have less than 2 titles
      if (newSelectedTitles.length < 2) {
        newSelectedTitles.push(titleId);
      } else {
        // Replace the first title if we already have 2
        newSelectedTitles[0] = titleId;
      }
    }

    onTitleChange(newSelectedTitles);
  };

  // Get attribute name by key
  const getAttributeName = (attrKey: string) => {
    const attributeNames: Record<string, string> = {
      int: '智力',
      str: '体魄',
      vit: '精力',
      cha: '社交',
      eq: '情感',
      cre: '创造'
    };
    return attributeNames[attrKey] || attrKey;
  };

  // Get trigger condition description for custom achievements
  const getTriggerConditionDescription = (achievement: Achievement) => {
    if (!achievement.isCustom || !achievement.triggerType) return '';

    switch (achievement.triggerType) {
      case 'level':
        if (achievement.triggerCondition) {
          const [attr, level] = achievement.triggerCondition.split(':');
          return `当${getAttributeName(attr)}达到${level}级时解锁`;
        }
        return '';
      case 'events':
        return `记录${achievement.triggerCondition}个事件后解锁`;
      case 'keyword':
        return `记录包含关键词"${achievement.triggerCondition}"的事件后解锁`;
      case 'streak':
        return `连续${achievement.triggerCondition}天记录事件后解锁`;
      case 'manual':
        return '手动解锁的成就';
      default:
        return achievement.triggerCondition || '';
    }
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

  const handleAddAchievement = () => {
    if (!newAchievement.title.trim()) return;
    
    onAddCustomAchievement({
      title: newAchievement.title,
      description: newAchievement.description,
      icon: newAchievement.icon,
      isCustom: true,
      triggerType: newAchievement.triggerType,
      triggerCondition: newAchievement.triggerCondition,
      progress: 0,
      target: newAchievement.triggerType === 'events' ? parseInt(newAchievement.triggerCondition) || 10 : 
              newAchievement.triggerType === 'streak' ? parseInt(newAchievement.triggerCondition) || 3 : 
              newAchievement.triggerType === 'level' ? 1 : undefined,
      useMarkdown: newAchievement.useMarkdown
    });
    
    setNewAchievement({
      title: '',
      description: '',
      icon: '🏆',
      triggerType: 'manual',
      triggerCondition: '',
      useMarkdown: false
    });
    setShowAddAchievementForm(false);
  };

  const handleAddTitle = () => {
    if (!newTitle.title.trim()) return;
    
    onAddCustomTitle({
      title: newTitle.title,
      description: newTitle.description,
      icon: newTitle.icon,
      isCustom: true,
      isTitle: true,
      triggerType: 'level',
      triggerCondition: `${String(newTitle.attributeRequirement)}:${newTitle.levelRequirement}`,
      attributeRequirement: newTitle.attributeRequirement,
      levelRequirement: newTitle.levelRequirement,
      useMarkdown: newTitle.useMarkdown
    });
    
    setNewTitle({
      title: '',
      description: '',
      icon: '🥇',
      attributeRequirement: 'int',
      levelRequirement: 5,
      useMarkdown: false
    });
    setShowAddTitleForm(false);
  };

  const handleAddBadge = () => {
    if (!newBadge.title.trim()) return;
    
    onAddCustomBadge({
      title: newBadge.title,
      description: newBadge.description,
      icon: newBadge.icon,
      isCustom: true,
      useMarkdown: newBadge.useMarkdown
    });
    
    setNewBadge({
      title: '',
      description: '',
      icon: '🎖️',
      useMarkdown: false
    });
    setShowAddBadgeForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">我的成就星碑</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {achievementTotalCount > 0 ? Math.round((achievementUnlockedCount / achievementTotalCount) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">成就解锁程度</div>
          <div className="text-xs text-gray-500 mt-1">
            {achievementUnlockedCount}已解锁 / {achievementTotalCount - achievementUnlockedCount}未解锁
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {titleTotalCount > 0 ? Math.round((titleUnlockedCount / titleTotalCount) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">称号解锁程度</div>
          <div className="text-xs text-gray-500 mt-1">
            {titleUnlockedCount}已解锁 / {titleTotalCount - titleUnlockedCount}未解锁
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {badgeTotalCount > 0 ? Math.round((badgeUnlockedCount / badgeTotalCount) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">徽章解锁程度</div>
          <div className="text-xs text-gray-500 mt-1">
            {badgeUnlockedCount}已解锁 / {badgeTotalCount - badgeUnlockedCount}未解锁
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => {
            setActiveCategory('achievement');
            setActiveTab('all');
          }}
          className={`py-2 px-4 text-sm font-medium ${
            activeCategory === 'achievement'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          成就
        </button>
        <button
          onClick={() => {
            setActiveCategory('title');
            setActiveTab('all');
          }}
          className={`py-2 px-4 text-sm font-medium ${
            activeCategory === 'title'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          称号
        </button>
        <button
          onClick={() => {
            setActiveCategory('badge');
            setActiveTab('all');
          }}
          className={`py-2 px-4 text-sm font-medium ${
            activeCategory === 'badge'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          徽章
        </button>
      </div>

      {/* Sub-tabs for achievements and titles */}
      {activeCategory !== 'badge' && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'unlocked'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已解锁
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'locked'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            未解锁
          </button>
          <button
            onClick={() => {
              if (activeCategory === 'achievement') {
                setShowAddAchievementForm(true);
              } else if (activeCategory === 'title') {
                setShowAddTitleForm(true);
              }
            }}
            className="ml-auto py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + 添加自定义{activeCategory === 'achievement' ? '成就' : '称号'}
          </button>
        </div>
      )}

      {/* Sub-tabs for badges */}
      {activeCategory === 'badge' && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'unlocked'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已解锁
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'locked'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            未解锁
          </button>
          <button
            onClick={() => setShowAddBadgeForm(true)}
            className="ml-auto py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + 添加自定义徽章
          </button>
        </div>
      )}

      {/* Badges Tab Content */}
      {activeCategory === 'badge' ? (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">七日总结徽章</h3>
            <p className="text-sm text-gray-500 mt-1">
              徽章根据您最近七天的表现自动生成，每天更新。
            </p>
          </div>
          
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === 'unlocked' ? '暂无已解锁徽章' : activeTab === 'locked' ? '暂无未解锁徽章' : '暂无徽章'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'unlocked' 
                  ? '继续努力，解锁更多徽章' 
                  : activeTab === 'locked' 
                    ? '继续保持，争取解锁更多徽章' 
                    : '根据您的活动表现，暂无匹配的徽章'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`border rounded-lg p-4 ${
                    badge.unlocked 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      badge.unlocked 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <div className="text-xl">{badge.icon}</div>
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className={`font-medium ${
                          badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {badge.title}
                        </h3>
                      </div>

                      <div className={`mt-1 text-sm ${
                        badge.unlocked ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {badge.description}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        触发条件: {badge.condition}
                      </div>

                      {badge.unlocked && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          已解锁
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeCategory === 'title' ? '暂无称号' : '暂无成就'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'locked' 
              ? '继续努力，解锁更多' + (activeCategory === 'title' ? '称号' : '成就') 
              : activeCategory === 'title' 
                ? '提升属性等级以解锁称号' 
                : '开始记录事件以解锁成就'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                if (activeCategory === 'achievement') {
                  setShowAddAchievementForm(true);
                } else if (activeCategory === 'title') {
                  setShowAddTitleForm(true);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              创建第一个自定义{activeCategory === 'achievement' ? '成就' : '称号'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(achievement => {
            const progress = calculateAchievementProgress(achievement, attributes, []);
            const isTitleSelected = selectedTitles.includes(achievement.id);
            const isUnlocked = !!achievement.unlockedAt;
            const triggerConditionDescription = getTriggerConditionDescription(achievement);

            return (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  isUnlocked 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUnlocked 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {achievement.icon ? (
                      <div className="text-xl">{achievement.icon}</div>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${
                        isUnlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                        {achievement.isTitle && achievement.attributeRequirement && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            称号-{getAttributeName(achievement.attributeRequirement)}
                          </span>
                        )}
                        {achievement.isTitle && !achievement.attributeRequirement && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            称号
                          </span>
                        )}
                        {achievement.isCustom && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            自我{activeCategory === 'title' ? '称号' : activeCategory === 'achievement' ? '成就' : '徽章'}
                          </span>
                        )}
                        {!achievement.isCustom && !achievement.isTitle && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            内置成就
                          </span>
                        )}
                        {!achievement.isCustom && achievement.isTitle && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            内置称号
                          </span>
                        )}
                      </h3>
                      {isUnlocked && achievement.isTitle && (
                        <button
                          onClick={() => handleTitleSelect(achievement.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            isTitleSelected
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {isTitleSelected ? '已选择' : '选择'}
                        </button>
                      )}
                    </div>

                    <div className={`mt-1 text-sm ${
                      isUnlocked ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {renderDescription(achievement.description, achievement.useMarkdown)}
                    </div>

                    {achievement.isCustom && triggerConditionDescription && (
                      <p className="mt-1 text-xs text-gray-500">
                        触发条件: {triggerConditionDescription}
                      </p>
                    )}

                    {!isUnlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {isUnlocked && achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchievementForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加自定义成就</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="achievement-markdown"
                        checked={newAchievement.useMarkdown}
                        onChange={(e) => setNewAchievement({...newAchievement, useMarkdown: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="achievement-markdown" className="ml-1 text-sm text-gray-600">
                        使用Markdown
                      </label>
                    </div>
                  </div>
                  <textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {newAchievement.useMarkdown && (
                    <p className="mt-1 text-xs text-gray-500">
                      支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <input
                    type="text"
                    value={newAchievement.icon}
                    onChange={(e) => setNewAchievement({...newAchievement, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入emoji或字符"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">触发类型</label>
                  <select
                    value={newAchievement.triggerType}
                    onChange={(e) => setNewAchievement({...newAchievement, triggerType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="manual">手动解锁</option>
                    <option value="level">属性等级</option>
                    <option value="events">事件数量</option>
                    <option value="keyword">关键词匹配</option>
                    <option value="streak">连续记录天数</option>
                  </select>
                </div>
                
                {newAchievement.triggerType !== 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {newAchievement.triggerType === 'level' && '属性及等级要求'}
                      {newAchievement.triggerType === 'events' && '事件数量'}
                      {newAchievement.triggerType === 'keyword' && '关键词'}
                      {newAchievement.triggerType === 'streak' && '连续天数'}
                    </label>
                    {newAchievement.triggerType === 'level' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={String(newAchievement.triggerCondition.split(':')[0] || 'int')}
                          onChange={(e) => setNewAchievement({...newAchievement, triggerCondition: e.target.value + ':' + (newAchievement.triggerCondition.split(':')[1] || '5')})}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {['int', 'str', 'vit', 'cha', 'eq', 'cre'].map((attr) => (
                            <option key={attr} value={attr}>
                              {{int: '智力', str: '体魄', vit: '精力', cha: '社交', eq: '情感', cre: '创造'}[attr]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={newAchievement.triggerCondition.split(':')[1] || '5'}
                          onChange={(e) => setNewAchievement({...newAchievement, triggerCondition: (newAchievement.triggerCondition.split(':')[0] || 'int') + ':' + e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={newAchievement.triggerCondition}
                        onChange={(e) => setNewAchievement({...newAchievement, triggerCondition: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={
                          newAchievement.triggerType === 'events' ? '例如: 10' :
                          newAchievement.triggerType === 'keyword' ? '例如: 学习' :
                          newAchievement.triggerType === 'streak' ? '例如: 7' : ''
                        }
                      />
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddAchievementForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddAchievement}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Title Modal */}
      {showAddTitleForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加自定义称号</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newTitle.title}
                    onChange={(e) => setNewTitle({...newTitle, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="title-markdown"
                        checked={newTitle.useMarkdown}
                        onChange={(e) => setNewTitle({...newTitle, useMarkdown: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="title-markdown" className="ml-1 text-sm text-gray-600">
                        使用Markdown
                      </label>
                    </div>
                  </div>
                  <textarea
                    value={newTitle.description}
                    onChange={(e) => setNewTitle({...newTitle, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {newTitle.useMarkdown && (
                    <p className="mt-1 text-xs text-gray-500">
                      支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <input
                    type="text"
                    value={newTitle.icon}
                    onChange={(e) => setNewTitle({...newTitle, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入emoji或字符"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">属性要求</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={String(newTitle.attributeRequirement)}
                      onChange={(e) => setNewTitle({...newTitle, attributeRequirement: e.target.value as keyof Attributes})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {['int', 'str', 'vit', 'cha', 'eq', 'cre'].map((attr) => (
                        <option key={attr} value={attr}>
                          {{int: '智力', str: '体魄', vit: '精力', cha: '社交', eq: '情感', cre: '创造'}[attr]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newTitle.levelRequirement}
                      onChange={(e) => setNewTitle({...newTitle, levelRequirement: parseInt(e.target.value) || 5})}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddTitleForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddTitle}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Badge Modal */}
      {showAddBadgeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加自定义徽章</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={newBadge.title}
                    onChange={(e) => setNewBadge({...newBadge, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="badge-markdown"
                        checked={newBadge.useMarkdown}
                        onChange={(e) => setNewBadge({...newBadge, useMarkdown: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="badge-markdown" className="ml-1 text-sm text-gray-600">
                        使用Markdown
                      </label>
                    </div>
                  </div>
                  <textarea
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {newBadge.useMarkdown && (
                    <p className="mt-1 text-xs text-gray-500">
                      支持 **粗体**、*斜体*、`代码` 等基本Markdown语法
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <input
                    type="text"
                    value={newBadge.icon}
                    onChange={(e) => setNewBadge({...newBadge, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入emoji或字符"
                  />
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddBadgeForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddBadge}
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
};

export default AchievementSystem;