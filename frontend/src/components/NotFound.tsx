import React from 'react';

interface NotFoundProps {
  onReturnToDashboard: () => void;
}

function NotFound({ onReturnToDashboard }: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h1>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或发生了错误。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReturnToDashboard}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            返回主仪表盘
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            重新加载页面
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>如果您认为这是系统错误，请联系开发者。</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;