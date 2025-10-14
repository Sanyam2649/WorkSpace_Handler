// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/authSlice';
import workspaceReducer from './slices/workSpaceSlice';
import documentsReducer from './slices/documentSlice';
import analyticsReducer from './slices/analyticSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    documents: documentsReducer,
    analytics: analyticsReducer
  },
  // middleware and devTools enabled by default in Redux Toolkit
});

export default store;
