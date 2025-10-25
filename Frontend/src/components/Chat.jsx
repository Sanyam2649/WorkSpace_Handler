import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getFriendList, getChatHistory } from "../api";
import ChatSelector from "./chatSelector";
import { useSelector } from "react-redux";
import {
  X,
  Send,
  Smile,
  Mic,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  CheckCheck,
  MessageCircle,
  Loader2,
  Menu
} from "lucide-react";

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾'
];

const Chat = ({ isOpen, onClose, workspaceId, chatType = 'workspace' }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const user = useSelector((state) => state.user.value);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile when chat is active
      if (window.innerWidth < 768 && activeChat) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeChat]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-select workspace chat when provided
  useEffect(() => {
    if (workspaceId && workspaceList.length > 0) {
      const workspaceChat = workspaceList.find(w => w.workspaceId === workspaceId);
      if (workspaceChat) {
        handleSelectChat({
          type: 'workspace',
          roomId: workspaceId,
          otherUserId: null,
          name: workspaceChat.name,
          ...workspaceChat
        });
      }
    }
  }, [workspaceId, workspaceList]);

  // Socket connection
  useEffect(() => {
    if (!isOpen || !user) return;

    console.log("🔌 Attempting socket connection...");
    const sock = io(import.meta.env.VITE_APP_SOCKET_URL, {
      auth: {
        token: sessionStorage.getItem("accessToken")
      }
    });

    setSocket(sock);

    sock.on("connect", () => {
      console.log("✅ Socket connected successfully");
      setIsConnected(true);
    });

    sock.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    sock.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    sock.on("chat:message", (message) => {
      console.log("📨 New message received:", message);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isSending);
        if (filtered.some(msg => msg._id === message._id)) {
          console.log("🔄 Duplicate message detected, skipping");
          return filtered;
        }
        console.log("✅ Adding new message to state");
        return [...filtered, message];
      });
      scrollToBottom();
    });

    sock.on("chat:error", (error) => {
      console.error("❌ Chat error from server:", error);
      alert(`Chat error: ${error.msg}`);
    });

    return () => {
      console.log("🧹 Cleaning up socket connection");
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
      } catch (err) {
        console.error("Error loading chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [isOpen]);

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle voice message
  const handleVoiceMessage = () => {
    alert('Voice message functionality would be implemented here.');
  };

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

    // On mobile, close sidebar when chat is selected
    if (isMobile) {
      setSidebarOpen(false);
    }

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
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeChat) return;

    const messageData = {
      type: activeChat.type,
      roomId: activeChat.roomId,
      from: user._id,
      to: activeChat.otherUserId,
      message: newMessage.trim(),
    };

    // Optimistically add message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      ...messageData,
      from: user,
      createdAt: new Date(),
      isSending: true,
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    // Stop typing indicator
    stopTyping();

    // Send via socket
    socket.emit("chat:message", messageData);
  };

  // Render message content
  const renderMessageContent = (msg) => {
    return (
      <div className="space-y-2">
        {msg.message && (
          <div className="text-sm leading-relaxed break-words">{msg.message}</div>
        )}
      </div>
    );
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

  // Enhanced handleClose function
  const handleClose = () => {
    console.log("🔒 Closing chat...");
    
    // Leave current chat room if active
    if (socket && activeChat) {
      socket.emit("chat:leave", {
        type: activeChat.type,
        roomId: activeChat.roomId,
        userId: user._id
      });
      console.log(`🚪 Left chat room: ${activeChat.type}_${activeChat.roomId}`);
    }

    // Clean up socket connection
    if (socket) {
      socket.disconnect();
      setSocket(null);
      console.log("🔌 Socket disconnected");
    }

    // Reset all state
    setActiveChat(null);
    setMessages([]);
    setNewMessage("");
    setShowEmojiPicker(false);
    setTypingUsers([]);
    setIsConnected(false);

    // Call the parent's onClose function
    if (onClose) {
      console.log("📞 Calling parent onClose");
      onClose();
    } else {
      console.warn("⚠️ No onClose prop provided");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChatIcon = (type) => {
    switch (type) {
      case 'user': return <Users size={16} />;
      case 'workspace': return <Briefcase size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getChatColor = (type) => {
    switch (type) {
      case 'user': return 'from-primary to-secondary';
      case 'workspace': return 'from-accent to-info';
      default: return 'from-primary to-secondary';
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-gradient-to-br from-base-100 via-base-100 to-base-200 rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[95vh] flex overflow-hidden border border-base-300">

        {/* Sidebar with Slide Toggle */}
        <div className={`
          relative transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-full md:w-80 lg:w-96' : 'w-0'}
          flex flex-col bg-gradient-to-b from-base-100 to-base-200
          border-r border-base-300
        `}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 bg-primary text-primary-content p-1.5 rounded-full shadow-lg border border-base-300 hover:scale-110 transition-transform hidden md:block"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-4 sm:p-6 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Messages
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/70">
                      Connect with your team
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-base-300 rounded-xl transition-all duration-200 group md:hidden"
                      title="Close sidebar"
                    >
                      <ChevronLeft size={18} className="text-base-content group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-base-300 rounded-xl transition-all duration-200 group"
                      title="Close chat"
                    >
                      <X size={18} className="text-base-content group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-3 sm:mt-4 relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm sm:text-base text-base-content placeholder-base-content/50"
                  />
                </div>
              </div>

              {/* Chat Selector */}
              <div className="flex-1 overflow-y-auto">
                <ChatSelector
                  friendList={friendList}
                  workspaceList={workspaceList}
                  onSelectChat={handleSelectChat}
                  activeChat={activeChat}
                  loading={loading}
                  searchQuery={searchQuery}
                  defaultType={chatType}
                  onClose={handleClose}
                  isMobile={isMobile}
                />
              </div>
            </>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-base-300 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-base-100 to-base-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 hover:bg-base-300 rounded-xl transition-colors md:hidden"
                    >
                      <Menu size={18} />
                    </button>

                    <div className="relative">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${getChatColor(activeChat.type)} rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-content font-bold text-sm sm:text-lg shadow-lg`}>
                        {activeChat.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full border-2 border-base-100 ${isConnected ? 'bg-success' : 'bg-error'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base-content truncate text-sm sm:text-base">
                          {activeChat.name}
                        </h3>
                        {getChatIcon(activeChat.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs sm:text-sm ${isConnected ? 'text-success' : 'text-error'}`}>
                          {isConnected ? 'Online' : 'Connecting...'}
                        </div>
                        {activeChat.type === 'workspace' && (
                          <div className="text-xs text-base-content/50 hidden sm:block">
                            Workspace Chat
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Close Button - Always visible when chat is active */}
                  {/* <button
                    onClick={handleClose}
                    className="p-2 sm:p-3 hover:bg-error/10 rounded-xl transition-all duration-200 group text-error hover:text-error/80"
                    title="Close chat"
                  >
                    <X size={18} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  </button> */}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-base-100 to-base-200 custom-scrollbar">
                <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg) => {
                    const isOwn = msg.from?._id === user._id || msg.from === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`group relative max-w-xs sm:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${isOwn
                            ? 'bg-gradient-to-br from-primary to-secondary text-primary-content rounded-br-none sm:rounded-br-none shadow-lg'
                            : 'bg-base-300 text-base-content rounded-bl-none sm:rounded-bl-none border border-base-300 shadow-sm'
                          } ${msg.isSending ? 'opacity-70' : ''}`}>

                          {!isOwn && activeChat.type !== 'user' && (
                            <div className="text-xs sm:text-sm font-semibold text-base-content/80 mb-1 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full" />
                              {msg.user?.firstName || msg.user?.username || 'User'}
                            </div>
                          )}

                          {renderMessageContent(msg)}

                          <div className={`text-xs mt-1 sm:mt-2 flex items-center gap-1 ${isOwn ? 'text-primary-content/80' : 'text-base-content/60'
                            }`}>
                            {formatTime(msg.createdAt)}
                            {isOwn && !msg.isSending && (
                              <CheckCheck size={12} className="sm:w-3.5 sm:h-3.5 text-primary-content/80" />
                            )}
                          </div>

                          {/* Message status tooltip */}
                          {isOwn && (
                            <div className="absolute -top-6 sm:-top-8 right-0 bg-base-content text-base-100 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                              {msg.isSending ? 'Sending...' : 'Delivered'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-base-300 border border-base-300 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl rounded-bl-none sm:rounded-bl-none shadow-sm max-w-xs sm:max-w-md">
                        <div className="flex space-x-1 mb-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div className="text-xs text-base-content/60">
                          {typingUsers.map(u => u.userName || 'Someone').join(', ')} typing...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-base-300 bg-base-100 p-3 sm:p-4 lg:p-6">
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-end">
                  <div className="flex gap-1 sm:gap-2">
                    {/* Emoji Picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 sm:p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content"
                        title="Add emoji"
                      >
                        <Smile size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-xl shadow-2xl p-2 sm:p-3 w-48 sm:w-64 h-32 sm:h-48 overflow-y-auto z-50 custom-scrollbar">
                          <div className="grid grid-cols-6 sm:grid-cols-8 gap-0.5 sm:gap-1">
                            {EMOJIS.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleEmojiSelect(emoji)}
                                className="p-0.5 sm:p-1 hover:bg-base-300 rounded text-base sm:text-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 relative">
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
                      placeholder={`Message ${activeChat.name}...`}
                      disabled={!isConnected}
                      className="w-full bg-base-200 border border-base-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm sm:text-base text-base-content placeholder-base-content/50 disabled:bg-base-300 disabled:text-base-content/30 resize-none"
                    />
                  </div>

                  <div className="flex gap-1 sm:gap-2">
                    {/* Voice Message Button */}
                    <button 
                      type="button" 
                      onClick={handleVoiceMessage}
                      className="p-2 sm:p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content"
                      title="Voice message"
                    >
                      <Mic size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    
                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !isConnected}
                      className="p-2 sm:p-2.5 bg-gradient-to-br from-primary to-secondary text-primary-content rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      title="Send message"
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center text-base-content/60 relative">
              {/* Close button for empty state */}
              {/* <button
                onClick={handleClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 hover:bg-error/10 rounded-xl transition-all duration-200 group text-error hover:text-error/80"
                title="Close chat"
              >
                <X size={18} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
              </button> */}
              
              <div className="text-center max-w-md px-4 sm:px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-content">
                    <MessageCircle size={16} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 sm:mb-3">
                  Start a Conversation
                </h3>
                <p className="text-base-content/70 text-sm sm:text-base mb-4 sm:mb-6">
                  Choose a workspace or friend from the sidebar to start chatting.
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="bg-gradient-to-br from-primary to-secondary text-primary-content px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  Open Conversations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;