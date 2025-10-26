// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/authSlice';
import workspaceReducer from './slices/workSpaceSlice';
import documentsReducer from './slices/documentSlice';
import analyticsReducer from './slices/analyticSlice';
import toastMiddleware from '../middleware/toastMiddleware';

const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    documents: documentsReducer,
    analytics: analyticsReducer
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['SHOW_TOAST'],
      },
    }).concat(toastMiddleware)
});

export default store;
