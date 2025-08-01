import React, { useState, useEffect, lazy, Suspense, memo, useMemo } from 'react';
import Header from './components/Header';
import EventModal from './components/EventModal';
import AchievementModal from './components/AchievementModal';
import StatusPanel from './components/StatusPanel';
import NotFound from './components/NotFound';
import DailyExpHeatmap from './components/DailyExpHeatmap';
import AllActivitiesView from './components/AllActivitiesView';
import Dashboard from './components/Dashboard';
import { useApp } from './hooks/useApp';
import { AppProvider } from './contexts/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight } from 'lucide-react';

// Import components from their correct locations
import ItemSystem from './features/items/ItemSystem';
import TaskManager from './features/tasks/TaskManager';
import EventManager from './features/events/EventManager';
import AchievementSystem from './components/AchievementSystem';
import UserSettings from './features/user/UserSettings';

// Lazy load components that are not immediately needed
const LazyEventManager = lazy(() => import('./features/events/EventManager'));
const LazyItemSystem = lazy(() => import('./features/items/ItemSystem'));
const LazyTaskManager = lazy(() => import('./features/tasks/TaskManager'));
const LazyStatusPanel = lazy(() => import('./components/StatusPanel'));
const LazyAchievementSystem = lazy(() => import('./components/AchievementSystem'));
const LazyUserSettings = lazy(() => import('./features/user/UserSettings'));
const LazyAllActivitiesView = lazy(() => import('./components/AllActivitiesView'));

interface AppState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出现了一些问题</h1>
            <p className="text-gray-600 mb-4">很抱歉，发生了意外错误。</p>
            {this.state.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-mono text-sm">{this.state.error.toString()}</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              重新加载
            </button>
          </div>
      );
    }

    return this.props.children;
  }
}

