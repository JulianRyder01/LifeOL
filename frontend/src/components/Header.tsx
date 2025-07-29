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
  // Count unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-purple-600">
              <span className="mr-2">⚡</span>
              人生Online
            </h1>
            <p className="text-xs text-gray-500 ml-2">让每一次努力都有迹可循</p>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => onTabChange('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              仪表盘
            </button>
            <button 
              onClick={() => onTabChange('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              事件
            </button>
            <button 
              onClick={() => onTabChange('items')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              道具
            </button>
            <button 
              onClick={() => onTabChange('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              任务
            </button>
            <button 
              onClick={() => onTabChange('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              状态
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={onShowAchievements}
              className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {unlockedAchievements > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unlockedAchievements}
                </span>
              )}
            </button>
            
            <button 
              onClick={onAddEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              记录事件
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;