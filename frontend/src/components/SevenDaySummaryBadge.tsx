import React, { useMemo } from 'react';
import { Event, Attributes } from '../types/app.types';
import { ATTRIBUTE_CONFIG, ATTRIBUTE_KEYS } from '../types/attribute.types';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition?: string;
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
      phy: 0,
      wil: 0,
      cha: 0,
      men: 0,
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
      // 属性专项类徽章
      {
        id: 'study-god',
        title: '学神附体',
        description: '智识超群，学习如喝水般轻松！',
        icon: '🧠',
        condition: '七天智识经验值 ≥ 150'
      },
      {
        id: 'mind-active',
        title: '思维活跃',
        description: '大脑高速运转，灵感源源不断！',
        icon: '💡',
        condition: '七天智识经验值 ≥ 80'
      },
      {
        id: 'energetic',
        title: '活力无限',
        description: '体力充沛，仿佛有使不完的劲！',
        icon: '⚡',
        condition: '七天体魄经验值 ≥ 300'
      },
      {
        id: 'fitness',
        title: '健身达人',
        description: '规律运动，身体倍儿棒！',
        icon: '💪',
        condition: '七天体魄经验值 ≥ 100'
      },
      {
        id: 'charged',
        title: '元气满满',
        description: '意志坚定，精神饱满！',
        icon: '🔋',
        condition: '七天意志经验值 ≥ 120'
      },
      {
        id: 'efficient',
        title: '高效能',
        description: '专注力提升，做事效率极高！',
        icon: '⏱️',
        condition: '七天意志经验值 ≥ 60'
      },
      {
        id: 'network',
        title: '社交名流',
        description: '长袖善舞，人脉广泛！',
        icon: '🤝',
        condition: '七天魅力经验值 ≥ 150'
      },
      {
        id: 'social-active',
        title: '活跃分子',
        description: '积极参与社交，朋友遍天下！',
        icon: '🗣️',
        condition: '七天魅力经验值 ≥ 80'
      },
      {
        id: 'emotion-master',
        title: '情商大师',
        description: '洞察人心，情绪管理大师！',
        icon: '❤️',
        condition: '七天心境经验值 ≥ 100'
      },
      {
        id: 'inner-growth',
        title: '内在成长',
        description: '内心平静，自我认知提升！',
        icon: '🧘',
        condition: '七天心境经验值 ≥ 50'
      },
      {
        id: 'inspiration',
        title: '灵感缪斯',
        description: '创意无限，灵感爆棚！',
        icon: '🎨',
        condition: '七天创造经验值 ≥ 150'
      },
      {
        id: 'creator',
        title: '创造者',
        description: '动手能力强，创造美好事物！',
        icon: '🛠️',
        condition: '七天创造经验值 ≥ 80'
      },
      
      // 总经验值类徽章
      {
        id: 'life-winner',
        title: '人生赢家',
        description: '全方位发展，生活丰富多彩！',
        icon: '👑',
        condition: '一周总经验值 ≥ 700'
      },
      {
        id: 'momentum',
        title: '势如破竹',
        description: '保持着良好的发展势头！',
        icon: '🚀',
        condition: '一周总经验值 ≥ 500'
      },
      {
        id: 'steady',
        title: '稳步前行',
        description: '稳定的发展步伐，持续进步！',
        icon: '🚶',
        condition: '一周总经验值 ≥ 200'
      },
      {
        id: 'persevering',
        title: '坚持不懈',
        description: '即使进步微小，也在坚持努力！',
        icon: '🐌',
        condition: '一周总经验值 ≥ 50'
      },
      {
        id: 'plain',
        title: '平淡是真',
        description: '平平淡淡，也有别样精彩！',
        icon: '🍃',
        condition: '一周总经验值在-50到50之间'
      },
      
      // 特殊成就类徽章
      {
        id: 'well-rounded',
        title: '全能战士',
        description: '你全面发展，没有短板！',
        icon: '🏅',
        condition: '所有属性经验值 ≥ 10'
      },
      {
        id: 'breakthrough',
        title: '突破自我',
        description: '恭喜你，又一次超越了自己！',
        icon: '🌟',
        condition: '待定义'
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
      satisfiedBadges.push(badges.find(b => b.id === 'plain')!);
    }

    // 属性专项类徽章（找出增益最高的属性）
    const maxAttribute = Object.entries(attributeGains).reduce((max, [attr, gain]) => 
      gain > max.gain ? { attr, gain } : max, { attr: '', gain: -Infinity });
    
    if (maxAttribute.gain > 0) {
      // 检查是否显著高于其他属性（至少是第二名的1.5倍）
      const sortedGains = Object.values(attributeGains).sort((a, b) => b - a);
      const isDominant = sortedGains[0] >= (sortedGains[1] || 0) * 1.5;
      
      if (isDominant) {
        switch (maxAttribute.attr) {
          case 'int':
            if (attributeGains.int >= 150) {
              satisfiedBadges.push(badges.find(b => b.id === 'study-god')!);
            } else if (attributeGains.int >= 80) {
              satisfiedBadges.push(badges.find(b => b.id === 'mind-active')!);
            }
            break;
          case 'phy':
            if (attributeGains.phy >= 300) {
              satisfiedBadges.push(badges.find(b => b.id === 'energetic')!);
            } else if (attributeGains.phy >= 100) {
              satisfiedBadges.push(badges.find(b => b.id === 'fitness')!);
            }
            break;
          case 'wil':
            if (attributeGains.wil >= 120) {
              satisfiedBadges.push(badges.find(b => b.id === 'charged')!);
            } else if (attributeGains.wil >= 60) {
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
          case 'men':
            if (attributeGains.men >= 100) {
              satisfiedBadges.push(badges.find(b => b.id === 'emotion-master')!);
            } else if (attributeGains.men >= 50) {
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
      // Filter out any undefined entries just in case
      return satisfiedBadges.filter(b => b !== undefined)[0];
    }

    // 默认徽章
    return {
      id: 'default',
      title: '继续努力',
      description: '每一天的努力都在为更好的自己铺路！',
      icon: '🌱',
      condition: '继续积累经验值以解锁徽章'
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
              <p>触发条件: {badge.condition || '最近七天经验值变化'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SevenDaySummaryBadge;