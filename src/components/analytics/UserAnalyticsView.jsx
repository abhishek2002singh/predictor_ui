// components/analytics/UserAnalyticsView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Radar as RadarIcon,
  Layers,
  AlertCircle,
  CheckCircle,
  FileText,
  MapPin,
  Target,
  Award
} from 'lucide-react';
import { fetchUserAnalytics } from '../../slice/analysisSlice';

const UserAnalyticsView = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('30days');
  
  // Get data from Redux store
  const userAnalytics = useSelector(state => state.analytics?.userAnalytics?.data || {});
  const error = useSelector(state => state.analytics?.error?.user);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchUserAnalytics()).unwrap();
    } catch (err) {
      console.error('Failed to fetch user analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract data from API response with safe defaults
  const summary = userAnalytics?.summary || {};
  const trends = userAnalytics?.trends || {};
  const demographics = userAnalytics?.demographics || {};
  const usage = userAnalytics?.usage || {};
  const performance = userAnalytics?.performance || {};

  // Format data for charts
  const dailyGrowthData = trends?.dailyGrowth?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.count || 0,
    fullDate: item.date
  })) || [];

  const recentChecksData = trends?.recentChecks?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    checks: item.count || 0,
    fullDate: item.date
  })) || [];

  // Gender data
  const genderData = demographics?.byGender?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
    percentage: ((item.count / summary.totalUsers) * 100).toFixed(1)
  })) || [];

  // State data
  const stateData = demographics?.byState?.slice(0, 10).map(item => ({
    state: item._id || 'Unknown',
    users: item.count || 0
  })) || [];

  // Category data
  const categoryData = demographics?.byCategory?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
    percentage: ((item.count / summary.totalUsers) * 100).toFixed(1)
  })) || [];

  // Exam type data
  const examTypeData = demographics?.byExamType?.map(item => ({
    name: item._id?.replace('_', ' ') || 'Unknown',
    value: item.count || 0,
    percentage: ((item.count / summary.totalUsers) * 100).toFixed(1)
  })) || [];

  // Check frequency data
  const checkFrequencyData = usage?.checkFrequency?.map(item => ({
    frequency: item._id === '50+' ? '50+' : `${item._id} checks`,
    users: item.count || 0,
    percentage: ((item.count / summary.totalUsers) * 100).toFixed(1)
  })) || [];

  // Response analysis
  const responseAnalysis = usage?.responseAnalysis || {};

  // Chart type options
  const chartTypes = useMemo(() => [
    { id: 'line', name: 'Line Chart', icon: LineChartIcon, color: 'text-blue-600' },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, color: 'text-green-600' },
    { id: 'area', name: 'Area Chart', icon: AreaChartIcon, color: 'text-purple-600' },
    { id: 'pie', name: 'Pie Chart', icon: PieChartIcon, color: 'text-pink-600' },
    { id: 'radar', name: 'Radar Chart', icon: RadarIcon, color: 'text-orange-600' },
    { id: 'composed', name: 'Composed Chart', icon: Layers, color: 'text-indigo-600' },
  ], []);

  // Colors for charts
  const COLORS = useMemo(() => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'], []);

  // Memoized chart render function
  const renderChart = useMemo(() => {
    const chartData = dailyGrowthData.length > 0 ? dailyGrowthData : [{ date: 'No Data', users: 0 }];
    
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="New Users"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar
              dataKey="users"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="New Users"
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              name="New Users"
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, 'Users']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart outerRadius={90} width={500} height={300} data={stateData.slice(0, 5)}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="state" stroke="#6b7280" />
            <PolarRadiusAxis stroke="#6b7280" />
            <Radar
              name="Users by State"
              dataKey="users"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar
              dataKey="users"
              barSize={20}
              fill="#10b981"
              name="Daily Users"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Trend Line"
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  }, [chartType, dailyGrowthData, genderData, stateData, COLORS]);

  // Export data as CSV
  const exportData = () => {
    const csvContent = [
      ['Date', 'New Users', 'Checks'],
      ...dailyGrowthData.map((item, index) => [
        item.fullDate, 
        item.users, 
        recentChecksData[index]?.checks || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && !Object.keys(userAnalytics).length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Monitor user growth, checks, and demographics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading || dailyGrowthData.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Extended Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalUsers?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Checks</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalChecks?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Checks/User</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.avgChecksPerUser || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.activeUsers?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.inactiveUsers?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.growthRate || '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Growth Trend</h2>
            <p className="text-sm text-gray-600">
              {dailyGrowthData.length > 0 
                ? 'Daily new user registrations' 
                : 'No growth data available for the selected period'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              {['7days', '30days', '90days', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === '7days' ? '7 Days' :
                   range === '30days' ? '30 Days' :
                   range === '90days' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-2">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chartTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80">
          {dailyGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No growth data available</p>
                <p className="text-sm text-gray-400 mt-1">
                  User registration data will appear here once available
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Chart Type Buttons */}
        {dailyGrowthData.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    chartType === type.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Demographics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gender Distribution
          </h3>
          <div className="h-64">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Users']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="h-16 w-16 text-gray-300" />
                </div>
                <p className="text-gray-500">No gender data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top States */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top States by Users
          </h3>
          <div className="h-64">
            {stateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="state" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <MapPin className="h-16 w-16 text-gray-300" />
                </div>
                <p className="text-gray-500">No state data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category and Exam Type Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Category Distribution
          </h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Users']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Exam Type Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exam Type Distribution
          </h3>
          <div className="h-64">
            {examTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => [value, 'Checks']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    name="Checks"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500">No exam type data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage and Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check Frequency */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Frequency</h3>
          <div className="space-y-4">
            {checkFrequencyData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{item.frequency}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.users} users</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{item.percentage}% of users</span>
                  <span>{item.users} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Analysis */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="text-lg font-bold text-gray-900">
                {responseAnalysis.totalUsers?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Positive Responses</span>
              <span className="text-lg font-bold text-green-600">
                {responseAnalysis.positiveResponses?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Negative Responses</span>
              <span className="text-lg font-bold text-red-600">
                {responseAnalysis.negativeResponses?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Has Check Data</span>
              <span className="text-lg font-bold text-blue-600">
                {responseAnalysis.hasCheckData?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Week-over-Week Growth */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Week-over-Week Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Previous Week</span>
              <span className="text-lg font-bold text-gray-900">
                {trends?.weekOverWeekGrowth?.previousWeek?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Week</span>
              <span className="text-lg font-bold text-gray-900">
                {trends?.weekOverWeekGrowth?.currentWeek?.toLocaleString() || '7'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-gray-600">Growth</span>
              <span className={`text-lg font-bold ${
                trends?.weekOverWeekGrowth?.percentageChange > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {trends?.weekOverWeekGrowth?.percentageChange?.toFixed(2) || '100'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Performance</h3>
            <p className="text-sm text-gray-600">Query execution metrics</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Query Time</p>
            <p className="text-lg font-bold text-gray-900">{performance.queryTime || '0ms'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserAnalyticsView);