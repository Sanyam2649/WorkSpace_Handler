// store/thunks/userThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentUser, refreshToken as refreshTokenApi } from "../../api";

// Async thunk to fetch current user with token refresh logic
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      // Try fetching user
      const response = await getCurrentUser();
      return response.user;
    } catch (err) {
      // If token expired, try refreshing
      if (err.message === "TokenExpired") {
        try {
          const storedRefreshToken = sessionStorage.getItem("refreshToken");
          if (!storedRefreshToken) throw new Error("No refresh token found");

          const refreshResponse = await refreshTokenApi(storedRefreshToken);

          // Save new access token in sessionStorage
          sessionStorage.setItem("accessToken", refreshResponse.accessToken);

          // Retry fetching user with new token
          const retryResponse = await getCurrentUser();
          return retryResponse.user;
        } catch (refreshErr) {
          return rejectWithValue(refreshErr.message);
        }
      }
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to refresh token
export const refreshToken = createAsyncThunk(
  "user/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const storedRefreshToken = sessionStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token found");
      }

      const refreshResponse = await refreshTokenApi(storedRefreshToken);

      // Save new access token in sessionStorage
      sessionStorage.setItem("accessToken", refreshResponse.accessToken);

      return refreshResponse.accessToken;
    } catch (error) {
      // Clear tokens if refresh fails
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      return rejectWithValue(error.message);
    }
  }
);

// Optional: Combined thunk for refresh token + fetch user
export const refreshTokenAndFetchUser = createAsyncThunk(
  "user/refreshTokenAndFetchUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // First refresh the token
      await dispatch(refreshToken()).unwrap();
      
      // Then fetch fresh user data
      const userResponse = await getCurrentUser();
      return userResponse.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);