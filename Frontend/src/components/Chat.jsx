import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { getFriendList, getChatHistory, chatSettings } from "../api";
import ChatSelector from "./chatSelector";
import ChatSettingsModal from "../subComponent/chatSettings";
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
  Menu,
  Settings
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

// Memoized message component to prevent re-renders
const MessageItem = React.memo(({ msg, isOwn, user, activeChat, formatTime }) => {
  const renderMessageContent = useCallback((message) => {
    return (
      <div className="space-y-2">
        {message.message && (
          <div className="text-sm leading-relaxed break-words">{message.message}</div>
        )}
      </div>
    );
  }, []);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`group relative max-w-xs sm:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
        isOwn
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

        <div className={`text-xs mt-1 sm:mt-2 flex items-center gap-1 ${
          isOwn ? 'text-primary-content/80' : 'text-base-content/60'
        }`}>
          {formatTime(msg.createdAt)}
          {isOwn && !msg.isSending && (
            <CheckCheck size={12} className="sm:w-3.5 sm:h-3.5 text-primary-content/80" />
          )}
          {msg.isSending && (
            <span className="text-xs">Sending...</span>
          )}
        </div>

        {isOwn && (
          <div className="absolute -top-6 sm:-top-8 right-0 bg-base-content text-base-100 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            {msg.isSending ? 'Sending...' : 'Delivered'}
          </div>
        )}
      </div>
    </div>
  );
});

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chatPolicy, setChatPolicy] = useState("all");
  const [socketLoading, setSocketLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const socketRef = useRef(null);
  const user = useSelector((state) => state.user.value);

  // Debug: Log state changes
  useEffect(() => {
    console.log("💬 Messages state updated:", messages.length, "messages");
  }, [messages]);

  useEffect(() => {
    console.log("🔌 Socket connection state:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    console.log("🎯 Active chat:", activeChat);
  }, [activeChat]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen || !user) return;

    console.log("🔌 Initializing socket connection...");
    
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const sock = io(import.meta.env.VITE_APP_SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: sessionStorage.getItem("accessToken")
      }
    });

    socketRef.current = sock;
    setSocket(sock);

    sock.on("connect", () => {
      console.log("✅ Socket connected successfully");
      setIsConnected(true);
      setSocketLoading(false);
    });

    sock.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setSocketLoading(false);
    });

    sock.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error);
      setIsConnected(false);
      setSocketLoading(false);
    });

    // Enhanced message handling
    sock.on("chat:message", (message) => {
      console.log("📨 New message received from server:", message);
      
      setMessages(prev => {
        // Check if message already exists (by ID or by content for temp messages)
        const messageExists = prev.some(msg => 
          msg._id === message._id || 
          (msg.isSending && msg.message === message.message && msg.from?._id === message.from?._id)
        );
        
        if (messageExists) {
          console.log("🔄 Message already exists, replacing temp message");
          // Replace temporary message with real one
          return prev.map(msg => 
            (msg.isSending && msg.message === message.message && msg.from?._id === message.from?._id) 
              ? { ...message, isSending: false }
              : msg
          );
        } else {
          console.log("✅ Adding new message to state");
          return [...prev, { ...message, isSending: false }];
        }
      });
      
      scrollToBottom();
    });

    sock.on("chat:typing", (data) => {
      console.log("⌨️ Typing event:", data);
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    sock.on("chat:error", (error) => {
      console.error("❌ Chat error from server:", error);
      alert(`Chat error: ${error.msg}`);
    });

    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [isOpen, user, scrollToBottom]);

  // Load chat data only once when opening
  useEffect(() => {
    let mounted = true;
    
    const loadChatData = async () => {
      if (!isOpen || friendList.length > 0) return;

      try {
        setLoading(true);
        const data = await getFriendList();
        if (mounted) {
          setFriendList(data.friendList || []);
          setWorkspaceList(data.workspaceList || []);
        }
      } catch (err) {
        console.error("Error loading chat data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChatData();

    return () => {
      mounted = false;
    };
  }, [isOpen, friendList.length]);

  // Auto-select workspace chat when provided
  useEffect(() => {
    if (workspaceId && workspaceList.length > 0 && !activeChat) {
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
  }, [workspaceId, workspaceList, activeChat]);

  const verifyChatPermissions = useCallback(async (chat) => {
    if (!chat) return;

    if (chat.type === 'workspace') {
      const userRole = chat.userRole;
      
      switch (chatPolicy) {
        case 'admin-only':
          if (userRole !== 'admin') {
            throw new Error('Only admins can send messages in this workspace');
          }
          break;
        case 'admin-editor':
          if (!['admin', 'editor'].includes(userRole)) {
            throw new Error('Only admins and editors can send messages in this workspace');
          }
          break;
        case 'all':
          break;
        default:
          break;
      }
    }
    return true;
  }, [chatPolicy]);

  const handleSettingsUpdate = useCallback(async (settingsData) => {
    try {
      const response = await chatSettings(settingsData);
      setChatPolicy(settingsData.settings.policy);
      
      if (activeChat) {
        setActiveChat(prev => ({
          ...prev,
          settings: settingsData.settings
        }));
      }
      
      return response;
    } catch (error) {
      console.error("Failed to update chat settings:", error);
      throw error;
    }
  }, [activeChat]);

  const handleEmojiSelect = useCallback((emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleVoiceMessage = useCallback(() => {
    alert('Voice message functionality would be implemented here.');
  }, []);

  // Enhanced chat selection with proper socket room management
  const handleSelectChat = useCallback(async (chat) => {
    if (!socketRef.current || !isConnected) {
      alert("Socket not connected. Please wait...");
      return;
    }

    console.log("🎯 Selecting chat:", chat);

    // Leave previous chat room if exists
    if (activeChat) {
      socketRef.current.emit("chat:leave", {
        type: activeChat.type,
        roomId: activeChat.roomId,
        userId: user._id
      });
      console.log(`🚪 Left previous chat: ${activeChat.type}_${activeChat.roomId}`);
    }

    try {
      await verifyChatPermissions(chat);
      
      setActiveChat(chat);
      setMessages([]);
      setSocketLoading(true);

      if (chat.settings?.policy) {
        setChatPolicy(chat.settings.policy);
      }

      // Join new chat room
      socketRef.current.emit("chat:join", {
        type: chat.type,
        roomId: chat.roomId,
        userId: user._id,
        policy: chat.settings?.policy || 'all'
      });
      console.log(`🎉 Joined chat: ${chat.type}_${chat.roomId}`);

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
        console.log("📚 Loaded chat history:", history.messages?.length, "messages");
        setMessages(history.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setSocketLoading(false);
      }
    } catch (error) {
      console.error("Permission denied:", error.message);
      alert(error.message);
      setSocketLoading(false);
    }
  }, [activeChat, isConnected, user, verifyChatPermissions, isMobile, scrollToBottom]);

  // Enhanced send message with proper optimistic updates
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socketRef.current || !activeChat || !isConnected) {
      console.log("❌ Cannot send message:", { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socketRef.current,
        hasActiveChat: !!activeChat,
        isConnected 
      });
      return;
    }

    const messageText = newMessage.trim();
    console.log("🚀 Sending message:", messageText);

    try {
      await verifyChatPermissions(activeChat);

      // Create optimistic message with unique ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage = {
        _id: tempId,
        type: activeChat.type,
        roomId: activeChat.roomId,
        from: user,
        to: activeChat.otherUserId,
        message: messageText,
        createdAt: new Date(),
        isSending: true,
      };

      console.log("📝 Adding optimistic message:", tempMessage);

      // Add optimistic message immediately
      setMessages(prev => {
        const newMessages = [...prev, tempMessage];
        console.log("📦 Messages after optimistic update:", newMessages.length);
        return newMessages;
      });
      
      setNewMessage("");
      scrollToBottom();

      // Stop typing indicator
      stopTyping();

      // Prepare message data for socket
      const messageData = {
        type: activeChat.type,
        roomId: activeChat.roomId,
        from: user._id,
        to: activeChat.otherUserId,
        message: messageText,
        tempId: tempId, // Send temp ID for reference
      };

      console.log("📤 Emitting message via socket:", messageData);
      
      // Send via socket
      socketRef.current.emit("chat:message", messageData);

    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("Failed to send message: " + error.message);
      // Restore message if failed
      setNewMessage(messageText);
    }
  }, [newMessage, activeChat, isConnected, user, verifyChatPermissions, scrollToBottom]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socketRef.current || !activeChat || !isConnected) return;

    socketRef.current.emit("chat:typing", {
      type: activeChat.type,
      roomId: activeChat.roomId,
      userId: user._id,
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [activeChat, isConnected, user]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !activeChat || !isConnected) return;

    socketRef.current.emit("chat:typing", {
      type: activeChat.type,
      roomId: activeChat.roomId,
      userId: user._id,
      isTyping: false
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [activeChat, isConnected, user]);

  // Enhanced handleClose function
  const handleClose = useCallback(() => {
    console.log("🔒 Closing chat...");
    
    // Leave current chat room if active
    if (socketRef.current && activeChat && isConnected) {
      socketRef.current.emit("chat:leave", {
        type: activeChat.type,
        roomId: activeChat.roomId,
        userId: user._id
      });
      console.log(`🚪 Left chat room: ${activeChat.type}_${activeChat.roomId}`);
    }

    // Clean up socket connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      console.log("🔌 Socket disconnected");
    }

    // Clean up timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset all state
    setActiveChat(null);
    setMessages([]);
    setNewMessage("");
    setShowEmojiPicker(false);
    setTypingUsers([]);
    setIsConnected(false);
    setShowSettingsModal(false);
    setChatPolicy("all");
    setSocketLoading(false);

    // Call the parent's onClose function
    if (onClose) {
      console.log("📞 Calling parent onClose");
      onClose();
    } else {
      console.warn("⚠️ No onClose prop provided");
    }
  }, [activeChat, isConnected, user, onClose]);

  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getChatIcon = useCallback((type) => {
    switch (type) {
      case 'user': return <Users size={16} />;
      case 'workspace': return <Briefcase size={16} />;
      default: return <MessageCircle size={16} />;
    }
  }, []);

  const getChatColor = useCallback((type) => {
    switch (type) {
      case 'user': return 'from-primary to-secondary';
      case 'workspace': return 'from-accent to-info';
      default: return 'from-primary to-secondary';
    }
  }, []);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
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
                    socket={socketRef.current}
                    currentUser={user}
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
                              {chatPolicy === 'admin-only' && 'Admin Only'}
                              {chatPolicy === 'admin-editor' && 'Admins & Editors'}
                              {chatPolicy === 'all' && 'All Members'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(activeChat.type === 'workspace' || activeChat.type === 'document') && (
                        <button
                          onClick={() => setShowSettingsModal(true)}
                          className="p-2 sm:p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content"
                          title="Chat settings"
                        >
                          <Settings size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-base-100 to-base-200 custom-scrollbar">
                  {socketLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
                        <p className="text-base-content/60">Loading chat...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                      {messages.map((msg) => (
                        <MessageItem
                          key={msg._id}
                          msg={msg}
                          isOwn={msg.from?._id === user._id || msg.from === user._id}
                          user={user}
                          activeChat={activeChat}
                          formatTime={formatTime}
                        />
                      ))}

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
                  )}
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
                        disabled={!isConnected || socketLoading}
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
                        disabled={!newMessage.trim() || !isConnected || socketLoading}
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
                    {isConnected ? 
                      "Choose a workspace or friend from the sidebar to start chatting." :
                      "Connecting to chat server..."
                    }
                  </p>
                  {isConnected ? (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="bg-gradient-to-br from-primary to-secondary text-primary-content px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                    >
                      Open Conversations
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        activeChat={activeChat}
        onSettingsUpdate={handleSettingsUpdate}
        currentSettings={activeChat?.settings || { policy: chatPolicy }}
      />
    </>
  );
};

export default React.memo(Chat);