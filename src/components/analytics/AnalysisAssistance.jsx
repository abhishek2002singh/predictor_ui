import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssistanceAnalytics,
  clearAnalyticsErrors 
} from '../../slice/analysisSlice';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AnalysisAssistance = () => {
  const dispatch = useDispatch();
  const { 
    assistanceAnalytics, 
    loading, 
    error 
  } = useSelector((state) => state.analytics);
  
  const [timeFilter, setTimeFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      await dispatch(fetchAssistanceAnalytics()).unwrap();
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearErrors = () => {
    dispatch(clearAnalyticsErrors());
  };

  // Calculate derived statistics
  const getDerivedStats = () => {
    if (!assistanceAnalytics?.data) return null;
    
    const { totalAssistants, activeAssistants, inactiveAssistants } = assistanceAnalytics.data;
    
    return {
      activePercentage: totalAssistants > 0 
        ? Math.round((activeAssistants / totalAssistants) * 100) 
        : 0,
      inactivePercentage: totalAssistants > 0 
        ? Math.round((inactiveAssistants / totalAssistants) * 100) 
        : 0,
      activeToInactiveRatio: inactiveAssistants > 0 
        ? (activeAssistants / inactiveAssistants).toFixed(2)
        : activeAssistants > 0 ? '∞' : '0'
    };
  };

  // Data for charts
  const getChartData = () => {
    if (!assistanceAnalytics?.data) return [];
    
    const { totalAssistants, activeAssistants, inactiveAssistants } = assistanceAnalytics.data;
    
    return [
      { name: 'Total Assistants', value: totalAssistants, type: 'total' },
      { name: 'Active Assistants', value: activeAssistants, type: 'active' },
      { name: 'Inactive Assistants', value: inactiveAssistants, type: 'inactive' }
    ];
  };

  const getStatusDistributionData = () => {
    if (!assistanceAnalytics?.data) return [];
    
    const { activeAssistants, inactiveAssistants } = assistanceAnalytics.data;
    
    return [
      { name: 'Active', value: activeAssistants, color: '#10B981' },
      { name: 'Inactive', value: inactiveAssistants, color: '#EF4444' }
    ];
  };

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  // Loading skeleton
  if (loading.assistance) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </div>
            ))}
          </div>
          
          {/* Chart skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error.assistance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error.assistance}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleClearErrors}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Error
            </button>
          </div>
        </div>
      </div>
    );
  }

  const derivedStats = getDerivedStats();
  const chartData = getChartData();
  const statusData = getStatusDistributionData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assistance Analytics</h1>
              <p className="text-gray-600 mt-2">
                Overview of assistant statistics and performance metrics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                <span className="text-gray-500 text-sm">Time:</span>
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className={`${isRefreshing ? 'animate-spin' : ''}`}>
                  🔄
                </span>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Assistants Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Assistants</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {assistanceAnalytics?.data?.totalAssistants || 0}
            </div>
            <div className="text-sm text-gray-500">
              Overall assistant count
            </div>
          </div>

          {/* Active Assistants Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Active Assistants</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {assistanceAnalytics?.data?.activeAssistants || 0}
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-green-600 font-medium">
                {derivedStats?.activePercentage || 0}%
              </span> of total assistants
            </div>
          </div>

          {/* Inactive Assistants Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Inactive Assistants</h3>
              <span className="text-2xl">⏸️</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {assistanceAnalytics?.data?.inactiveAssistants || 0}
            </div>
            <div className="text-sm text-gray-500">
              <span className="text-red-600 font-medium">
                {derivedStats?.inactivePercentage || 0}%
              </span> of total assistants
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Assistant Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Assistant Distribution</h3>
              <div className="flex gap-2">
                {['bar', 'area', 'line'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      chartType === type 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Assistant Count" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Assistant Count" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Assistant Count" 
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Status Distribution</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} assistants`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Percentage */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {derivedStats?.activePercentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Active Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                Percentage of active assistants
              </div>
            </div>

            {/* Inactive Percentage */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700 mb-2">
                {derivedStats?.inactivePercentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Inactive Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                Percentage of inactive assistants
              </div>
            </div>

            {/* Active to Inactive Ratio */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700 mb-2">
                {derivedStats?.activeToInactiveRatio || '0'}
              </div>
              <div className="text-sm text-gray-600">Activity Ratio</div>
              <div className="text-xs text-gray-500 mt-1">
                Active : Inactive ratio
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {assistanceAnalytics?.lastUpdated ? 
                  new Date(assistanceAnalytics.lastUpdated).toLocaleDateString() 
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-xs text-gray-500 mt-1">
                Date of last data refresh
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Analytics Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Key Findings</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">
                    <strong>{assistanceAnalytics?.data?.activeAssistants || 0}</strong> assistants are currently active
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  <span className="text-gray-600">
                    <strong>{assistanceAnalytics?.data?.inactiveAssistants || 0}</strong> assistants are inactive
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📊</span>
                  <span className="text-gray-600">
                    Activity ratio is <strong>{derivedStats?.activeToInactiveRatio || '0'}</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">💡</span>
                  <span className="text-gray-600">
                    {derivedStats?.inactivePercentage > 30 ? 
                      "Consider reaching out to inactive assistants to improve engagement" :
                      "Assistant engagement levels are healthy"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">💡</span>
                  <span className="text-gray-600">
                    {assistanceAnalytics?.data?.totalAssistants > 50 ?
                      "Large assistant pool detected. Consider implementing performance tiers." :
                      "Assistant pool size is manageable with current structure."
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">💡</span>
                  <span className="text-gray-600">
                    Monitor activity ratios monthly to identify engagement trends
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Option */}
        <div className="mt-8 flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <span>📥</span>
            Export Analytics Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisAssistance;