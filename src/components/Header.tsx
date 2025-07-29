import React from 'react';
import { Achievement } from '../types/app.types.ts';

interface HeaderProps {
  onAddEvent: () => void;
  onShowAchievements: () => void;
  achievements: Achievement[];
}

function Header({ onAddEvent, onShowAchievements, achievements }: HeaderProps) {
  try {
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    
    return (
      <header className="bg-white border-b border-[var(--border-color)] sticky top-0 z-40" data-name="header" data-file="components/Header.js">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-light)] flex items-center justify-center">
                <div className="icon-zap text-xl text-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">人生Online</h1>
                <p className="text-sm text-[var(--text-secondary)]">让每一次努力都有迹可循</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onShowAchievements}
                className="btn btn-secondary relative"
              >
                <div className="icon-award text-lg"></div>
                成就 ({unlockedCount})
              </button>
              <button
                onClick={onAddEvent}
                className="btn btn-primary"
              >
                <div className="icon-plus text-lg"></div>
                记录事件
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}

export default Header;