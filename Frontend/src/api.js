// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';
// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
  return headers;
};

// Helper function to get auth headers for file uploads
const getFileUploadHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ==================== USER API FUNCTIONS ====================

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/user/get-user`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {File} avatarFile - Optional avatar file
 */
export const updateProfile = async (profileData, avatarFile = null) => {
  const formData = new FormData();

  // Helper to recursively append data to FormData
  const appendFormData = (data, parentKey = '') => {
    Object.keys(data).forEach(key => {
      const value = data[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value === undefined || value === null) return;

      if (typeof value === 'object' && !(value instanceof File)) {
        appendFormData(value, formKey);
      } else {
        formData.append(formKey, value);
      }
    });
  };

  appendFormData(profileData);

  // Add avatar file if provided
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: getFileUploadHeaders(),
    body: formData,
  });

  return handleResponse(response);
};


/**
 * Logout user
 */
export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/user/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Delete user account
 * @param {string} password - User password for verification
 */
export const deleteAccount = async (password) => {
  const response = await fetch(`${API_BASE_URL}/user/delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
};

// ==================== WORKSPACE API FUNCTIONS ====================

/**
 * Create a new workspace
 * @param {Object} workspaceData - Workspace data
 * @param {string} workspaceData.name - Workspace name
 * @param {string} workspaceData.description - Workspace description
 */
export const createWorkspace = async (workspaceData) => {
const response = await fetch(`${API_BASE_URL}/workspace/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(workspaceData),
  });
  return handleResponse(response);
};

/**
 * Get all workspaces for current user
 */
export const getAllWorkspaces = async () => {
  const response = await fetch(`${API_BASE_URL}/workspace/all-workspace`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get workspace by slug
 * @param {string} slug - Workspace slug
 */
export const getWorkspaceById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
   });
  return handleResponse(response);
};

/**
* Update workspace by ID
* @param {string} id - Workspace ID
* @param {Object} updateData - Fields to update ({ name, description })
*/
export const updateWorkspace = async (id, updateData) => {
 const response = await fetch(`${API_BASE_URL}/workspace/${id}`, {
 method: 'PUT',
 headers: getAuthHeaders(),
 body: JSON.stringify(updateData),
});
 return handleResponse(response);
};


/**
 * Delete workspace
 * @param {string} workspaceId - Workspace ID
 */
export const deleteWorkspace = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Add member to workspace
 * @param {string} id - Workspace slug
 * @param {Object} memberData - Member data
 * @param {string} memberData.userId - User ID to add
 * @param {Array} memberData.roles - Array of roles
 * @param {string} memberData.documentId - Optional document ID
 * @param {string} memberData.documentRole - Optional document role
 */
export const addWorkspaceMember = async (id, memberData) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}/add-member`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(memberData),
  });
  return handleResponse(response);
};

/**
 * Remove member from workspace
 * @param {string} id - Workspace slug
 * @param {string} memberId - Member ID to remove
 */
export const removeWorkspaceMember = async (id, memberId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}/members/${memberId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update member roles in workspace
 * @param {string} id - Workspace id
 * @param {string} memberId - Member ID
 * @param {Array} roles - New roles array
 */
export const updateWorkspaceMemberRole = async (id, memberId, roles) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}/members/${memberId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ roles }),
  });
  return handleResponse(response);
};

/**
 * Get user documents in workspace
 * @param {string} id - Workspace id
 */
