// store/thunks/analyticsThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAnalyticsOverview,
  getAnalyticsActivity,
  getUserActivity,
  getTopWorkspaces,
  getRecentDocuments,
  exportAnalytics,
  getWorkspaceAnalytics,
  getDocumentAnalytics,
  getUserEngagement,
  getStorageAnalytics,
  getCollaborationMetrics,
  getRealTimeActivity,
  getPerformanceMetrics,
  getTrendAnalysis,
  getComparativeAnalytics,
  getGrowthMetrics,
} from '../../api';

// ==================== CORE ANALYTICS THUNKS ====================

// Fetch all analytics data
export const fetchAllAnalytics = createAsyncThunk(
  'analytics/fetchAll',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const [
        overviewData,
        activityData,
        userActivityData,
        topWorkspaceData,
        recentDocsData,
      ] = await Promise.all([
        getAnalyticsOverview(timeRange),
        getAnalyticsActivity(timeRange, 'all'),
        getUserActivity(timeRange),
        getTopWorkspaces(10, timeRange),
        getRecentDocuments(10, timeRange),
      ]);

      return {
        overview: overviewData || {},
        activity: activityData?.data || [],
        userActivity: userActivityData?.data || [],
        topWorkspaces: topWorkspaceData?.data || [],
        recentDocs: recentDocsData?.data || [],
        timeRange,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics data');
    }
  }
);

// Fetch analytics overview
export const fetchAnalyticsOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const overviewData = await getAnalyticsOverview(timeRange);
      return { overview: overviewData || {}, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch overview data');
    }
  }
);

// Fetch activity data
export const fetchAnalyticsActivity = createAsyncThunk(
  'analytics/fetchActivity',
  async ({ timeRange = 'monthly', type = 'all' }, { rejectWithValue }) => {
    try {
      const activityData = await getAnalyticsActivity(timeRange, type);
      return { activity: activityData?.data || [], timeRange, type };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch activity data');
    }
  }
);

// Fetch user activity
export const fetchUserActivity = createAsyncThunk(
  'analytics/fetchUserActivity',
  async (timeRange = 'daily', { rejectWithValue }) => {
    try {
      const userActivityData = await getUserActivity(timeRange);
      return { userActivity: userActivityData?.data || [], timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user activity');
    }
  }
);

// Fetch top workspaces
export const fetchTopWorkspaces = createAsyncThunk(
  'analytics/fetchTopWorkspaces',
  async ({ limit = 10, timeRange = 'monthly' } = {}, { rejectWithValue }) => {
    try {
      const topWorkspaceData = await getTopWorkspaces(limit, timeRange);
      return { topWorkspaces: topWorkspaceData?.data || [], timeRange, limit };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch top workspaces');
    }
  }
);

// Fetch recent documents
export const fetchRecentDocuments = createAsyncThunk(
  'analytics/fetchRecentDocuments',
  async ({ limit = 10, timeRange = 'monthly' } = {}, { rejectWithValue }) => {
    try {
      const recentDocsData = await getRecentDocuments(limit, timeRange);
      return { recentDocs: recentDocsData?.data || [], timeRange, limit };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch recent documents');
    }
  }
);

// Export analytics
export const exportAnalyticsData = createAsyncThunk(
  'analytics/export',
  async ({ format = 'json', timeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      await exportAnalytics(format, timeRange);
      return { format, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export analytics');
    }
  }
);

// ==================== ADDITIONAL ANALYTICS THUNKS ====================

// Fetch workspace-specific analytics
export const fetchWorkspaceAnalytics = createAsyncThunk(
  'analytics/fetchWorkspaceAnalytics',
  async ({ workspaceId, timeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      const workspaceData = await getWorkspaceAnalytics(workspaceId, timeRange);
      return { workspaceAnalytics: workspaceData, workspaceId, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch workspace analytics');
    }
  }
);

// Fetch document-specific analytics
export const fetchDocumentAnalytics = createAsyncThunk(
  'analytics/fetchDocumentAnalytics',
  async ({ documentId, timeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      const documentData = await getDocumentAnalytics(documentId, timeRange);
      return { documentAnalytics: documentData, documentId, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch document analytics');
    }
  }
);

// Fetch user engagement metrics
export const fetchUserEngagement = createAsyncThunk(
  'analytics/fetchUserEngagement',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const engagementData = await getUserEngagement(timeRange);
      return { userEngagement: engagementData, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user engagement');
    }
  }
);

// Fetch storage analytics
export const fetchStorageAnalytics = createAsyncThunk(
  'analytics/fetchStorageAnalytics',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const storageData = await getStorageAnalytics(timeRange);
      return { storageAnalytics: storageData, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch storage analytics');
    }
  }
);

// Fetch collaboration metrics
export const fetchCollaborationMetrics = createAsyncThunk(
  'analytics/fetchCollaborationMetrics',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const collaborationData = await getCollaborationMetrics(timeRange);
      return { collaborationMetrics: collaborationData, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch collaboration metrics');
    }
  }
);

// Fetch real-time activity
export const fetchRealTimeActivity = createAsyncThunk(
  'analytics/fetchRealTimeActivity',
  async (limit = 20, { rejectWithValue }) => {
    try {
      const realTimeData = await getRealTimeActivity(limit);
      return { realTimeActivity: realTimeData?.data || [], limit };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch real-time activity');
    }
  }
);

// Fetch performance metrics
export const fetchPerformanceMetrics = createAsyncThunk(
  'analytics/fetchPerformanceMetrics',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const performanceData = await getPerformanceMetrics(timeRange);
      return { performanceMetrics: performanceData, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch performance metrics');
    }
  }
);

