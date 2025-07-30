import React, { useMemo } from 'react';
import { Event } from '../types/app.types';

interface DailyExpHeatmapProps {
  events: Event[];
}

interface DailyData {
  date: string;
  totalExp: number;
}

const DailyExpHeatmap: React.FC<DailyExpHeatmapProps> = ({ events }) => {
  // 计算每日经验值
  const dailyData = useMemo(() => {
    const expByDate: Record<string, number> = {};
    
    // 遍历所有事件，按日期聚合经验值
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!expByDate[date]) {
        expByDate[date] = 0;
      }
      
      // 计算该事件所有属性的经验值总和
      const eventTotalExp = Object.values(event.expGains || {}).reduce((sum, exp) => sum + exp, 0);
      expByDate[date] += eventTotalExp;
    });
    
    // 转换为数组格式并限制范围在最近3个月
    const result: DailyData[] = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 3);
    
    Object.entries(expByDate).forEach(([date, totalExp]) => {
      const dateObj = new Date(date);
      if (dateObj >= startDate && dateObj <= today) {
        result.push({ date, totalExp });
      }
    });
    
    return result;
  }, [events]);
  
  // 生成最近90天的所有日期
  const last90Days = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }, []);
  
  // 根据经验值获取颜色
  const getColorForExp = (exp: number) => {
    // 限制在-100到+100之间
    const clampedExp = Math.max(-100, Math.min(100, exp));
    
    if (clampedExp > 0) {
      // 正向增益 - 蓝色系
      const intensity = Math.min(1, clampedExp / 100);
      const blueValue = Math.floor(100 + (255 - 100) * intensity);
      return `rgb(100, 100, ${blueValue})`;
    } else if (clampedExp < 0) {
      // 负向增益 - 红色系
      const intensity = Math.min(1, Math.abs(clampedExp) / 100);
      const redValue = Math.floor(100 + (255 - 100) * intensity);
      return `rgb(${redValue}, 100, 100)`;
    } else {
      // 无变化 - 灰色
      return '#f0f0f0';
    }
  };
  
  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">每日经验热力图</h2>
      
      <div className="flex flex-wrap gap-1 justify-start">
        {last90Days.map((date) => {
          const dayData = dailyData.find(d => d.date === date);
          const exp = dayData ? dayData.totalExp : 0;
          const color = getColorForExp(exp);
          
          return (
            <div
              key={date}
              className="relative group"
            >
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                style={{ backgroundColor: color }}
                title={`${date}: ${exp} EXP`}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {formatDate(date)}: {exp} EXP
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(last90Days[0]).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
        <span>今天</span>
      </div>
      
      <div className="mt-3 flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-1"></div>
          <span className="text-xs">负向</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 mr-1"></div>
          <span className="text-xs">无变化</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-1"></div>
          <span className="text-xs">正向</span>
        </div>
      </div>
    </div>
  );
};

export default DailyExpHeatmap;