export const getWorkspaceUserDocuments = async (id) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}/user-documents`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update document role for user
 * @param {string} id - Workspace id
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {string} role - New role
 */
export const updateDocumentRole = async (id, documentId, userId, role) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${id}/documents/${documentId}/role/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
};

/**
 * Search members in workspace
 * @param {string} workspaceId - Workspace ID
 * @param {string} query - Search query
 */
export const searchWorkspaceMembers = async (workspaceId, query) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/search-members?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Request to join a workspace
 * @param {string} workspaceId - ID of the workspace
 */
export const requestToJoinWorkspace = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/request/${workspaceId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  return handleResponse(response);
};

/**
 * Accept a pending workspace join request (Admin only)
 * @param {string} workspaceId - ID of the workspace
 * @param {string} memberId - ID of the user whose request is being accepted
 */
export const acceptWorkspaceRequest = async (workspaceId, memberId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/accept-request/${memberId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Reject a pending workspace join request (Admin only)
 * @param {string} workspaceId - ID of the workspace
 * @param {string} memberId - ID of the user whose request is being rejected
 */
export const rejectWorkspaceRequest = async (workspaceId, memberId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/reject/${memberId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};


// ==================== DOCUMENT API FUNCTIONS ====================

/**
 * Create a new document
 * @param {Object} documentData - Document data
 * @param {string} documentData.workspaceId - Workspace ID
 * @param {string} documentData.title - Document title
 * @param {string} documentData.content - Document content
 * @param {string} documentData.sharedWithType - Sharing type
 * @param {Array} documentData.sharedUsers - Array of shared user IDs
 * @param {Array} documentData.sharedRoles - Array of shared roles
 * @param {FileList} files - Files to upload
 */
export const createDocument = async (documentData, files = null) => {
  const formData = new FormData();
  
  // Add document fields
  Object.keys(documentData).forEach(key => {
    if (documentData[key] !== undefined && documentData[key] !== null) {
      formData.append(key, documentData[key]);
    }
  });
  
  // Add files if provided
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/docs/create`, {
    method: 'POST',
    headers: getFileUploadHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 */
export const getDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Update document
 * @param {string} documentId - Document ID
 * @param {Object} documentData - Document data to update
 * @param {string} documentData.title - Document title
 * @param {string} documentData.content - Document content
 * @param {FileList} files - Files to upload
 */
export const updateDocument = async (documentId, documentData, files = null) => {
  const formData = new FormData();
  
  // Add document fields
  Object.keys(documentData).forEach(key => {
    if (documentData[key] !== undefined && documentData[key] !== null) {
      formData.append(key, documentData[key]);
    }
  });
  
  // Add files if provided
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/docs/update/${documentId}`, {
    method: 'PUT',
    headers: getFileUploadHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

/**
 * Rollback document to previous version
 * @param {string} documentId - Document ID
 * @param {number} versionIndex - Version index to rollback to
 */
export const rollbackDocument = async (documentId, versionIndex) => {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}/rollback`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ versionIndex }),
  });
  return handleResponse(response);
};

/**
 * Delete document
 * @param {string} documentId - Document ID
 */
export const deleteDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}/delete`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Share document with users
 * @param {string} documentId - Document ID
 * @param {Array} users - Array of user IDs to share with
 */
export const shareDocument = async (documentId, users) => {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}/share`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ users }),
  });
  return handleResponse(response);
};

/**
 * Add member to document
 * @param {string} documentId - Document ID
 * @param {string} memberId - Member ID to add
 * @param {string} role - Role for the member
 */
export const addDocumentMember = async (documentId, memberId, role = 'Viewer') => {
  const response = await fetch(`${API_BASE_URL}/docs/add-member/${documentId}/${memberId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
};

/**
 * Remove files from document
 * @param {string} documentId - Document ID
 * @param {Array} publicIds - Array of file public IDs to remove
 */
export const removeDocumentFiles = async (documentId, publicIds) => {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}/files`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ publicIds }),
  });
  return handleResponse(response);
};

// ==================== SEARCH API FUNCTIONS ====================

/**
 * Search documents
 * @param {string} query - Search query
 * @param {string} workspaceId - Workspace ID to search in
 */
