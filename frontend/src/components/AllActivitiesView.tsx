import React from 'react';
import { Event, ProjectEvent, Achievement, Item } from '../types/app.types';

interface AllActivitiesViewProps {
  events: Event[];
  projectEvents: ProjectEvent[];
  achievements: Achievement[];
  items: Item[];
  attributeNames: Record<string, string>;
  onReturn: () => void;
}

const AllActivitiesView: React.FC<AllActivitiesViewProps> = ({
  events,
  projectEvents,
  achievements,
  items,
  attributeNames,
  onReturn
}) => {
  // Format time for activities
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Combine all activities and sort by timestamp
  const getAllActivities = () => {
    // Regular events
    const regularEvents = events.map(event => ({
      ...event,
      type: 'event',
      displayTitle: event.title,
      displayDescription: event.description
    }));

    // Task completion events
    const taskEvents = projectEvents
      .filter(task => task.progress >= 100)
      .map(task => ({
        id: `task-${task.id}`,
        title: `完成任务: ${task.title}`,
        description: `成功完成了任务"${task.title}"`,
        timestamp: task.completedAt || task.createdAt,
        expGains: {} as Record<string, number>,
        type: 'task',
        displayTitle: `完成任务: ${task.title}`,
        displayDescription: `成功完成了任务"${task.title}"`
      }));

    // Achievement unlock events
    const achievementEvents = achievements
      .filter(ach => ach.unlockedAt)
      .map(ach => ({
        id: `ach-${ach.id}`,
        title: `解锁成就: ${ach.title}`,
        description: ach.description || '',
        timestamp: ach.unlockedAt || new Date().toISOString(),
        expGains: {} as Record<string, number>,
        type: 'achievement',
        displayTitle: `解锁成就: ${ach.title}`,
        displayDescription: ach.description || ''
      }));

    // Item acquisition events
    const itemEvents = items
      .filter(item => !item.used)
      .map(item => ({
        id: `item-${item.id}`,
        title: `获得道具: ${item.name}`,
        description: item.description || '',
        timestamp: item.createdAt,
        expGains: {} as Record<string, number>,
        type: 'item',
        displayTitle: `获得道具: ${item.name}`,
        displayDescription: item.description || ''
      }));

    // Combine all events and sort by timestamp
    const allEvents = [...regularEvents, ...taskEvents, ...achievementEvents, ...itemEvents];
    return allEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const allActivities = getAllActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">全部活动</h1>
          <button
            onClick={onReturn}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            返回仪表盘
          </button>
        </div>

        {allActivities.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {allActivities.map(activity => (
                <li key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          activity.type === 'event' ? 'bg-blue-100 text-blue-800' :
                          activity.type === 'task' ? 'bg-green-100 text-green-800' :
                          activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-800' :
                          activity.type === 'item' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type === 'event' ? '📝' :
                           activity.type === 'task' ? '✅' :
                           activity.type === 'achievement' ? '🏆' :
                           activity.type === 'item' ? '🎁' : '📌'}
                        </span>
                        <h3 className="ml-3 text-sm font-medium text-gray-900 truncate">
                          {activity.displayTitle}
                        </h3>
                      </div>
                      {activity.displayDescription && (
                        <p className="mt-2 text-sm text-gray-500">
                          {activity.displayDescription}
                        </p>
                      )}
                      {activity.expGains && Object.entries(activity.expGains).some(([_, exp]) => exp > 0) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(activity.expGains).map(([attr, exp]) => 
                            exp > 0 ? (
                              <span 
                                key={attr} 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {attr === 'int' && '🧠'}
                                {attr === 'str' && '💪'}
                                {attr === 'vit' && '⚡'}
                                {attr === 'cha' && '👥'}
                                {attr === 'eq' && '❤️'}
                                {attr === 'cre' && '🎨'}
                                <span className="ml-1">{attributeNames[attr] || attr}: +{exp} EXP</span>
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-sm text-gray-500">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">暂无活动记录</div>
            <button
              onClick={onReturn}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              返回仪表盘
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllActivitiesView;