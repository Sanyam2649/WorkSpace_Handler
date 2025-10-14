// store/slices/analyticsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllAnalytics,
  fetchAnalyticsOverview,
  fetchAnalyticsActivity,
  fetchUserActivity,
  fetchTopWorkspaces,
  fetchRecentDocuments,
  exportAnalyticsData,
  fetchWorkspaceAnalytics,
  fetchUserEngagement,
  fetchRealTimeActivity
} from '../thunks/AnalyticsThunk';
import { fetchComparativeAnalytics, fetchTrendAnalysis, refreshAnalyticsSection } from '../thunks/AnalyticsThunk';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    // Core analytics data
    overview: {},
    activity: [],
    userActivity: [],
    topWorkspaces: [],
    recentDocs: [],
    
    // Additional analytics data
    workspaceAnalytics: {},
    documentAnalytics: {},
    userEngagement: {},
    storageAnalytics: {},
    collaborationMetrics: {},
    realTimeActivity: [],
    performanceMetrics: {},
    trendAnalysis: {},
    comparativeAnalytics: {},
    growthMetrics: {},
    
    // Loading states
    loading: false,
    overviewLoading: false,
    activityLoading: false,
    userActivityLoading: false,
    topWorkspacesLoading: false,
    recentDocsLoading: false,
    exporting: false,
    workspaceAnalyticsLoading: false,
    documentAnalyticsLoading: false,
    userEngagementLoading: false,
    storageAnalyticsLoading: false,
    collaborationMetricsLoading: false,
    realTimeActivityLoading: false,
    performanceMetricsLoading: false,
    trendAnalysisLoading: false,
    comparativeAnalyticsLoading: false,
    growthMetricsLoading: false,
    refreshInProgress: false,
    
    // Error states
    error: null,
    overviewError: null,
    activityError: null,
    userActivityError: null,
    topWorkspacesError: null,
    recentDocsError: null,
    exportError: null,
    workspaceAnalyticsError: null,
    documentAnalyticsError: null,
    userEngagementError: null,
    storageAnalyticsError: null,
    collaborationMetricsError: null,
    realTimeActivityError: null,
    performanceMetricsError: null,
    trendAnalysisError: null,
    comparativeAnalyticsError: null,
    growthMetricsError: null,
    
    // UI state
    timeRange: 'monthly',
    lastUpdated: null,
    currentWorkspaceId: null,
    currentDocumentId: null,
    activeMetric: 'documents',
    currentTimeRange: 'monthly',
    previousTimeRange: 'monthly',
  },
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
      state.overviewError = null;
      state.activityError = null;
      state.userActivityError = null;
      state.topWorkspacesError = null;
      state.recentDocsError = null;
      state.exportError = null;
      state.workspaceAnalyticsError = null;
      state.documentAnalyticsError = null;
      state.userEngagementError = null;
      state.storageAnalyticsError = null;
      state.collaborationMetricsError = null;
      state.realTimeActivityError = null;
      state.performanceMetricsError = null;
      state.trendAnalysisError = null;
      state.comparativeAnalyticsError = null;
      state.growthMetricsError = null;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
      state.currentTimeRange = action.payload;
    },
    setPreviousTimeRange: (state, action) => {
      state.previousTimeRange = action.payload;
    },
    setActiveMetric: (state, action) => {
      state.activeMetric = action.payload;
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspaceId = action.payload;
    },
    setCurrentDocument: (state, action) => {
      state.currentDocumentId = action.payload;
    },
    updateOverviewData: (state, action) => {
      state.overview = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateActivityData: (state, action) => {
      state.activity = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    clearAnalyticsData: (state) => {
      state.overview = {};
      state.activity = [];
      state.userActivity = [];
      state.topWorkspaces = [];
      state.recentDocs = [];
      state.lastUpdated = null;
    },
    resetAnalyticsState: (state) => {
      return {
        ...analyticsSlice.getInitialState(),
        timeRange: state.timeRange,
        currentTimeRange: state.currentTimeRange,
        previousTimeRange: state.previousTimeRange,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all analytics
      .addCase(fetchAllAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.overview;
        state.activity = action.payload.activity;
        state.userActivity = action.payload.userActivity;
        state.topWorkspaces = action.payload.topWorkspaces;
        state.recentDocs = action.payload.recentDocs;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch overview
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload.overview;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.overviewError = null;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload;
      })
      
      // Fetch activity
      .addCase(fetchAnalyticsActivity.pending, (state) => {
        state.activityLoading = true;
        state.activityError = null;
      })
      .addCase(fetchAnalyticsActivity.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.activity = action.payload.activity;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.activityError = null;
      })
      .addCase(fetchAnalyticsActivity.rejected, (state, action) => {
        state.activityLoading = false;
        state.activityError = action.payload;
      })
      
      // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.userActivityLoading = true;
        state.userActivityError = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivityLoading = false;
        state.userActivity = action.payload.userActivity;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.userActivityError = null;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.userActivityLoading = false;
        state.userActivityError = action.payload;
      })
      
      // Fetch top workspaces
      .addCase(fetchTopWorkspaces.pending, (state) => {
        state.topWorkspacesLoading = true;
        state.topWorkspacesError = null;
      })
      .addCase(fetchTopWorkspaces.fulfilled, (state, action) => {
        state.topWorkspacesLoading = false;
        state.topWorkspaces = action.payload.topWorkspaces;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.topWorkspacesError = null;
      })
      .addCase(fetchTopWorkspaces.rejected, (state, action) => {
        state.topWorkspacesLoading = false;
        state.topWorkspacesError = action.payload;
      })
      
      // Fetch recent documents
      .addCase(fetchRecentDocuments.pending, (state) => {
        state.recentDocsLoading = true;
        state.recentDocsError = null;
      })
      .addCase(fetchRecentDocuments.fulfilled, (state, action) => {
        state.recentDocsLoading = false;
        state.recentDocs = action.payload.recentDocs;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.recentDocsError = null;
      })
      .addCase(fetchRecentDocuments.rejected, (state, action) => {
        state.recentDocsLoading = false;
        state.recentDocsError = action.payload;
      })
      
      // Export analytics
      .addCase(exportAnalyticsData.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportAnalyticsData.fulfilled, (state) => {
        state.exporting = false;
        state.exportError = null;
      })
      .addCase(exportAnalyticsData.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      })
      
      // Fetch workspace analytics
      .addCase(fetchWorkspaceAnalytics.pending, (state) => {
        state.workspaceAnalyticsLoading = true;
        state.workspaceAnalyticsError = null;
      })
      .addCase(fetchWorkspaceAnalytics.fulfilled, (state, action) => {
        state.workspaceAnalyticsLoading = false;
        state.workspaceAnalytics = action.payload.workspaceAnalytics;
        state.currentWorkspaceId = action.payload.workspaceId;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.workspaceAnalyticsError = null;
      })
      .addCase(fetchWorkspaceAnalytics.rejected, (state, action) => {
        state.workspaceAnalyticsLoading = false;
        state.workspaceAnalyticsError = action.payload;
      })
      
      // Fetch user engagement
      .addCase(fetchUserEngagement.pending, (state) => {
        state.userEngagementLoading = true;
        state.userEngagementError = null;
      })
      .addCase(fetchUserEngagement.fulfilled, (state, action) => {
        state.userEngagementLoading = false;
        state.userEngagement = action.payload.userEngagement;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.userEngagementError = null;
      })
      .addCase(fetchUserEngagement.rejected, (state, action) => {
        state.userEngagementLoading = false;
        state.userEngagementError = action.payload;
      })
      
      // Fetch real-time activity
      .addCase(fetchRealTimeActivity.pending, (state) => {
        state.realTimeActivityLoading = true;
        state.realTimeActivityError = null;
      })
      .addCase(fetchRealTimeActivity.fulfilled, (state, action) => {
        state.realTimeActivityLoading = false;
        state.realTimeActivity = action.payload.realTimeActivity;
        state.lastUpdated = new Date().toISOString();
        state.realTimeActivityError = null;
      })
      .addCase(fetchRealTimeActivity.rejected, (state, action) => {
        state.realTimeActivityLoading = false;
        state.realTimeActivityError = action.payload;
      })
      
      // Fetch trend analysis
      .addCase(fetchTrendAnalysis.pending, (state) => {
        state.trendAnalysisLoading = true;
        state.trendAnalysisError = null;
      })
      .addCase(fetchTrendAnalysis.fulfilled, (state, action) => {
        state.trendAnalysisLoading = false;
        state.trendAnalysis = action.payload.trendAnalysis;
        state.activeMetric = action.payload.metric;
        state.timeRange = action.payload.timeRange;
        state.currentTimeRange = action.payload.timeRange;
        state.lastUpdated = new Date().toISOString();
        state.trendAnalysisError = null;
      })
      .addCase(fetchTrendAnalysis.rejected, (state, action) => {
        state.trendAnalysisLoading = false;
        state.trendAnalysisError = action.payload;
      })
      
      // Fetch comparative analytics
      .addCase(fetchComparativeAnalytics.pending, (state) => {
        state.comparativeAnalyticsLoading = true;
        state.comparativeAnalyticsError = null;
      })
      .addCase(fetchComparativeAnalytics.fulfilled, (state, action) => {
        state.comparativeAnalyticsLoading = false;
        state.comparativeAnalytics = action.payload.comparativeAnalytics;
        state.currentTimeRange = action.payload.currentTimeRange;
        state.previousTimeRange = action.payload.previousTimeRange;
        state.lastUpdated = new Date().toISOString();
        state.comparativeAnalyticsError = null;
      })
      .addCase(fetchComparativeAnalytics.rejected, (state, action) => {
        state.comparativeAnalyticsLoading = false;
        state.comparativeAnalyticsError = action.payload;
      })
      
      // Refresh section
      .addCase(refreshAnalyticsSection.pending, (state) => {
        state.refreshInProgress = true;
      })
      .addCase(refreshAnalyticsSection.fulfilled, (state, action) => {
        state.refreshInProgress = false;
        const { section, data, timeRange } = action.payload;
        state[section] = data;
        state.timeRange = timeRange;
        state.currentTimeRange = timeRange;
        state.lastUpdated = new Date().toISOString();
        
        // Clear individual errors
        state[`${section}Error`] = null;
      })
      .addCase(refreshAnalyticsSection.rejected, (state, action) => {
        state.refreshInProgress = false;
        const section = action.meta.arg.section;
        state[`${section}Error`] = action.payload;
      });
      
      // Add similar cases for other analytics thunks (storage, collaboration, performance, growth, etc.)
  },
});

export const {
  clearAnalyticsError,
  setTimeRange,
  setPreviousTimeRange,
  setActiveMetric,
  setCurrentWorkspace,
  setCurrentDocument,
  updateOverviewData,
  updateActivityData,
  clearAnalyticsData,
  resetAnalyticsState,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;