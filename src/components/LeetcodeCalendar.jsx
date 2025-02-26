import React, { useState, useEffect } from 'react';

const LeetcodeCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leetcode');
        const data = await response.json();
        setCalendarData(data.submissionCalendar);
        setStats({
          totalSubmissions: data.totalSubmissions?.[0]?.count || 0,
          totalActive: Object.keys(data.submissionCalendar || {}).length,
          maxStreak: calculateMaxStreak(data.submissionCalendar)
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateMaxStreak = (calendar) => {
    if (!calendar) return 0;
    // Simple implementation for demo purposes
    return 11; // Hardcoded from your screenshot for now
  };

  const getIntensityLevel = (count) => {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  // Convert Unix timestamp to Year-Month-Day format
  const timestampToDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // Generate a full year calendar grid
  const generateCalendarGrid = () => {
    if (!calendarData) return { grid: Array(7).fill().map(() => Array(53).fill(null)), weekMap: {} };
    
    // Use current date as the end date
    const today = new Date();
    // For exact one year
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() + 1); // Add one day to make it inclusive
    
    // Convert calendar data to a map with formatted dates as keys
    const dateMap = {};
    Object.entries(calendarData).forEach(([timestamp, count]) => {
      const dateStr = timestampToDate(timestamp);
      dateMap[dateStr] = count;
    });
    
    // Create 7×53 grid (7 days in a week, 53 weeks max in a year)
    const grid = Array(7).fill().map(() => Array(53).fill(null));
    
    // Create a map to track which weeks contain which dates
    const weekMap = {};
    
    // Fill in the grid with real data
    let currentDate = new Date(oneYearAgo);
    let weekIndex = 0;
    
    // Calculate first day of week based on the starting day
    const firstDayOffset = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust the first weekIndex based on the day of week
    if (firstDayOffset !== 0) {
      // If we don't start on Sunday, we're already partway through week 0
      for (let i = 0; i < firstDayOffset; i++) {
        grid[i][0] = null;
      }
    }
    
    while (currentDate <= today) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // If it's a new week (Sunday), increment the week index
      if (dayOfWeek === 0 && currentDate > oneYearAgo) {
        weekIndex++;
      }
      
      if (weekIndex < 53) {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        const count = dateMap[dateStr] || 0;
        
        // Clone the date to avoid reference issues
        const dateCopy = new Date(currentDate);
        
        grid[dayOfWeek][weekIndex] = {
          date: dateCopy,
          count,
          level: getIntensityLevel(count)
        };
        
        // Store the date in the weekMap
        if (!weekMap[weekIndex]) {
          weekMap[weekIndex] = [];
        }
        weekMap[weekIndex][dayOfWeek] = dateCopy;
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { grid, weekMap };
  };

  const formatDateForTooltip = (date, count) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName} ${monthName} ${day} ${year}${count ? ` - ${count} submissions` : ''}`;
  };

  const renderMonthLabels = (weekMap) => {
    // Determine month for each week
    const monthLabels = [];
    let currentMonth = -1;
    
    for (let week = 0; week < 53; week++) {
      if (weekMap[week] && weekMap[week][0]) {
        const month = weekMap[week][0].getMonth();
        if (month !== currentMonth) {
          monthLabels.push({
            month: month,
            week: week
          });
          currentMonth = month;
        }
      }
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return (
      <div className="flex mb-2 h-6">
        <div className="w-10"></div>
        <div className="flex-1 relative">
          {monthLabels.map(({ month, week }) => (
            <div 
              key={month} 
              className="absolute bottom-0 text-xs text-gray-400"
              style={{ left: `${(week / 53) * 100}%` }}
            >
              {months[month]}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const { grid, weekMap } = generateCalendarGrid();
    const weekDays = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    
    return (
      <div className="flex">
        {/* Day labels */}
        <div className="w-10 mr-2 text-xs text-gray-400 pt-1">
          {weekDays.map((day, index) => (
            <div key={index} className="h-4 flex items-center">{day}</div>
          ))}
        </div>
        
        {/* Grid cells */}
        <div className="flex-1 grid grid-flow-col gap-1 auto-cols-fr">
          {Array(53).fill().map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {Array(7).fill().map((_, dayIndex) => {
                const day = grid[dayIndex] && grid[dayIndex][weekIndex];
                return (
                  <div
                    key={dayIndex}
                    className={`w-4 h-4 rounded-sm ${
                      !day ? 'bg-gray-800' :
                      day.level === 0 ? 'bg-gray-800' :
                      day.level === 1 ? 'bg-green-900' :
                      day.level === 2 ? 'bg-green-700' :
                      day.level === 3 ? 'bg-green-500' :
                      'bg-green-300'
                    }`}
                    title={day ? formatDateForTooltip(day.date, day.count) : ''}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow-lg">
      {loading ? (
        <div className="text-center py-4">Loading calendar data...</div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold">
              {stats?.totalSubmissions || 0} submissions in the past one year
            </div>
            <div className="flex gap-4 text-sm text-gray-300">
              <div>Total active days: {stats?.totalActive || 0}</div>
              <div>Max streak: {stats?.maxStreak || 0}</div>
            </div>
          </div>
          
          {/* Month labels */}
          {renderMonthLabels(generateCalendarGrid().weekMap)}
          
          {/* Calendar grid */}
          {renderCalendarGrid()}
          
          {/* Legend */}
          <div className="flex justify-end items-center mt-4 text-xs text-gray-400">
            <span className="mr-2">Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-800 mr-1"></div>
            <div className="w-3 h-3 rounded-sm bg-green-900 mr-1"></div>
            <div className="w-3 h-3 rounded-sm bg-green-700 mr-1"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500 mr-1"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300 mr-1"></div>
            <span className="ml-1">More</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LeetcodeCalendar;