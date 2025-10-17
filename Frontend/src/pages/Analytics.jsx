import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  Tooltip as RechartsTooltip,
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

// Lucide Icons
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  X,
  Clock,
  Users,
  FileText,
  MessageCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Zap,
  Building,
  Eye,
  DownloadCloud,
  Database,
  FileDown,
  Sparkles,
  Target,
  BarChart4,
  LineChart as LineChartIcon,
} from "lucide-react";

// Color palette using theme variables
const CHART_COLORS = {
  primary: "oklch(58% 0.158 241.966)",
  secondary: "oklch(55% 0.046 257.417)",
  success: "oklch(62% 0.194 149.214)",
  warning: "oklch(85% 0.199 91.936)",
  error: "oklch(70% 0.191 22.216)",
  info: "oklch(60% 0.126 221.723)",
  accent: "oklch(60% 0.118 184.704)",
};

const COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.accent,
];

const TIME_RANGE_OPTIONS = [
  { value: "daily", label: "Last 7 Days", icon: Calendar },
  { value: "weekly", label: "Last 4 Weeks", icon: BarChart3 },
  { value: "monthly", label: "Last 12 Months", icon: BarChart4 },
  { value: "yearly", label: "Last 5 Years", icon: Target },
];

// Custom Tooltip Component
const Tooltip = ({ children, content }) => (
  <div className="relative group inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-xl shadow-lg border border-base-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-base-300"></div>
    </div>
  </div>
);

// Enhanced Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color, description }) => (
  <div className="bg-base-100 rounded-2xl p-6 border-2 border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Tooltip content={description}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-base-content/70">{title}</p>
              <Eye className="w-4 h-4 text-base-content/40" />
            </div>
          </Tooltip>
        </div>
        <p className="text-3xl font-bold text-base-content mb-2">{value}</p>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            change > 0 
              ? "bg-success/20 text-success" 
              : change < 0 
              ? "bg-error/20 text-error"
              : "bg-base-300 text-base-content/70"
          }`}>
            {change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : change < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            {change > 0 ? "+" : ""}{change}%
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br from-${color.split('-')[1]}/10 to-${color.split('-')[1]}/5 border border-${color.split('-')[1]}/20`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

// Loading Component
const LoadingSpinner = ({ size = "md", text = "Loading..." }) => (
  <div className={`flex flex-col items-center justify-center ${
    size === "lg" ? "h-64" : size === "md" ? "h-32" : "h-16"
  }`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
    <p className="text-base-content/70">{text}</p>
  </div>
);

// Section Header Component
const SectionHeader = ({ title, description, onRefresh, refreshInProgress, icon: Icon, section }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-base-content">{title}</h3>
        {description && (
          <p className="text-base-content/60 text-sm mt-1">{description}</p>
        )}
      </div>
    </div>
    <Tooltip content={`Refresh ${title.toLowerCase()} data`}>
      <button
        onClick={onRefresh}
        disabled={refreshInProgress}
        className="p-2 bg-base-200 hover:bg-base-300 rounded-xl border border-base-300 transition-all duration-200 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 text-base-content/70 ${refreshInProgress ? "animate-spin" : ""}`} />
      </button>
    </Tooltip>
  </div>
);

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
    sectionRefreshInProgress, // Add this to your slice to track individual sections
  } = useSelector((state) => state.analytics);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshingSections, setRefreshingSections] = useState({});

  useEffect(() => {
    dispatch(fetchAllAnalytics(timeRange));
  }, [dispatch, timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(fetchRealTimeActivity(10));
      }, 30000);
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

  const handleRefreshSection = async (section) => {
    // Set loading state for specific section
    setRefreshingSections(prev => ({
      ...prev,
      [section]: true
    }));

    try {
      await dispatch(refreshAnalyticsSection({ section, timeRange })).unwrap();
    } catch (error) {
      console.error(`Refresh failed for ${section}:`, error);
    } finally {
      // Clear loading state for specific section
      setRefreshingSections(prev => ({
        ...prev,
        [section]: false
      }));
    }
  };

  const handleRefreshAll = () => {
    dispatch(fetchAllAnalytics(timeRange));
  };

  const isSectionRefreshing = (section) => {
    return refreshingSections[section] || false;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getCurrentTimeRangeOption = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange);
  const TimeRangeIcon = getCurrentTimeRangeOption?.icon || BarChart3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <Navbar />
      
      <main className="size-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-primary-content" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-base-content/70 mt-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Gain insights into your workspace activity and performance
                  </p>
                  {lastUpdated && (
                    <span className="text-sm text-base-content/50 ml-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Auto Refresh Toggle */}
              <Tooltip content={autoRefresh ? "Disable auto refresh" : "Enable auto refresh every 30s"}>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    autoRefresh
                      ? "bg-success/20 border-success/30 text-success hover:bg-success/30"
                      : "bg-base-100 border-base-300 text-base-content/70 hover:border-base-400"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    autoRefresh ? "bg-success animate-pulse" : "bg-base-content/40"
                  }`} />
                  <span className="font-medium">Auto Refresh</span>
                </button>
              </Tooltip>

              {/* Time Range Selector */}
              <div className="relative">
                <Tooltip content="Select time range">
                  <select
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    disabled={loading}
                    className="appearance-none bg-base-100 border-2 border-base-300 rounded-xl px-4 py-3 pr-10 text-base-content focus:outline-none focus:border-primary disabled:opacity-50 font-medium cursor-pointer"
                  >
                    {TIME_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Tooltip>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <TimeRangeIcon className="w-4 h-4 text-base-content/50" />
                </div>
              </div>

              {/* Refresh Button */}
              <Tooltip content="Refresh all data">
                <button
                  onClick={handleRefreshAll}
                  disabled={loading || refreshInProgress}
                  className="px-4 py-3 bg-base-100 border-2 border-base-300 rounded-xl hover:border-primary/50 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshInProgress ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </Tooltip>

              {/* Export Dropdown */}
              <div className="relative group">
                <Tooltip content="Export analytics data">
                  <button className="px-4 py-3 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium">
                    <DownloadCloud className="w-4 h-4" />
                    Export
                  </button>
                </Tooltip>
                <div className="absolute top-full right-0 mt-2 w-48 bg-base-100 border-2 border-base-300 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport("json")}
                    disabled={exporting}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-2 rounded-t-xl disabled:opacity-50"
                  >
                    <Database className="w-4 h-4" />
                    JSON Format
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={exporting}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-2 rounded-b-xl disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    CSV Format
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border-2 border-error/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <span className="text-error flex-1">{error}</span>
              <Tooltip content="Dismiss error">
                <button
                  onClick={() => dispatch(clearAnalyticsError())}
                  className="p-1 hover:bg-error/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-error" />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading analytics data..." />
          </div>
        )}

        {!loading && overview && (
          <>
            {/* Overview Metrics */}
            <section className="mb-8">
              <SectionHeader
                title="Performance Overview"
                description="Key metrics and growth indicators"
                icon={Activity}
                onRefresh={() => handleRefreshSection("overview")}
                refreshInProgress={isSectionRefreshing("overview")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Workspaces"
                  value={formatNumber(overview.workspaceStats?.total || 0)}
                  change={overview.workspaceStats?.growth || 0}
                  icon={Building}
                  color="text-primary"
                  description="Total number of workspaces in your organization"
                />
                <MetricCard
                  title="Active Documents"
                  value={formatNumber(overview.documentStats?.total || 0)}
                  change={overview.documentStats?.growth || 0}
                  icon={FileText}
                  color="text-success"
                  description="Documents currently being edited or viewed"
                />
                <MetricCard
                  title="Messages Sent"
                  value={formatNumber(overview.chatStats?.totalMessages || 0)}
                  change={10}
                  icon={MessageCircle}
                  color="text-info"
                  description="Total messages across all chat channels"
                />
                <MetricCard
                  title="Active Chats"
                  value={formatNumber(overview.chatStats?.activeChats || 0)}
                  change={5}
                  icon={Users}
                  color="text-warning"
                  description="Currently active conversation threads"
                />
              </div>
            </section>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {/* Activity Over Time */}
              <div className="bg-base-100 rounded-2xl p-6 border-2 border-base-300">
                <SectionHeader
                  title="Activity Over Time"
                  description="Total activity across all workspaces"
                  icon={LineChartIcon}
                  onRefresh={() => handleRefreshSection("activity")}
                  refreshInProgress={isSectionRefreshing("activity")}
                />
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" />
                    <XAxis dataKey="date" stroke="var(--color-base-content)" />
                    <YAxis stroke="var(--color-base-content)" />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-base-100)',
                        border: '2px solid var(--color-base-300)',
                        borderRadius: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.1}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* User Activity by Hour */}
              <div className="bg-base-100 rounded-2xl p-6 border-2 border-base-300">
                <SectionHeader
                  title="Peak Activity Hours"
                  description="User engagement throughout the day"
                  icon={BarChart3}
                  onRefresh={() => handleRefreshSection("userActivity")}
                  refreshInProgress={isSectionRefreshing("userActivity")}
                />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" />
                    <XAxis dataKey="hour" stroke="var(--color-base-content)" />
                    <YAxis stroke="var(--color-base-content)" />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-base-100)',
                        border: '2px solid var(--color-base-300)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill={CHART_COLORS.success}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Sections Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Top Workspaces */}
              <div className="xl:col-span-2 bg-base-100 rounded-2xl p-6 border-2 border-base-300">
                <SectionHeader
                  title="Top Performing Workspaces"
                  description="Most active workspaces by engagement"
                  icon={TrendingUp}
                  onRefresh={() => handleRefreshSection("topWorkspaces")}
                  refreshInProgress={isSectionRefreshing("topWorkspaces")}
                />
                <div className="space-y-3">
                  {topWorkspaces.slice(0, 5).map((workspace, index) => (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between p-4 border-2 border-base-300 rounded-xl hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-semibold text-base-content group-hover:text-primary transition-colors">
                              {workspace.name}
                            </p>
                            <p className="text-sm text-base-content/60">
                              {workspace.memberCount} members • {workspace.documentCount} documents
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base-content text-lg">
                          {formatNumber(workspace.activityCount)}
                        </p>
                        <p className="text-sm text-base-content/60">
                          activities
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-base-100 rounded-2xl p-6 border-2 border-base-300">
                <SectionHeader
                  title="Recent Documents"
                  description="Recently updated files and documents"
                  icon={FileText}
                  onRefresh={() => handleRefreshSection("recentDocs")}
                  refreshInProgress={isSectionRefreshing("recentDocs")}
                />
                <div className="space-y-3">
                  {recentDocs.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 p-3 border-2 border-base-300 rounded-xl hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base-content text-sm truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                          {doc.workspaceName} • {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <section className="mt-8 bg-base-100 rounded-2xl p-6 border-2 border-base-300">
              <SectionHeader
                title="Real-time Activity Feed"
                description="Live updates from across all workspaces"
                icon={Zap}
                onRefresh={() => dispatch(fetchRealTimeActivity(10))}
                refreshInProgress={realTimeActivityLoading}
              />
              
              {realTimeActivityLoading ? (
                <LoadingSpinner text="Loading real-time activity..." />
              ) : realTimeActivity.length > 0 ? (
                <div className="space-y-3">
                  {realTimeActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border-2 border-base-300 rounded-xl hover:border-success/30 transition-all duration-200 group"
                    >
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-base-content">
                          <span className="font-semibold text-primary">{activity.user}</span>{" "}
                          {activity.action} in{" "}
                          <span className="font-semibold text-secondary">{activity.workspace}</span>
                        </p>
                        <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}