export const searchDocuments = async (query, workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/search/document?q=${encodeURIComponent(query)}&workspaceId=${workspaceId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Search members
 * @param {string} query - Search query
 */
export const searchMembers = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search/member?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Search workspaces
 * @param {string} query - Search query
 */
export const searchWorkspaces = async (query) => {
  const response = await fetch(`${API_BASE_URL}/search/workspace?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==================== ANALYTICS API FUNCTIONS ====================

/**
 * Get analytics overview
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getAnalyticsOverview = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/overview?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get activity data over time
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 * @param {string} type - Activity type (all, workspaces, documents, messages)
 */
export const getAnalyticsActivity = async (timeRange = 'monthly', type = 'all') => {
  const response = await fetch(`${API_BASE_URL}/analytics/activity?timeRange=${timeRange}&type=${type}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get user activity by hour
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getUserActivity = async (timeRange = 'daily') => {
  const response = await fetch(`${API_BASE_URL}/analytics/user-activity?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get top workspaces by activity
 * @param {number} limit - Number of workspaces to return
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getTopWorkspaces = async (limit = 10, timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/top-workspaces?limit=${limit}&timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get recent document activity
 * @param {number} limit - Number of documents to return
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getRecentDocuments = async (limit = 10, timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/recent-documents?limit=${limit}&timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Export analytics data
 * @param {string} format - Export format (json, csv)
 * @param {string} timeRange - Time range for export
 */
export const exportAnalytics = async (format = 'json', timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/export?format=${format}&timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (format === 'csv') {
    // For CSV, handle blob response
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Export completed successfully' };
    } else {
      throw new Error('Failed to export analytics data');
    }
  }
  
  return handleResponse(response);
};

// ==================== ADDITIONAL ANALYTICS APIS ====================

/**
 * Get workspace-specific analytics
 * @param {string} workspaceId - Workspace ID
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getWorkspaceAnalytics = async (workspaceId, timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/workspace/${workspaceId}?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get document-specific analytics
 * @param {string} documentId - Document ID
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getDocumentAnalytics = async (documentId, timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/document/${documentId}?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get user engagement metrics
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getUserEngagement = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/user-engagement?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get storage usage analytics
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getStorageAnalytics = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/storage?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get collaboration metrics
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getCollaborationMetrics = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/collaboration?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get real-time activity feed
 * @param {number} limit - Number of activities to return
 */
export const getRealTimeActivity = async (limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/analytics/real-time?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get performance metrics
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getPerformanceMetrics = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/performance?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get trend analysis
 * @param {string} metric - Metric to analyze (documents, messages, users)
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getTrendAnalysis = async (metric = 'documents', timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/trends?metric=${metric}&timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==================== COMPARATIVE ANALYTICS ====================

/**
 * Compare analytics between two time periods
 * @param {string} currentTimeRange - Current time range
 * @param {string} previousTimeRange - Previous time range for comparison
 */
export const getComparativeAnalytics = async (currentTimeRange = 'monthly', previousTimeRange = 'monthly') => {
  const response = await fetch(
    `${API_BASE_URL}/analytics/compare?current=${currentTimeRange}&previous=${previousTimeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get growth metrics
 * @param {string} timeRange - Time range (daily, weekly, monthly, yearly)
 */
export const getGrowthMetrics = async (timeRange = 'monthly') => {
  const response = await fetch(`${API_BASE_URL}/analytics/growth?timeRange=${timeRange}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==================== AUTH API FUNCTIONS ====================

/**
 * Login with email/username/phone and password
 * @param {string} identifier - Email, username, or phone
 * @param {string} password - Password
 */
export const login = async (identifier, password) => {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });
  return handleResponse(response);
};

/**
 * Signup with user data
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Phone number
 */
export const signup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/user/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

/**
 * @param {Object} email
 */

export const rejectVerification = async ({ email }) => {
  const response = await fetch(`${API_BASE_URL}/user/unverify-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};
/**
 * @param {Object} verificationData
 * @param {Object} otp - User Otp
 * @param {Object} email - User email
 */

export const verifyOtp = async(verificationData) => {
  const response = await fetch(`${API_BASE_URL}/user/verify-otp`,{
    method : 'POST',
         headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationData),
  });
  return handleResponse(response);
};

/**
 * @param {Object} forgotData
 * @param {string} forgotData.identifier - Email or username
 */

export const forgotPassword = async (forgotData) => {
  const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(forgotData),
  });
  return handleResponse(response);
};

/**
 * @param {Object} resetData
 * @param {string} resetData.identifier - Email or username
 * @param {string} resetData.newPassword - One-time password
 */

export const resetPassword = async (resetData) => {
  const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resetData),
  });
  return handleResponse(response);
};


/**
 * @param {Object} passwordData
 * @param {Object} email
 * @param {Object} password
 */

export const setPassword = async (passwordData) => {
  const response = await fetch(`${API_BASE_URL}/user/set-password`,
  {
    method : 'POST',
         headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
  return handleResponse(response);
}


/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 */
export const refreshToken = async (refreshToken) => {
  const response = await fetch(`${API_BASE_URL}/user/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse(response);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!sessionStorage.getItem('accessToken');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('lastPage');
};

/**
 * Set authentication data
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {Object} user - User data
 */
export const setAuth = (accessToken, refreshToken, user) => {
  sessionStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('refreshToken', refreshToken);
  sessionStorage.setItem('user', JSON.stringify(user));
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Save current page for redirect after login
 * @param {string} path - Current page path
 */
export const saveLastPage = (path) => {
  localStorage.setItem('lastPage', path);
};

/**
 * Get last page and clear it
 */
export const getAndClearLastPage = () => {
  const lastPage = localStorage.getItem('lastPage');
  localStorage.removeItem('lastPage');
  return lastPage || '/dashboard';
};

// ==================== FRIEND SYSTEM API FUNCTIONS ====================

/**
 * Send a friend invite
 * @param {string} friendId - ID of the user to invite
 */
export const sendFriendRequest = async (friendId) => {
  const response = await fetch(`${API_BASE_URL}/user/invite-friend/${friendId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * @param {string} type - workspace or document
 * @param {string} id - workspaceId or DocumentId
 * @param {string} settings - {policy : ""} 
 */

export const chatSettings = async ({type , id , settings}) => {
  const response = await fetch(`${API_BASE_URL}/user/chat-settings`, {
    method : 'POST',
        headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, id, settings }),
  });
  return handleResponse(response);
};

/**
 * Accept a friend invite
 * @param {string} friendId - ID of the user who sent the invite
 */
export const acceptInvite = async (friendId) => {
  const response = await fetch(`${API_BASE_URL}/user/accept-invite/${friendId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Reject a friend invite
 * @param {string} friendId - ID of the user who sent the invite
 */
export const rejectInvite = async (friendId) => {
  const response = await fetch(`${API_BASE_URL}/user/reject-invite/${friendId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get the current user's friend list
 */
export const getFriendList = async () => {
  const response = await fetch(`${API_BASE_URL}/user/friendList`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get chat history for a specific chat room
 * @param {string} type - Type of chat ('user', 'workspace', 'document')
 * @param {string} roomId - ID of the chat room
 * @param {string} userId - User ID (required for direct messages)
 */
export const getChatHistory = async ({type, roomId, userId}) => {
  const response = await fetch(`${API_BASE_URL}/user/chat/history`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, roomId, userId }),
  });

  return handleResponse(response);
};


export default {
  login,
  signup,
  refreshToken,
  getCurrentUser,
  updateProfile,
  logout,
  deleteAccount,
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  getWorkspaceUserDocuments,
  updateDocumentRole,
  searchWorkspaceMembers,
  createDocument,
  getDocument,
  updateDocument,
  rollbackDocument,
  deleteDocument,
  shareDocument,
  addDocumentMember,
  removeDocumentFiles,
  searchDocuments,
  searchMembers,
  searchWorkspaces,
  getAnalyticsOverview,
  getWorkspaceAnalytics,
  getDocumentAnalytics,
  getAnalyticsActivity,
  getUserActivity,
  getTopWorkspaces,
  getRecentDocuments,
  getUserEngagement,
  getStorageAnalytics,
  getCollaborationMetrics,
  getRealTimeActivity,
  getPerformanceMetrics,
  getTrendAnalysis,
  getComparativeAnalytics,
  getGrowthMetrics,
  exportAnalytics,
  isAuthenticated,
  clearAuth,
  setAuth,
  getStoredUser,
  saveLastPage,
  getAndClearLastPage,
  sendFriendRequest,
  acceptInvite,
  rejectInvite,
  getFriendList,
  getChatHistory
};
