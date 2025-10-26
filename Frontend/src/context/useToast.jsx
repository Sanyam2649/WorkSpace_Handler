// src/context/useToast.jsx
import { toast } from 'react-toastify';

export const useToast = () => {
  const showToast = (message, type = 'info', options = {}) => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warn(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  const showSuccess = (message, options = {}) => {
    showToast(message, 'success', options);
  };

  const showError = (message, options = {}) => {
    showToast(message, 'error', options);
  };

  const showWarning = (message, options = {}) => {
    showToast(message, 'warning', options);
  };

  const showInfo = (message, options = {}) => {
    showToast(message, 'info', options);
  };

  const showPromise = (promise, messages, options = {}) => {
    return toast.promise(promise, messages, {
      theme: "light",
      ...options
    });
  };

  const dismissToast = (toastId = null) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPromise,
    dismissToast,
    toast
  };
};

export default useToast;