import React from 'react';
import { ArrowRight } from 'lucide-react';
import StatsOverview from './StatsOverview';
import TaskManager from '../features/tasks/TaskManager';
import DailyExpHeatmap from './DailyExpHeatmap';

interface DashboardProps {
  attributes: any;
  events: any[];
  achievements: any[];
  items: any[];
  projectEvents: any[];
  attributeNames: Record<string, string>;
  handleAddProjectEvent: (projectEventData: any) => void;
  handleUpdateProjectEvent: (id: string, progress: number, reason?: string) => void;
  handleCompleteProjectEvent: (id: string) => void;
  handleDeleteProjectEvent: (id: string) => void;
  handleResetProjectEvent: (id: string) => void;
  handleEditProjectEvent: (id: string, updates: Partial<any>) => void;
  setShowAllActivities: (show: boolean) => void;
  setItemToUse: (item: any) => void;
  setShowUseItemModal: (show: boolean) => void;
  getRecentActivities: () => any[];
  formatActivityTime: (timestamp: string) => string;
}

const Dashboard: React.FC<DashboardProps> = ({
  attributes,
  events,
  achievements,
  items,
  projectEvents,
  attributeNames,
  handleAddProjectEvent,
  handleUpdateProjectEvent,
  handleCompleteProjectEvent,
  handleDeleteProjectEvent,
  handleResetProjectEvent,
  handleEditProjectEvent,
  setShowAllActivities,
  setItemToUse,
  setShowUseItemModal,
  getRecentActivities,
  formatActivityTime
}) => {
  return (
    <div className="mt-4 sm:mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <StatsOverview 
              attributes={attributes} 
              achievements={achievements} 
              projectEvents={projectEvents}
              events={events}
            />
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <TaskManager 
              projectEvents={projectEvents}
              items={items}
              onAddProjectEvent={handleAddProjectEvent}
              onUpdateProjectEvent={handleUpdateProjectEvent}
              onCompleteProjectEvent={handleCompleteProjectEvent}
              onDeleteProjectEvent={handleDeleteProjectEvent}
              onResetProjectEvent={handleResetProjectEvent}
              onEditProjectEvent={handleEditProjectEvent}
              attributeNames={attributeNames}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 每日经验热力图 */}
          <DailyExpHeatmap events={events as any} attributes={attributes} />
          
          {/* 当前道具 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">当前道具</h2>
            {items.filter(item => !item.used).length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {items.filter(item => !item.used).slice(0, 6).map((item) => {
                  const isNew = new Date(item.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return (
                    <div 
                      key={item.id} 
                      className="relative flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm cursor-pointer"
                      onClick={() => {
                        setItemToUse(item);
                        setShowUseItemModal(true);
                      }}
                    >
                      {isNew && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                      )}
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl ${item.type === 'consumable' ? 'cursor-pointer hover:bg-gray-200' : ''}`}>
                        {item.icon}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center truncate w-full">{item.name}</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          item.type === 'equipment' 
                            ? 'bg-blue-100 text-blue-800' 
                            : item.type === 'consumable' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'equipment' 
                            ? '装备' 
                            : item.type === 'consumable' 
                              ? '消耗品' 
                              : '收藏品'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {items.filter(item => !item.used).length > 6 && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{items.filter(item => !item.used).length - 6}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">暂无道具</p>
            )}
          </div>
          
          
          {/* 最近活动 */}
          <div className="mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">最近活动</h2>
              <button 
                onClick={() => setShowAllActivities(true)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>全部活动</span>
                <ArrowRight size={16} />
              </button>
            </div>
            
            {getRecentActivities().slice(0, 6).length > 0 ? (
              <div className="space-y-4">
                {getRecentActivities().slice(0, 6).map((event: any) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between flex-wrap">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{event.title}</h3>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatActivityTime(event.timestamp)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {event.expGains && Object.entries(event.expGains).some(([_, exp]) => (exp as number) > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(event.expGains).map(([attr, exp]) => 
                          (exp as number) > 0 ? (
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
                              <span className="hidden sm:inline">{attributeNames[attr] || attr}</span>: +{exp as number} EXP
                            </span>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无活动记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;