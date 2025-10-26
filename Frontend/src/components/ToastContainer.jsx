// src/components/ToastContainer.jsx
import React from 'react';
import { ToastContainer as ReactToastContainer } from 'react-toastify';

const ToastContainer = () => {
  return (
    <ReactToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
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

export default ToastContainer;