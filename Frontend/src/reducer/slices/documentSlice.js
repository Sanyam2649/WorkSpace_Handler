// store/slices/documentsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDocument,
  createNewDocument,
  updateExistingDocument,
  deleteExistingDocument,
  shareDocumentThunk,
  addDocumentMemberThunk,
  removeDocumentFilesThunk,
  rollbackDocumentThunk
} from '../thunks/documentThunk';

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    currentDocument: null,
    loading: false,
    error: null,
    updating: false,
    creating: false,
    deleting: false
  },
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
      state.error = null;
    },
    clearDocumentError: (state) => {
      state.error = null;
    },
    setDocumentUpdating: (state, action) => {
      state.updating = action.payload;
    },
    updateDocumentContent: (state, action) => {
      if (state.currentDocument) {
        state.currentDocument = {
          ...state.currentDocument,
          ...action.payload
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch document
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentDocument = null;
      })
      // Create document
      .addCase(createNewDocument.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createNewDocument.fulfilled, (state, action) => {
        state.creating = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(createNewDocument.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update document
      .addCase(updateExistingDocument.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateExistingDocument.fulfilled, (state, action) => {
        state.updating = false;
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(updateExistingDocument.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Delete document
      .addCase(deleteExistingDocument.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteExistingDocument.fulfilled, (state) => {
        state.deleting = false;
        state.currentDocument = null;
        state.error = null;
      })
      .addCase(deleteExistingDocument.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      // Share document
      .addCase(shareDocumentThunk.pending, (state) => {
        state.updating = true;
      })
      .addCase(shareDocumentThunk.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(shareDocumentThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Add document member
      .addCase(addDocumentMemberThunk.pending, (state) => {
        state.updating = true;
      })
      .addCase(addDocumentMemberThunk.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(addDocumentMemberThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Remove document files
      .addCase(removeDocumentFilesThunk.pending, (state) => {
        state.updating = true;
      })
      .addCase(removeDocumentFilesThunk.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(removeDocumentFilesThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Rollback document
      .addCase(rollbackDocumentThunk.pending, (state) => {
        state.updating = true;
      })
      .addCase(rollbackDocumentThunk.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(rollbackDocumentThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCurrentDocument,
  clearDocumentError,
  setDocumentUpdating,
  updateDocumentContent
} = documentsSlice.actions;
export default documentsSlice.reducer;