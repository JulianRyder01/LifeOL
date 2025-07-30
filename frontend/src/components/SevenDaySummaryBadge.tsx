import React, { useMemo } from 'react';
import { Event, Attributes } from '../types/app.types';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface SevenDaySummaryBadgeProps {
  events: Event[];
  attributes: Attributes;
}

const SevenDaySummaryBadge: React.FC<SevenDaySummaryBadgeProps> = ({ events, attributes }) => {
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
            attributeGains[attr] += exp;
          }
          totalExpGain += exp;
        });
      }
    });

    return {
      totalExpGain,
      attributeGains,
      eventCount: recentEvents.length
    };
  }, [events]);

  // 获取徽章
  const badge = useMemo(() => {
    const { totalExpGain, attributeGains } = sevenDayStats;
    
    // 徽章列表（按优先级排序）
    const badges: Badge[] = [
      // 总经验值类徽章
      {
        id: 'life-winner',
        title: '人生赢家',
        description: '你像开了挂一样，人生正在高速升级！',
        icon: '🏆'
      },
      {
        id: 'momentum',
        title: '势如破竹',
        description: '进步飞速，无人能挡！',
        icon: '🚀'
      },
      {
        id: 'steady',
        title: '稳步提升',
        description: '每天一点点，进步看得见！',
        icon: '📈'
      },
      {
        id: 'persevering',
        title: '砥砺前行',
        description: '你仍在努力，保持前进的动力！',
        icon: '💪'
      },
      {
        id: '平淡',
        title: '略显平淡',
        description: '最近的生活有点平静，是时候给自己加点料了！',
        icon: '☕'
      },
      
      // 属性专项类徽章
      {
        id: 'study-god',
        title: '学霸附体',
        description: '求知若渴，智商爆表！',
        icon: '🧠'
      },
      {
        id: 'mind-active',
        title: '思维活跃',
        description: '你的大脑正在高速运转，点亮智慧火花！',
        icon: '💡'
      },
      {
        id: 'energetic',
        title: '活力满满',
        description: '精力充沛，身体是革命的本钱！',
        icon: '🏃'
      },
      {
        id: 'fitness',
        title: '体能达人',
        description: '坚持锻炼，健康生活每一天！',
        icon: '💪'
      },
      {
        id: 'charged',
        title: '充电完成',
        description: '懂得休息才能更好地出发，你已充满电！',
        icon: '🔋'
      },
      {
        id: 'efficient',
        title: '高效模式',
        description: '精力管理有方，做事更有效率！',
        icon: '⚡'
      },
      {
        id: 'network',
        title: '人脉广阔',
        description: '交友达人，你的魅力无法阻挡！',
        icon: '👥'
      },
      {
        id: 'social-active',
        title: '社交活跃',
        description: '积极互动，拓展你的社交圈！',
        icon: '🤝'
      },
      {
        id: 'emotion-master',
        title: '情绪大师',
        description: '洞察内心，平衡情绪，你已炉火纯青！',
        icon: '😊'
      },
      {
        id: 'inner-growth',
        title: '内心成长',
        description: '关注自我，你的情感世界正在丰富！',
        icon: '❤️'
      },
      {
        id: 'inspiration',
        title: '灵感爆发',
        description: '创意无限，你的脑洞突破天际！',
        icon: '🎨'
      },
      {
        id: 'creator',
        title: '创想家',
        description: '动手实践，让你的奇思妙想变为现实！',
        icon: '🔧'
      },
      
      // 特殊成就类徽章
      {
        id: 'well-rounded',
        title: '全能战士',
        description: '你全面发展，没有短板！',
        icon: '🏅'
      },
      {
        id: 'breakthrough',
        title: '突破自我',
        description: '恭喜你，又一次超越了自己！',
        icon: '🌟'
      }
    ];

    // 判断满足条件的徽章
    const satisfiedBadges: Badge[] = [];

    // 总经验值类徽章
    if (totalExpGain >= 700) {
      satisfiedBadges.push(badges.find(b => b.id === 'life-winner')!);
    } else if (totalExpGain >= 500) {
      satisfiedBadges.push(badges.find(b => b.id === 'momentum')!);
    } else if (totalExpGain >= 200) {
      satisfiedBadges.push(badges.find(b => b.id === 'steady')!);
    } else if (totalExpGain >= 50) {
      satisfiedBadges.push(badges.find(b => b.id === 'persevering')!);
    } else if (totalExpGain >= -50 && totalExpGain <= 50) {
      satisfiedBadges.push(badges.find(b => b.id === '平淡')!);
    }

    // 属性专项类徽章（找出增益最高的属性）
    const maxAttribute = Object.entries(attributeGains).reduce((max, [attr, gain]) => 
      gain > max.gain ? { attr, gain } : max, { attr: '', gain: -Infinity });
    
    if (maxAttribute.gain > 0) {
      // 检查是否显著高于其他属性（至少是第二名的1.5倍）
      const sortedGains = Object.values(attributeGains).sort((a, b) => b - a);
      const isDominant = sortedGains[0] >= sortedGains[1] * 1.5;
      
      if (isDominant) {
        switch (maxAttribute.attr) {
          case 'int':
            if (attributeGains.int >= 150) {
              satisfiedBadges.push(badges.find(b => b.id === 'study-god')!);
            } else if (attributeGains.int >= 80) {
              satisfiedBadges.push(badges.find(b => b.id === 'mind-active')!);
            }
            break;
          case 'str':
            if (attributeGains.str >= 300) {
              satisfiedBadges.push(badges.find(b => b.id === 'energetic')!);
            } else if (attributeGains.str >= 100) {
              satisfiedBadges.push(badges.find(b => b.id === 'fitness')!);
            }
            break;
          case 'vit':
            if (attributeGains.vit >= 120) {
              satisfiedBadges.push(badges.find(b => b.id === 'charged')!);
            } else if (attributeGains.vit >= 60) {
              satisfiedBadges.push(badges.find(b => b.id === 'efficient')!);
            }
            break;
          case 'cha':
            if (attributeGains.cha >= 150) {
              satisfiedBadges.push(badges.find(b => b.id === 'network')!);
            } else if (attributeGains.cha >= 80) {
              satisfiedBadges.push(badges.find(b => b.id === 'social-active')!);
            }
            break;
          case 'eq':
            if (attributeGains.eq >= 100) {
              satisfiedBadges.push(badges.find(b => b.id === 'emotion-master')!);
            } else if (attributeGains.eq >= 50) {
              satisfiedBadges.push(badges.find(b => b.id === 'inner-growth')!);
            }
            break;
          case 'cre':
            if (attributeGains.cre >= 150) {
              satisfiedBadges.push(badges.find(b => b.id === 'inspiration')!);
            } else if (attributeGains.cre >= 80) {
              satisfiedBadges.push(badges.find(b => b.id === 'creator')!);
            }
            break;
        }
      }
    }

    // 特殊成就类徽章
    // 全能战士：所有属性都有正向增益
    const allPositive = Object.values(attributeGains).every(gain => gain >= 10);
    if (allPositive) {
      satisfiedBadges.push(badges.find(b => b.id === 'well-rounded')!);
    }

    // 如果有满足条件的徽章，返回优先级最高的一个
    if (satisfiedBadges.length > 0) {
      // 返回第一个满足条件的徽章（根据上面的优先级顺序）
      return satisfiedBadges[0];
    }

    // 默认徽章
    return {
      id: 'default',
      title: '继续努力',
      description: '每一天的努力都在为更好的自己铺路！',
      icon: '🌱'
    };
  }, [sevenDayStats]);

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{badge.icon}</div>
        <div className="relative group">
          <h3 className="font-bold text-gray-800">{badge.title}</h3>
          <p className="text-sm text-gray-600">{badge.description}</p>
          {/* 悬停提示框 */}
          <div className="absolute left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-64 z-10 pointer-events-none">
            <p>{badge.description}</p>
            <div className="mt-1 text-gray-300">
              <p>触发条件: 最近七天经验值变化</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SevenDaySummaryBadge;