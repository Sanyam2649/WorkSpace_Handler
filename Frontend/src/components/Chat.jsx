import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getFriendList, getChatHistory } from "../api";
import ChatSelector from "./chatSelector";
import { useSelector } from "react-redux";
import {
  X,
  Send,
  Smile,
  Paperclip,
  Mic,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Briefcase,
  Circle,
  CheckCheck,
  MessageCircle,
  Image,
  File,
  Video,
  Music,
  XCircle,
  Download,
  Loader2
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

const Chat = ({ isOpen, onClose, workspaceId, documentId, chatType = 'workspace' }) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileUploadRef = useRef(null);
  const user = useSelector((state) => state.user.value);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (fileUploadRef.current && !fileUploadRef.current.contains(event.target)) {
        // Keep file upload open for better UX
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-select workspace or document chat when provided
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
    } else if (documentId && documentList.length > 0) {
      const documentChat = documentList.find(d => d.documentId === documentId);
      if (documentChat) {
        handleSelectChat({
          type: 'document',
          roomId: documentId,
          otherUserId: null,
          name: documentChat.title,
          ...documentChat
        });
      }
    }
  }, [workspaceId, documentId, workspaceList, documentList]);

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
        // Remove temporary messages and avoid duplicates
        const filtered = prev.filter(msg => !msg.isSending);
        if (filtered.some(msg => msg._id === message._id)) return filtered;
        return [...filtered, message];
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

  // File to Base64 conversion
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file upload and convert to base64 strings
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const filePromises = files.map(async (file) => {
        const base64String = await fileToBase64(file);
        
        return {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64String, // This is the string we'll send to backend
          isUploading: true
        };
      });

      const newFiles = await Promise.all(filePromises);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Simulate upload process
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(file => 
            newFiles.some(f => f.id === file.id) 
              ? { ...file, isUploading: false }
              : file
          )
        );
      }, 1000);

    } catch (error) {
      console.error('Error converting files to base64:', error);
      alert('Error processing files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image size={16} />;
    if (fileType.startsWith('video/')) return <Video size={16} />;
    if (fileType.startsWith('audio/')) return <Music size={16} />;
    return <File size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
    if (window.innerWidth < 768) {
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

  // Send message with files as base64 strings
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && uploadedFiles.length === 0) || !socket || !activeChat) return;

    const messageData = {
      type: activeChat.type,
      roomId: activeChat.roomId,
      from: user._id,
      to: activeChat.otherUserId,
      message: newMessage.trim(),
      files: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: file.base64 // Send as string to backend
      })) : undefined
    };

    // Optimistically add message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      ...messageData,
      from: user,
      createdAt: new Date(),
      isSending: true,
      files: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.base64 // Use base64 as preview URL temporarily
      })) : undefined
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setUploadedFiles([]);
    scrollToBottom();

    // Stop typing indicator
    stopTyping();

    // Send via socket
    socket.emit("chat:message", messageData);
  };

  // Render message content with file support
  const renderMessageContent = (msg) => {
    return (
      <div className="space-y-2">
        {msg.files && msg.files.length > 0 && (
          <div className="space-y-2">
            {msg.files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-base-content/60">{formatFileSize(file.size)}</div>
                </div>
                {file.url && (
                  <a 
                    href={file.url} 
                    download={file.name}
                    className="btn btn-ghost btn-xs"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {msg.message && (
          <div className="text-sm leading-relaxed">{msg.message}</div>
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
    setUploadedFiles([]);
    setShowEmojiPicker(false);
    onClose();
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
      case 'document': return <FileText size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getChatColor = (type) => {
    switch (type) {
      case 'user': return 'from-primary to-secondary';
      case 'workspace': return 'from-accent to-info';
      case 'document': return 'from-success to-warning';
      default: return 'from-primary to-secondary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-base-100 via-base-100 to-base-200 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden border border-base-300">

        {/* Sidebar with Slide Toggle */}
        <div className={`
          relative transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80 md:w-96' : 'w-0'}
          flex flex-col bg-gradient-to-b from-base-100 to-base-200
          border-r border-base-300
        `}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 bg-primary text-primary-content p-1.5 rounded-full shadow-lg border border-base-300 hover:scale-110 transition-transform"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-6 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Messages
                    </h2>
                    <p className="text-sm text-base-content/70">
                      Connect with your team
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-base-300 rounded-xl transition-all duration-200 group"
                  >
                    <X size={20} className="text-base-content group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-base-content placeholder-base-content/50"
                  />
                </div>
              </div>

              {/* Chat Selector */}
              <div className="flex-1 overflow-hidden">
                <ChatSelector
                  friendList={friendList}
                  workspaceList={workspaceList}
                  documentList={documentList}
                  onSelectChat={handleSelectChat}
                  activeChat={activeChat}
                  loading={loading}
                  searchQuery={searchQuery}
                  defaultType={chatType}
                  onClose={handleClose}
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
              <div className="border-b border-base-300 px-6 py-4 bg-gradient-to-r from-base-100 to-base-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="md:hidden p-2 hover:bg-base-300 rounded-xl transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="relative">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getChatColor(activeChat.type)} rounded-2xl flex items-center justify-center text-primary-content font-bold text-lg shadow-lg`}>
                        {activeChat.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-base-100 ${isConnected ? 'bg-success' : 'bg-error'
                        }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base-content truncate">
                          {activeChat.name}
                        </h3>
                        {getChatIcon(activeChat.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm ${isConnected ? 'text-success' : 'text-error'}`}>
                          {isConnected ? 'Online' : 'Connecting...'}
                        </div>
                        {activeChat.type === 'workspace' && (
                          <div className="text-xs text-base-content/50">
                            Workspace Chat
                          </div>
                        )}
                        {activeChat.type === 'document' && (
                          <div className="text-xs text-base-content/50">
                            Document Chat
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Close Button */}
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-base-300 rounded-xl transition-all duration-200 group md:hidden"
                  >
                    <X size={20} className="text-base-content group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-base-100 to-base-200 custom-scrollbar">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg) => {
                    const isOwn = msg.from?._id === user._id || msg.from === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`group relative max-w-md px-4 py-3 rounded-2xl ${isOwn
                            ? 'bg-gradient-to-br from-primary to-secondary text-primary-content rounded-br-none shadow-lg'
                            : 'bg-base-300 text-base-content rounded-bl-none border border-base-300 shadow-sm'
                          } ${msg.isSending ? 'opacity-70' : ''}`}>

                          {!isOwn && activeChat.type !== 'user' && (
                            <div className="text-sm font-semibold text-base-content/80 mb-1 flex items-center gap-2">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              {msg.user?.firstName || msg.user?.username || 'User'}
                            </div>
                          )}

                          {renderMessageContent(msg)}

                          <div className={`text-xs mt-2 flex items-center gap-1 ${isOwn ? 'text-primary-content/80' : 'text-base-content/60'
                            }`}>
                            {formatTime(msg.createdAt)}
                            {isOwn && !msg.isSending && (
                              <CheckCheck size={14} className="text-primary-content/80" />
                            )}
                          </div>

                          {/* Message status tooltip */}
                          {isOwn && (
                            <div className="absolute -top-8 right-0 bg-base-content text-base-100 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
                      <div className="bg-base-300 border border-base-300 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                        <div className="flex space-x-1 mb-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="border-t border-base-300 bg-base-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-base-content">Files to send:</span>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-xs text-error hover:text-error/80"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-2 bg-base-100 rounded-lg border border-base-300">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {file.isUploading ? (
                            <Loader2 size={16} className="animate-spin text-primary" />
                          ) : (
                            getFileIcon(file.type)
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-base-content/60">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUploadedFile(file.id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          disabled={file.isUploading}
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t border-base-300 bg-base-100 p-6">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                  <div className="flex gap-2">
                    {/* File Upload */}
                    <div className="relative" ref={fileUploadRef}>
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-input').click()}
                        disabled={uploading}
                        className="p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content disabled:opacity-50"
                        title="Attach files"
                      >
                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                      </button>
                      <input
                        id="file-input"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                    </div>

                    {/* Emoji Picker */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content"
                        title="Add emoji"
                      >
                        <Smile size={20} />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-xl shadow-2xl p-3 w-64 h-48 overflow-y-auto z-50 custom-scrollbar">
                          <div className="grid grid-cols-8 gap-1">
                            {EMOJIS.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleEmojiSelect(emoji)}
                                className="p-1 hover:bg-base-300 rounded text-lg transition-colors"
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
                      className="w-full bg-base-200 border border-base-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-base-content placeholder-base-content/50 disabled:bg-base-300 disabled:text-base-content/30 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    {/* Voice Message Button */}
                    <button 
                      type="button" 
                      onClick={handleVoiceMessage}
                      className="p-2.5 hover:bg-base-300 rounded-xl transition-colors text-base-content/70 hover:text-base-content"
                      title="Voice message"
                    >
                      <Mic size={20} />
                    </button>
                    
                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && uploadedFiles.length === 0) || !isConnected || uploading}
                      className="p-2.5 bg-gradient-to-br from-primary to-secondary text-primary-content rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      title="Send message"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center text-base-content/60">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-primary-content">
                    <MessageCircle size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                  Start a Conversation
                </h3>
                <p className="text-base-content/70 mb-6">
                  Choose a workspace or document from the sidebar to begin collaborating with your team.
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="bg-gradient-to-br from-primary to-secondary text-primary-content px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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