// Memoized component for the items grid to prevent unnecessary re-renders
const ItemsGrid = memo(({ 
  items, 
  setItemToUse, 
  setShowUseItemModal,
  attributeNames
}: {
  items: any[];
  setItemToUse: (item: any) => void;
  setShowUseItemModal: (show: boolean) => void;
  attributeNames: Record<string, string>;
}) => {
  const unusedItems = useMemo(() => items.filter(item => !item.used), [items]);
  const displayItems = useMemo(() => unusedItems.slice(0, 6), [unusedItems]);
  
  if (unusedItems.length === 0) {
    return <p className="text-gray-500">暂无道具</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {displayItems.map((item, index) => {
        const isNew = new Date(item.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
        return (
          <div 
            key={item.id} 
            className="relative flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm cursor-pointer transition-all duration-200"
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
      {unusedItems.length > 6 && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-500">+{unusedItems.length - 6}</span>
          </div>
        </div>
      )}
    </div>
  );
});

// Memoized component for recent activities to prevent unnecessary re-renders
const RecentActivities = memo(({ 
  getRecentActivities, 
  formatActivityTime,
  attributeNames,
  setShowAllActivities
}: {
  getRecentActivities: () => any[];
  formatActivityTime: (timestamp: string) => string;
  attributeNames: Record<string, string>;
  setShowAllActivities: (show: boolean) => void;
}) => {
  const recentActivities = useMemo(() => getRecentActivities().slice(0, 6), [getRecentActivities]);
  
  return (
    <div className="mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">最近活动</h2>
        <button 
          onClick={() => setShowAllActivities(true)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-200"
        >
          <span>全部活动</span>
          <ArrowRight size={16} />
        </button>
      </div>
      
      {recentActivities.length > 0 ? (
        <div className="space-y-4">
          {recentActivities.map(event => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
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
  );
});

const App: React.FC = memo(() => {
  try {
    // Use the custom hook to manage state and business logic
    const appContextValue = useApp();

    // State for error handling
    const [hasError, setHasError] = useState(false);

    // Handle tab change
    const handleTabChange = (tab: string) => {
      appContextValue.setActiveTab(tab);
      // Reset error state when changing tabs
      setHasError(false);
    };

    // Memoize the recent activities data
    const recentActivitiesData = useMemo(() => ({
      getRecentActivities: appContextValue.getRecentActivities,
      formatActivityTime: appContextValue.formatActivityTime,
      attributeNames: appContextValue.attributeNames,
      setShowAllActivities: appContextValue.setShowAllActivities
    }), [
      appContextValue.getRecentActivities,
      appContextValue.formatActivityTime,
      appContextValue.attributeNames,
      appContextValue.setShowAllActivities
    ]);

    if (hasError) {
      return (
        <NotFound onReturnToDashboard={() => {
          appContextValue.setActiveTab('dashboard');
          setHasError(false);
        }} />
      );
    }

    if (appContextValue.showAllActivities) {
      return (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <LazyAllActivitiesView
            events={appContextValue.events}
            projectEvents={appContextValue.projectEvents}
            achievements={appContextValue.achievements}
            items={appContextValue.items}
            attributeNames={appContextValue.attributeNames}
            onReturn={() => appContextValue.setShowAllActivities(false)}
          />
        </Suspense>
      );
    }

    return (
      <ErrorBoundary>
        <AppProvider value={appContextValue}>
          <div className="min-h-screen bg-gray-50">
            <ToastContainer 
              position="top-right" 
              autoClose={5000} 
              hideProgressBar={false} 
              newestOnTop={false} 
              closeOnClick 
              rtl={false} 
              pauseOnFocusLoss 
              draggable 
              pauseOnHover
              theme="light"
              aria-label="Notification"
            />
            <Header 
              onAddEvent={() => appContextValue.setShowEventModal(true)}
              onShowAchievements={() => appContextValue.setActiveTab('achievements')}
              achievements={appContextValue.achievements}
              activeTab={appContextValue.activeTab}
              onTabChange={handleTabChange}
            />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              {/* Dashboard Tab */}
              {appContextValue.activeTab === 'dashboard' && (
                <Dashboard
                  attributes={appContextValue.attributes}
                  events={appContextValue.events}
                  achievements={appContextValue.achievements}
                  items={appContextValue.items}
                  projectEvents={appContextValue.projectEvents}
                  attributeNames={appContextValue.attributeNames}
                  handleAddProjectEvent={appContextValue.handleAddProjectEvent}
                  handleUpdateProjectEvent={appContextValue.handleUpdateProjectEvent}
                  handleCompleteProjectEvent={appContextValue.handleCompleteProjectEvent}
                  handleDeleteProjectEvent={appContextValue.handleDeleteProjectEvent}
                  handleResetProjectEvent={appContextValue.handleResetProjectEvent}
                  handleEditProjectEvent={appContextValue.handleEditProjectEvent}
                  setShowAllActivities={appContextValue.setShowAllActivities}
                  setItemToUse={appContextValue.setItemToUse}
                  setShowUseItemModal={appContextValue.setShowUseItemModal}
                  getRecentActivities={appContextValue.getRecentActivities}
                  formatActivityTime={appContextValue.formatActivityTime}
                />
              )}
              
              {/* Events Tab */}
              {appContextValue.activeTab === 'events' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyEventManager 
                      events={appContextValue.events} 
                      onDeleteEvent={appContextValue.handleDeleteEvent}
                      onUpdateEvent={appContextValue.handleUpdateEvent}
                      attributeNames={appContextValue.attributeNames}
                    />
                  </Suspense>
                </div>
              )}
              
              {/* Items Tab */}
              {appContextValue.activeTab === 'items' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyItemSystem 
                      items={appContextValue.items} 
                      onAddItem={appContextValue.handleAddItem} 
                      onUseItem={appContextValue.handleUseItem}
                      onUndoUseItem={appContextValue.undoUseItem}
                      onUpdateItem={appContextValue.handleUpdateItem}
                      attributeNames={appContextValue.attributeNames}
                    />
                  </Suspense>
                </div>
              )}
              
              {/* Tasks Tab */}
              {appContextValue.activeTab === 'projects' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyTaskManager 
                      projectEvents={appContextValue.projectEvents}
                      items={appContextValue.items}
                      onAddProjectEvent={appContextValue.handleAddProjectEvent}
                      onUpdateProjectEvent={appContextValue.handleUpdateProjectEvent}
                      onCompleteProjectEvent={appContextValue.handleCompleteProjectEvent}
                      onDeleteProjectEvent={appContextValue.handleDeleteProjectEvent}
                      onResetProjectEvent={appContextValue.handleResetProjectEvent}
                      onEditProjectEvent={appContextValue.handleEditProjectEvent}
                      attributeNames={appContextValue.attributeNames}
                    />
                  </Suspense>
                </div>
              )}
              
              {/* Status Tab */}
              {appContextValue.activeTab === 'status' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyStatusPanel 
                      attributes={appContextValue.attributes} 
                      achievements={appContextValue.achievements}
                      selectedTitles={appContextValue.selectedTitles}
                      onTitleChange={appContextValue.handleTitleChange}
                    />
                  </Suspense>
                </div>
              )}
              
              {/* Achievements Tab */}
              {appContextValue.activeTab === 'achievements' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyAchievementSystem 
                      achievements={appContextValue.achievements}
                      attributes={appContextValue.attributes}
                      selectedTitles={appContextValue.selectedTitles}
                      onTitleChange={appContextValue.handleTitleChange}
                      events={appContextValue.events}
                      onAddCustomAchievement={appContextValue.handleAddCustomAchievement}
                      onAddCustomTitle={appContextValue.handleAddCustomTitle}
                      onAddCustomBadge={appContextValue.handleAddCustomBadge}
                    />
                  </Suspense>
                </div>
              )}
              
              {/* User Settings Tab */}
              {appContextValue.activeTab === 'user-settings' && (
                <div className="mt-4 sm:mt-8">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
                    <LazyUserSettings 
                      userConfig={{
                        username: '秋实',
                        avatar: '🍁'
                      }}
                      onUserConfigChange={(config) => {
                        // Handle user config change
                        console.log('User config changed:', config);
                      }}
                      onBack={() => appContextValue.setActiveTab('dashboard')}
                    />
                  </Suspense>
                </div>
              )}
            </main>

            {appContextValue.showEventModal && (
              <EventModal 
                onClose={() => appContextValue.setShowEventModal(false)}
                onSubmit={appContextValue.handleAddEvent}
              />
            )}

            {appContextValue.showAchievementModal && (
              <AchievementModal 
                onClose={() => appContextValue.setShowAchievementModal(false)}
                onSubmit={appContextValue.handleAddCustomAchievement}
                achievements={appContextValue.achievements}
              />
            )}

            {appContextValue.showUseItemModal && appContextValue.itemToUse && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900">使用道具</h3>
                    <div className="mt-2">
                      <p className="text-gray-500">
                        确定要使用道具 <span className="font-medium text-gray-900">{appContextValue.itemToUse.name}</span> 吗？
                      </p>
                      {appContextValue.itemToUse.effects && appContextValue.itemToUse.effects.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700">道具效果:</p>
                          <ul className="mt-1 text-sm text-gray-500">
                            {appContextValue.itemToUse.effects.map((effect, index) => (
                              <li key={index}>
                                {appContextValue.attributeNames[effect.attribute] || effect.attribute}: {effect.type === 'fixed' ? '+' : '+'}{effect.value}
                                {effect.type === 'percentage' ? '%' : ' EXP'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 flex justify-end space-x-3">
                      <button
                        onClick={() => appContextValue.setShowUseItemModal(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      >
                        取消
                      </button>
                      <button
                        onClick={appContextValue.confirmUseItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        确认使用
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AppProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <NotFound onReturnToDashboard={() => window.location.reload()} />
    );
  }
});

export default App;