// store/slices/workspaceSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllWorkspaces,
  fetchWorkspace,
  fetchWorkspaceDocuments,
  createNewWorkspace,
  updateExistingWorkspace,
  deleteExistingWorkspace,
  addWorkspaceMemberThunk,
  removeWorkspaceMemberThunk,
  updateWorkspaceMemberRoleThunk,
  searchWorkspaceDocuments
} from '../thunks/WorkSpaceThunk';

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    // Workspaces list (for WorkspacesPage)
    workspacesList: [],
    workspacesLoading: false,
    workspacesError: null,
    
    // Current workspace details (for Workspace page)
    currentWorkspace: null,
    documents: [],
    members: [],
    searchResults: [],
    loading: false,
    documentsLoading: false,
    searchLoading: false,
    error: null
  },
  reducers: {
    clearWorkspacesError: (state) => {
      state.workspacesError = null;
    },
    clearWorkspaceError: (state) => {
      state.error = null;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
      state.documents = [];
      state.members = [];
      state.searchResults = [];
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateDocumentInList: (state, action) => {
      const index = state.documents.findIndex(doc => doc._id === action.payload._id);
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    addDocumentToList: (state, action) => {
      state.documents.push(action.payload);
    },
    removeDocumentFromList: (state, action) => {
      state.documents = state.documents.filter(doc => doc._id !== action.payload);
    },
    refreshWorkspaceData: (state) => {
      // Trigger refresh in components
      state.loading = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== WORKSPACES LIST ACTIONS ==========
      // Fetch all workspaces
      .addCase(fetchAllWorkspaces.pending, (state) => {
        state.workspacesLoading = true;
        state.workspacesError = null;
      })
      .addCase(fetchAllWorkspaces.fulfilled, (state, action) => {
        state.workspacesLoading = false;
        state.workspacesList = action.payload;
      })
      .addCase(fetchAllWorkspaces.rejected, (state, action) => {
        state.workspacesLoading = false;
        state.workspacesError = action.payload;
      })
      // Create workspace
      .addCase(createNewWorkspace.fulfilled, (state, action) => {
        state.workspacesList.push(action.payload);
      })
      // Update workspace
      .addCase(updateExistingWorkspace.fulfilled, (state, action) => {
        const index = state.workspacesList.findIndex(ws => ws._id === action.payload._id);
        if (index !== -1) {
          state.workspacesList[index] = action.payload;
        }
        // Also update current workspace if it's the same one
        if (state.currentWorkspace && state.currentWorkspace._id === action.payload._id) {
          state.currentWorkspace = action.payload;
        }
      })
      // Delete workspace
      .addCase(deleteExistingWorkspace.fulfilled, (state, action) => {
        state.workspacesList = state.workspacesList.filter(ws => ws._id !== action.payload);
        // Clear current workspace if it's the deleted one
        if (state.currentWorkspace && state.currentWorkspace._id === action.payload) {
          state.currentWorkspace = null;
        }
      })

      // ========== CURRENT WORKSPACE ACTIONS ==========
      // Fetch single workspace
      .addCase(fetchWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkspace = action.payload;
        state.members = action.payload.members || [];
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch workspace documents
      .addCase(fetchWorkspaceDocuments.pending, (state) => {
        state.documentsLoading = true;
      })
      .addCase(fetchWorkspaceDocuments.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchWorkspaceDocuments.rejected, (state) => {
        state.documentsLoading = false;
      })
      // Search documents
      .addCase(searchWorkspaceDocuments.pending, (state) => {
        state.searchLoading = true;
        state.searchResults = [];
      })
      .addCase(searchWorkspaceDocuments.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchWorkspaceDocuments.rejected, (state) => {
        state.searchLoading = false;
      })
      // Add member
      .addCase(addWorkspaceMemberThunk.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
        state.members = action.payload.members || [];
      })
      // Remove member
      .addCase(removeWorkspaceMemberThunk.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m._id !== action.payload.memberId);
      })
      // Update member role
      .addCase(updateWorkspaceMemberRoleThunk.fulfilled, (state, action) => {
        const member = state.members.find(m => m._id === action.payload.memberId);
        if (member) {
          member.roles = [action.payload.role];
        }
      });
  }
});

export const {
  clearWorkspacesError,
  clearWorkspaceError,
  clearCurrentWorkspace,
  clearSearchResults,
  updateDocumentInList,
  addDocumentToList,
  removeDocumentFromList,
  refreshWorkspaceData
} = workspaceSlice.actions;
export default workspaceSlice.reducer;