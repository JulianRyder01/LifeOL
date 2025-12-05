import React, { useState, useEffect } from 'react';
import { UserConfig } from '../types/app.types';
import { saveUserConfig } from '../utils/userConfig';
import { downloadUserData } from '../utils/dataImportExport';

interface UserSettingsProps {
  userConfig: UserConfig;
  onUserConfigChange: (config: UserConfig) => void;
  onBack: () => void;
    // [修改开始] 添加导入和重置的 props
    onImportData: (file: File, setStatus: (status: { type: 'success' | 'error' | null; message: string }) => void) => void;
    onResetData: () => void;
    // [修改结束]
}

function UserSettings({ userConfig, onUserConfigChange, onBack, onImportData, onResetData }: UserSettingsProps) {
  const [username, setUsername] = useState(userConfig.username);
  const [avatar, setAvatar] = useState(userConfig.avatar);
  const [dontShowTaskCompleteConfirm, setDontShowTaskCompleteConfirm] = useState(false);
    // [修改开始] 移除了 showResetConfirm 状态，因为确认逻辑移到了 useApp hook 中
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    // 从localStorage加载用户设置
    const config = localStorage.getItem('lifeol_user_config');
    if (config) {
      const parsedConfig = JSON.parse(config);
      setDontShowTaskCompleteConfirm(parsedConfig.dontShowTaskCompleteConfirm || false);
    }
  }, []);

  const handleSave = () => {
    const newConfig = { username, avatar };
    saveUserConfig(newConfig);
    onUserConfigChange(newConfig);
    
    // 保存任务完成确认提示设置到localStorage
    const config = localStorage.getItem('lifeol_user_config');
    const parsedConfig = config ? JSON.parse(config) : {};
    parsedConfig.dontShowTaskCompleteConfirm = dontShowTaskCompleteConfirm;
    localStorage.setItem('lifeol_user_config', JSON.stringify(parsedConfig));
    
    onBack();
  };

  const handleReset = () => {
        onResetData();
  };

  const handleExportData = () => {
    try {
      downloadUserData();
      setImportStatus({ type: 'success', message: '数据导出成功！' });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setImportStatus({ type: 'error', message: '数据导出失败，请重试。' });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };

  // Handle data import
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

        onImportData(file, setImportStatus);

    // Reset file input
    event.target.value = '';
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

        {importStatus.type && (
          <div className={`mb-4 p-3 rounded ${importStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {importStatus.message}
          </div>
        )}

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
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">任务完成确认提示</label>
                  <p className="text-xs text-gray-500 mt-1">进度达到100%时是否显示确认提示</p>
                </div>
                <button
                  onClick={() => setDontShowTaskCompleteConfirm(!dontShowTaskCompleteConfirm)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${dontShowTaskCompleteConfirm ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${dontShowTaskCompleteConfirm ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* 数据导入导出 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">数据管理</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  导出数据
                </button>
                <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 text-center cursor-pointer">
                  导入数据
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                导出数据将保存您所有的属性、事件、成就、道具等信息。导入数据将替换当前所有数据，请谨慎操作。
              </p>
            </div>
          </div>

          {/* 关于信息 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">关于</h2>
            <div className="space-y-4">
              <button
                                onClick={() => { }}
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
                className="w-full text-left px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                重开人生
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;