import { Attributes, Event, Achievement } from '../../types/app.types';

// Helper function to create custom achievement conditions
export const createCustomCondition = (triggerType: string, condition: string) => {
  switch (triggerType) {
    case 'level':
      const [attr, level] = condition.split(':');
      return (attributes: Attributes) => attributes[attr as keyof Attributes] && attributes[attr as keyof Attributes].level >= parseInt(level);
    
    case 'events':
      const count = parseInt(condition);
      return (attributes: Attributes, events: Event[]) => events.length >= count;
    
    case 'keyword':
      const keywords = condition.split(',').map(k => k.trim());
      return (attributes: Attributes, events: Event[]) => events.some(event => 
        keywords.some(keyword => 
          event.title.includes(keyword) || event.description.includes(keyword)
        )
      );
    
    case 'streak':
      const days = parseInt(condition);
      return (attributes: Attributes, events: Event[]) => {
        const today = new Date();
        for (let i = 0; i < days; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() - i);
          const hasEventOnDate = events.some(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate.toDateString() === targetDate.toDateString();
          });
          if (!hasEventOnDate) return false;
        }
        return true;
      };
    
    default:
      return () => false;
  }
};

// Calculate achievement progress
export const calculateAchievementProgress = (achievement: Achievement, attributes: Attributes, events: Event[]): number => {
  if (achievement.unlockedAt) return 100;
  
  if (achievement.triggerType === 'level' && achievement.attributeRequirement && achievement.levelRequirement) {
    const attr = attributes[achievement.attributeRequirement as keyof Attributes];
    if (attr) {
      return Math.min(100, Math.floor((attr.level / achievement.levelRequirement) * 100));
    }
  }
  
  if (achievement.triggerType === 'events' && achievement.triggerCondition) {
    const requiredCount = parseInt(achievement.triggerCondition);
    const currentCount = events.length;
    return Math.min(100, Math.floor((currentCount / requiredCount) * 100));
  }
  
  return achievement.progress || 0;
};