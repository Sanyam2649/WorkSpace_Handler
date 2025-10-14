import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getFriendList, getChatHistory } from "../api";
import ChatSelector from "./chatSelector";
import { useSelector } from "react-redux";

const Chat = ({ isOpen, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = useSelector((state) => state.user.value);

  // Socket connection
  useEffect(() => {
    if (!isOpen || !user) return;

    const sock = io(import.meta.env.VITE_APP_SOCKET_URL, {
      auth: {
        token: sessionStorage.getItem("accessToken")
      }
    });

    setSocket(sock);

    sock.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    });

    sock.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    sock.on("chat:message", (message) => {
      console.log("📨 New message:", message);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg._id === message._id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    sock.on("chat:typing", (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [isOpen, user]);

  // Load chat data
  useEffect(() => {
    const loadChatData = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const data = await getFriendList();
        setFriendList(data.friendList || []);
        setWorkspaceList(data.workspaceList || []);
        setDocumentList(data.documentList || []);
      } catch (err) {
        console.error("Error loading chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [isOpen]);

  // Handle chat selection
  const handleSelectChat = async (chat) => {
    if (!socket) return;

    // Leave previous chat room
    if (activeChat) {
      socket.emit("chat:leave", {
        type: activeChat.type,
        roomId: activeChat.roomId,
        userId: user._id
      });
    }

    setActiveChat(chat);
    setMessages([]);

    // Join new chat room
    socket.emit("chat:join", {
      type: chat.type,
      roomId: chat.roomId,
      userId: user._id
    });
    
    console.log(chat, "chat");
    // Load chat history
    try {
      const history = await getChatHistory({
        type: chat.type,
        roomId: chat.roomId,
        userId: chat.otherUserId
      });
      setMessages(history.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeChat) return;

    const messageData = {
      type: activeChat.type,
      roomId: activeChat.roomId,
      from: user._id,
      to: activeChat.otherUserId,
      message: newMessage.trim()
    };

    // Optimistically add message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      ...messageData,
      from: user,
      createdAt: new Date(),
      isSending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    // Stop typing indicator
    stopTyping();

    // Send via socket
    socket.emit("chat:message", messageData);
  };

  // Typing indicators
  const startTyping = () => {
    if (!socket || !activeChat) return;

    socket.emit("chat:typing", {
      type: activeChat.type,
      roomId: activeChat.roomId,
      userId: user._id,
      isTyping: true
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!socket || !activeChat) return;

    socket.emit("chat:typing", {
      type: activeChat.type,
      roomId: activeChat.roomId,
      userId: user._id,
      isTyping: false
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClose = () => {
    if (socket && activeChat) {
      socket.emit("chat:leave", {
        type: activeChat.type,
        roomId: activeChat.roomId,
        userId: user._id
      });
    }
    setActiveChat(null);
    setMessages([]);
    setNewMessage("");
    onClose();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <ChatSelector
            friendList={friendList}
            workspaceList={workspaceList}
            documentList={documentList}
            onSelectChat={handleSelectChat}
            activeChat={activeChat}
            loading={loading}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {activeChat.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-500">
                          {isConnected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    console.log(msg);
                    const isOwn = msg.from?._id === user._id || msg.from === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md px-4 py-2 rounded-2xl ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                        } ${msg.isSending ? 'opacity-70' : ''}`}>
                          
                          {!isOwn && activeChat.type !== 'user' && (
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {msg.user?.firstName || msg.user?.username}
                            </div>
                          )}
                          
                          <div className="text-sm">{msg.message}</div>
                          
                          <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {typingUsers.map(u => u.userName || 'Someone').join(', ')} typing...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (e.target.value.trim()) {
                        startTyping();
                      } else {
                        stopTyping();
                      }
                    }}
                    onBlur={stopTyping}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a friend, workspace, or document to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;