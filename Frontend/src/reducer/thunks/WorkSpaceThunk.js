// store/thunks/workspaceThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceUserDocuments,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  addWorkspaceMember,
  searchDocuments
} from '../../api';

// Fetch all workspaces for the current user
export const fetchAllWorkspaces = createAsyncThunk(
  'workspaces/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const workspaces = await getAllWorkspaces();
      return workspaces;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch workspaces');
    }
  }
);

// Fetch single workspace by ID
export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const workspace = await getWorkspaceById(workspaceId);
      return workspace;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch workspace');
    }
  }
);

// Fetch workspace documents
export const fetchWorkspaceDocuments = createAsyncThunk(
  'workspace/fetchDocuments',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const documents = await getWorkspaceUserDocuments(workspaceId);
      return documents;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

// Create new workspace
export const createNewWorkspace = createAsyncThunk(
  'workspaces/create',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const newWorkspace = await createWorkspace(workspaceData);
      return newWorkspace;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create workspace');
    }
  }
);

// Update workspace
export const updateExistingWorkspace = createAsyncThunk(
  'workspaces/update',
  async ({ workspaceId, workspaceData }, { rejectWithValue }) => {
    try {
      const updatedWorkspace = await updateWorkspace(workspaceId, workspaceData);
      return updatedWorkspace;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update workspace');
    }
  }
);

// Delete workspace
export const deleteExistingWorkspace = createAsyncThunk(
  'workspaces/delete',
  async (workspaceId, { rejectWithValue }) => {
    try {
      await deleteWorkspace(workspaceId);
      return workspaceId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete workspace');
    }
  }
);

// Add member to workspace
export const addWorkspaceMemberThunk = createAsyncThunk(
  'workspace/addMember',
  async ({ workspaceId, memberData }, { rejectWithValue }) => {
    try {
      const updatedWorkspace = await addWorkspaceMember(workspaceId, memberData);
      return updatedWorkspace;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add member');
    }
  }
);

// Remove member from workspace
export const removeWorkspaceMemberThunk = createAsyncThunk(
  'workspace/removeMember',
  async ({ workspaceId, memberId }, { rejectWithValue }) => {
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      return { workspaceId, memberId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove member');
    }
  }
);

// Update member role
export const updateWorkspaceMemberRoleThunk = createAsyncThunk(
  'workspace/updateMemberRole',
  async ({ workspaceId, memberId, role }, { rejectWithValue }) => {
    try {
      await updateWorkspaceMemberRole(workspaceId, memberId, [role]);
      return { workspaceId, memberId, role };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update member role');
    }
  }
);

// Search documents in workspace
export const searchWorkspaceDocuments = createAsyncThunk(
  'workspace/searchDocuments',
  async ({ query, workspaceId }, { rejectWithValue }) => {
    try {
      const results = await searchDocuments(query, workspaceId);
      return results;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search documents');
    }
  }
);

