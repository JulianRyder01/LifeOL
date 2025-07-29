import React, { useState } from 'react';
import { Achievement } from '../types/app.types';

interface HeaderProps {
  onAddEvent: () => void;
  onShowAchievements: () => void;
  achievements: Achievement[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function Header({ onAddEvent, onShowAchievements, achievements, activeTab, onTabChange }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
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
              <h1 className="text-xl font-bold text-gray-900">LifeOL</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                仪表盘
              </button>
              <button
                onClick={() => onTabChange('status')}
                className={`${
                  activeTab === 'status'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                状态
              </button>
              <button
                onClick={() => onTabChange('items')}
                className={`${
                  activeTab === 'items'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                道具
              </button>
              <button
                onClick={() => onTabChange('projects')}
                className={`${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                任务
              </button>
              <button
                onClick={() => onTabChange('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                事件
              </button>
              <button
                onClick={() => onTabChange('achievements')}
                className={`${
                  activeTab === 'achievements'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                成就
                {unlockedCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {unlockedCount}/{totalCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onAddEvent}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              记录事件
            </button>
            
            {/* 用户按钮 */}
            <div className="ml-4 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="text-2xl">{avatar}</span>
              </button>
              
              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500">用户</p>
                  </div>
                  <button
                    onClick={() => {
                      onTabChange('user-settings');
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    设置
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('user-settings');
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    关于开发者
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('user-settings');
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    重开人生
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;