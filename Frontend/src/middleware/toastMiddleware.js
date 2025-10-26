// src/middleware/toastMiddleware.js
import { toast } from 'react-toastify';

const toastMiddleware = () => (next) => (action) => {
  if (action.type.endsWith('/rejected')) {
    const errorMessage = action.payload || action.error?.message || 'Something went wrong!';
        if (action.type !== 'user/fetchUser/rejected') {
      toast.error(errorMessage);
    }
  }

  if (action.type === 'user/updatePreferences/fulfilled') {
    if (action.payload?.message) {
      toast.success(action.payload.message);
    }
  }

  if (action.type === 'SHOW_TOAST') {
    const { message, type = 'info', options = {} } = action.payload;
    const toastMethod = toast[type] || toast;
    toastMethod(message, options);
    return; 
  }

  return next(action);
};

export default toastMiddleware;