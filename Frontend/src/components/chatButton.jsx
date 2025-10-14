import React, { useState } from "react";
import Chat from "./Chat";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://excellence-technology-1.onrender.com";
const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg z-50"
      >
        💬
      </button>

      {/* Chat component */}
      {isOpen && (
        <Chat 
          apiBaseUrl={`${BACKEND_URL}/api`} 
          socketUrl={SOCKET_URL}            
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}  
        />
      )}
    </>
  );
};

export default ChatButton;