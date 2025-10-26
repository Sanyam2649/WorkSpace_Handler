import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SafeToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light" // Default theme
      style={{
        fontSize: '14px',
        zIndex: 9999,
      }}
      toastStyle={{
        borderRadius: '8px',
        fontFamily: 'inherit',
      }}
    />
  );
};

export default SafeToastProvider;