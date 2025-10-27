import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentUser, refreshToken as refreshTokenApi } from "../../api";

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.user;
    } catch (err) {
      if (err.message === "TokenExpired") {
        try {
          const storedRefreshToken = sessionStorage.getItem("refreshToken");
          if (!storedRefreshToken) throw new Error("No refresh token found");

          const refreshResponse = await refreshTokenApi(storedRefreshToken);
          sessionStorage.setItem("accessToken", refreshResponse.accessToken);

          const retryResponse = await getCurrentUser();
          return retryResponse.user;
        } catch (refreshErr) {
          return rejectWithValue(refreshErr.message);
        }
      }
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      const user = state.user?.value;
      if (user) {
        return false;
      }
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