// Fetch trend analysis
export const fetchTrendAnalysis = createAsyncThunk(
  'analytics/fetchTrendAnalysis',
  async ({ metric = 'documents', timeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      const trendData = await getTrendAnalysis(metric, timeRange);
      return { trendAnalysis: trendData, metric, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trend analysis');
    }
  }
);

// Fetch comparative analytics
export const fetchComparativeAnalytics = createAsyncThunk(
  'analytics/fetchComparativeAnalytics',
  async ({ currentTimeRange = 'monthly', previousTimeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      const comparativeData = await getComparativeAnalytics(currentTimeRange, previousTimeRange);
      return { 
        comparativeAnalytics: comparativeData, 
        currentTimeRange, 
        previousTimeRange 
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch comparative analytics');
    }
  }
);

// Fetch growth metrics
export const fetchGrowthMetrics = createAsyncThunk(
  'analytics/fetchGrowthMetrics',
  async (timeRange = 'monthly', { rejectWithValue }) => {
    try {
      const growthData = await getGrowthMetrics(timeRange);
      return { growthMetrics: growthData, timeRange };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch growth metrics');
    }
  }
);

// Refresh specific analytics section
export const refreshAnalyticsSection = createAsyncThunk(
  'analytics/refreshSection',
  async ({ section, timeRange = 'monthly' }, { rejectWithValue }) => {
    try {
      let data;
      switch (section) {
        case 'overview':
          data = await getAnalyticsOverview(timeRange);
          return { section, data: data || {}, timeRange };
        case 'activity':
          data = await getAnalyticsActivity(timeRange, 'all');
          return { section, data: data?.data || [], timeRange };
        case 'userActivity':
          data = await getUserActivity(timeRange);
          return { section, data: data?.data || [], timeRange };
        case 'topWorkspaces':
          data = await getTopWorkspaces(10, timeRange);
          return { section, data: data?.data || [], timeRange };
        case 'recentDocs':
          data = await getRecentDocuments(10, timeRange);
          return { section, data: data?.data || [], timeRange };
        default:
          throw new Error('Invalid analytics section');
      }
    } catch (error) {
      return rejectWithValue(error.message || `Failed to refresh ${section}`);
    }
  }
);