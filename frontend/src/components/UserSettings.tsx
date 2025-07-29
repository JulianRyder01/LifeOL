import React, { useState } from 'react';
import { UserConfig, saveUserConfig, resetUserData } from '../utils/userConfig';

interface UserSettingsProps {
  userConfig: UserConfig;
  onUserConfigChange: (config: UserConfig) => void;
  onBack: () => void;
}

function UserSettings({ userConfig, onUserConfigChange, onBack }: UserSettingsProps) {
  const [username, setUsername] = useState(userConfig.username);
  const [avatar, setAvatar] = useState(userConfig.avatar);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    const newConfig = { username, avatar };
    saveUserConfig(newConfig);
    onUserConfigChange(newConfig);
    onBack();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetUserData();
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">用户设置</h1>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* 用户信息设置 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">头像</label>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{avatar}</div>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="输入emoji或字符"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 系统设置 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">系统设置</h2>
            <div className="space-y-4">
              <button
                onClick={() => {}}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                设置
              </button>
            </div>
          </div>

          {/* 关于信息 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">关于</h2>
            <div className="space-y-4">
              <button
                onClick={() => {}}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                关于开发者
              </button>
            </div>
          </div>

          {/* 危险操作 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">危险操作</h2>
            <div className="space-y-4">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                重开人生
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 重置确认弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">确认重开人生</h3>
              <p className="text-sm text-gray-500 mb-4">
                此操作将永久删除所有数据，包括属性、事件、成就、道具等。此操作不可撤销，您确定要继续吗？
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;