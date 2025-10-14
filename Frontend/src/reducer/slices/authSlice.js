// store/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchUser, 
  refreshToken, 
  refreshTokenAndFetchUser 
} from "../thunks/userThunk";

const userSlice = createSlice({
  name: "user",
  initialState: {
    value: null,
    loading: false,
    error: null,
    tokenRefreshing: false,
    tokenError: null,
  },
  reducers: {
    logout: (state) => {
      state.value = null;
      state.error = null;
      state.tokenError = null;
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    },
    clearError: (state) => {
      state.error = null;
      state.tokenError = null;
    },
    setUser: (state, action) => {
      state.value = action.payload;
    },
    updateUser: (state, action) => {
      if (state.value) {
        state.value = { ...state.value, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Auto-logout on critical errors
        if (action.payload === "No refresh token found" || action.payload.includes("Session expired")) {
          state.value = null;
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
        }
      })
      // Refresh Token cases
      .addCase(refreshToken.pending, (state) => {
        state.tokenRefreshing = true;
        state.tokenError = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.tokenRefreshing = false;
        state.tokenError = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.tokenRefreshing = false;
        state.tokenError = action.payload;
        // Auto-logout on token refresh failure
        state.value = null;
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
      })
      // Combined refresh token and fetch user
      .addCase(refreshTokenAndFetchUser.pending, (state) => {
        state.tokenRefreshing = true;
        state.loading = true;
        state.error = null;
        state.tokenError = null;
      })
      .addCase(refreshTokenAndFetchUser.fulfilled, (state, action) => {
        state.tokenRefreshing = false;
        state.loading = false;
        state.value = action.payload;
        state.error = null;
        state.tokenError = null;
      })
      .addCase(refreshTokenAndFetchUser.rejected, (state, action) => {
        state.tokenRefreshing = false;
        state.loading = false;
        state.tokenError = action.payload;
        // Auto-logout on combined operation failure
        state.value = null;
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
      });
  },
});

export const { logout, clearError, setUser, updateUser } = userSlice.actions;
export default userSlice.reducer;