import React, { useState, memo } from 'react';
import { Achievement } from '../types/app.types';

interface HeaderProps {
  onAddEvent: () => void;
  onShowAchievements: () => void;
  achievements: Achievement[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = memo(({ onAddEvent, onShowAchievements, achievements, activeTab, onTabChange }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [username, setUsername] = useState('秋实');
  const [avatar, setAvatar] = useState('🍁');

  // Calculate unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-purple-600">⚡人生Online <span className="hidden sm:inline text-gray-500 text-sm">让每一次努力都有迹可循</span></h1>
            </div>
            {/* Desktop navigation - hidden on mobile */}
            <nav className="ml-6 hidden md:flex space-x-8">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                仪表盘
              </button>
              <button
                onClick={() => onTabChange('status')}
                className={`${
                  activeTab === 'status'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                状态
              </button>
              
              <button
                onClick={() => onTabChange('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                事件
              </button>
              
              <button
                onClick={() => onTabChange('items')}
                className={`${
                  activeTab === 'items'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                道具
              </button>
              
              <button
                onClick={() => onTabChange('projects')}
                className={`${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                任务
              </button>
              
              <button
                onClick={onShowAchievements}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                成就
                {unlockedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                    {unlockedCount}/{totalCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onAddEvent}
              className="hidden sm:block ml-2 md:ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-200"
            >
              <span className="icon-plus mr-1"></span>
              记录事件
            </button>
            
            <div className="ml-2 md:ml-4 flex items-center md:ml-6">
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="text-xl">{avatar}</span>
                    <span className="ml-2 hidden md:block text-sm font-medium text-gray-700">{username}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {showMobileMenu ? (
                  <span className="icon-x block h-6 w-6"></span>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                onTabChange('dashboard');
                setShowMobileMenu(false);
              }}
              className={`${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              仪表盘
            </button>
            <button
              onClick={() => {
                onTabChange('status');
                setShowMobileMenu(false);
              }}
              className={`${
                activeTab === 'status'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              状态
            </button>
            <button
              onClick={() => {
                onTabChange('events');
                setShowMobileMenu(false);
              }}
              className={`${
                activeTab === 'events'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              事件
            </button>
            <button
              onClick={() => {
                onTabChange('items');
                setShowMobileMenu(false);
              }}
              className={`${
                activeTab === 'items'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              道具
            </button>
            <button
              onClick={() => {
                onTabChange('projects');
                setShowMobileMenu(false);
              }}
              className={`${
                activeTab === 'projects'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200`}
            >
              任务
            </button>
            <button
              onClick={() => {
                onShowAchievements();
                setShowMobileMenu(false);
              }}
              className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200"
            >
              成就
            </button>
            <button
              onClick={() => {
                onAddEvent();
                setShowMobileMenu(false);
              }}
              className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left transition-colors duration-200"
            >
              <span className="icon-plus mr-1"></span>
              记录事件
            </button>
          </div>
        </div>
      )}
    </header>
  );
});

export default Header;