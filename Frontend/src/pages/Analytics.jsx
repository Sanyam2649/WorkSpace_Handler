import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatButton from "../components/chatButton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchAllAnalytics,
  fetchRealTimeActivity,
  exportAnalyticsData,
  refreshAnalyticsSection,
} from "../reducer/thunks/AnalyticsThunk";
import {
  setTimeRange,
  clearAnalyticsError,
} from "../reducer/slices/analyticSlice";

// Color palette
const CHART_COLORS = {
  primary: "#4F46E5",
  secondary: "#6366F1",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  indigo: "#6366F1",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  pink: "#EC4899",
};

const COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const TIME_RANGE_OPTIONS = [
  { value: "daily", label: "Last 7 Days", icon: "📅" },
  { value: "weekly", label: "Last 7 Weeks", icon: "📊" },
  { value: "monthly", label: "Last 12 Months", icon: "📈" },
  { value: "yearly", label: "Last 5 Years", icon: "🎯" },
];

export default function Analytics() {
  const dispatch = useDispatch();
  const {
    overview,
    activity,
    userActivity,
    topWorkspaces,
    recentDocs,
    realTimeActivity,
    loading,
    realTimeActivityLoading,
    exporting,
    error,
    timeRange,
    lastUpdated,
    refreshInProgress,
  } = useSelector((state) => state.analytics);

  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch all analytics data
  useEffect(() => {
    dispatch(fetchAllAnalytics(timeRange));
  }, [dispatch, timeRange]);

  // Real-time updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(fetchRealTimeActivity(10));
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, dispatch]);

  const handleTimeRangeChange = (newTimeRange) => {
    dispatch(setTimeRange(newTimeRange));
    dispatch(clearAnalyticsError());
  };

  const handleExport = async (format = "json") => {
    try {
      await dispatch(exportAnalyticsData({ format, timeRange })).unwrap();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleRefreshSection = (section) => {
    dispatch(refreshAnalyticsSection({ section, timeRange }));
  };

  const handleRefreshAll = () => {
    dispatch(fetchAllAnalytics(timeRange));
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  // Loading component
  const LoadingSpinner = ({ size = "md" }) => (
    <div className={`flex items-center justify-center ${
      size === "lg" ? "h-64" : size === "md" ? "h-32" : "h-16"
    }`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Metric Card Component
  const MetricCard = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(value)}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}>
              {change > 0 ? "↗" : "↘"} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Gain insights into your workspace activity and performance
                {lastUpdated && (
                  <span className="text-sm text-gray-500 ml-2">
                    • Updated {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  autoRefresh
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}></div>
                Auto Refresh
              </button>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                disabled={loading}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TIME_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshAll}
                disabled={loading || refreshInProgress}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${refreshInProgress ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("json")}
                  disabled={exporting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {exporting ? "Exporting..." : "JSON"}
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {exporting ? "Exporting..." : "CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => dispatch(clearAnalyticsError())}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading analytics data...</p>
          </div>
        )}

        {!loading && overview && (
          <>
            {/* Overview Metrics */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Workspaces"
                  value={overview.workspaceStats?.total || 0}
                  change={overview.workspaceStats?.growth || 0}
                  icon="🏢"
                  color="text-blue-600"
                />
                <MetricCard
                  title="Active Documents"
                  value={overview.documentStats?.total || 0}
                  change={overview.documentStats?.growth || 0}
                  icon="📄"
                  color="text-green-600"
                />
                <MetricCard
                  title="Messages Sent"
                  value={overview.chatStats?.totalMessages || 0}
                  change={10} // Example growth
                  icon="💬"
                  color="text-purple-600"
                />
                <MetricCard
                  title="Active Chats"
                  value={overview.chatStats?.activeChats || 0}
                  change={5} // Example growth
                  icon="👥"
                  color="text-pink-600"
                />
              </div>
            </section>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Activity Over Time */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Activity Over Time
                  </h3>
                  <button
                    onClick={() => handleRefreshSection("activity")}
                    disabled={refreshInProgress}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* User Activity by Hour */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    User Activity by Hour
                  </h3>
                  <button
                    onClick={() => handleRefreshSection("userActivity")}
                    disabled={refreshInProgress}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      fill={CHART_COLORS.success}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Workspaces */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Workspaces
                  </h3>
                  <button
                    onClick={() => handleRefreshSection("topWorkspaces")}
                    disabled={refreshInProgress}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-4">
                  {topWorkspaces.slice(0, 5).map((workspace, index) => (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {workspace.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {workspace.memberCount} members •{" "}
                            {workspace.documentCount} documents
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {workspace.activityCount} activities
                        </p>
                        <p className="text-sm text-gray-500">
                          Last active{" "}
                          {new Date(workspace.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                  <button
                    onClick={() => handleRefreshSection("recentDocs")}
                    disabled={refreshInProgress}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-4">
                  {recentDocs.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {doc.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.workspaceName} •{" "}
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <section className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Real-time Activity Feed
                  {autoRefresh && (
                    <span className="ml-2 text-sm text-green-600 animate-pulse">
                      ● Live
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => dispatch(fetchRealTimeActivity(10))}
                  disabled={realTimeActivityLoading}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {realTimeActivityLoading ? (
                <LoadingSpinner size="md" />
              ) : realTimeActivity.length > 0 ? (
                <div className="space-y-3">
                  {realTimeActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action} in{" "}
                          <span className="font-medium">{activity.workspace}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <ChatButton />
      <Footer />
    </div>
  );
}