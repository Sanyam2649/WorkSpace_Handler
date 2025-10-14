// store/thunks/documentThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  addDocumentMember,
  removeDocumentFiles,
  rollbackDocument
} from '../../api';

// Fetch single document
export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const document = await getDocument(documentId);
      return document;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch document');
    }
  }
);

// Create new document
export const createNewDocument = createAsyncThunk(
  'documents/create',
  async ({ workspaceId, documentData, files }, { rejectWithValue }) => {
    try {
      const newDocument = await createDocument(
        { workspaceId, ...documentData },
        files
      );
      return newDocument;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create document');
    }
  }
);

// Update document
export const updateExistingDocument = createAsyncThunk(
  'documents/update',
  async ({ documentId, documentData, files }, { rejectWithValue }) => {
    try {
      const updatedDocument = await updateDocument(documentId, documentData, files);
      return updatedDocument;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update document');
    }
  }
);

// Delete document
export const deleteExistingDocument = createAsyncThunk(
  'documents/delete',
  async (documentId, { rejectWithValue }) => {
    try {
      await deleteDocument(documentId);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete document');
    }
  }
);

// Share document
export const shareDocumentThunk = createAsyncThunk(
  'documents/share',
  async ({ documentId, userIds }, { rejectWithValue }) => {
    try {
      await shareDocument(documentId, userIds);
      return { documentId, userIds };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to share document');
    }
  }
);

// Add document member
export const addDocumentMemberThunk = createAsyncThunk(
  'documents/addMember',
  async ({ documentId, userId, role }, { rejectWithValue }) => {
    try {
      await addDocumentMember(documentId, userId, role);
      return { documentId, userId, role };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add document member');
    }
  }
);

// Remove document files
export const removeDocumentFilesThunk = createAsyncThunk(
  'documents/removeFiles',
  async ({ documentId, fileIds }, { rejectWithValue }) => {
    try {
      await removeDocumentFiles(documentId, fileIds);
      return { documentId, fileIds };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove files');
    }
  }
);

// Rollback document version
export const rollbackDocumentThunk = createAsyncThunk(
  'documents/rollback',
  async ({ documentId, versionIndex }, { rejectWithValue }) => {
    try {
      await rollbackDocument(documentId, versionIndex);
      return { documentId, versionIndex };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to rollback document');
    }
  }
);