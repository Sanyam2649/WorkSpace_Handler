import React, { useState, useEffect, useRef } from "react";
import { acceptInvite, rejectInvite, searchMembers, sendFriendRequest } from "../api";
import { useSelector } from "react-redux";

const ChatSelector = ({ 
  friendList, 
  workspaceList, 
  documentList, 
  onSelectChat, 
  activeChat, 
  loading,
  socket,
  currentUser 
}) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const searchTimeoutRef = useRef(null);
  const user = useSelector((state) => state.user.value);
  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('friend_request_sent', () => {
      if (window.refreshFriendList) {
        window.refreshFriendList();
      }
    });

    socket.on('friend_request_accepted', () => {
      if (window.refreshFriendList) {
        window.refreshFriendList();
      }
    });

    socket.on('friend_request_rejected', () => {
      if (window.refreshFriendList) {
        window.refreshFriendList();
      }
    });

    socket.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(new Set(users));
    });

    socket.emit('get_online_users');

    return () => {
      socket.off('friend_request_sent');
      socket.off('friend_request_accepted');
      socket.off('friend_request_rejected');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('online_users');
    };
  }, [socket]);

  // Search function
  const handleGlobalSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await searchMembers(query);
      setSearchResults(response || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Friend request handlers
  const handleSendFriendRequest = async (userId) => {
    try {
      setPendingRequests(prev => ({ ...prev, [userId]: 'pending' }));
      await sendFriendRequest(userId);
      
      if (socket) {
        socket.emit('friend_request', {
          to: userId,
          from: currentUser?.id,
          timestamp: new Date().toISOString()
        });
      }
      
      setPendingRequests(prev => ({ ...prev, [userId]: 'sent' }));
    } catch (error) {
      console.error("Failed to send friend request:", error);
      setPendingRequests(prev => ({ ...prev, [userId]: 'error' }));
      
      setTimeout(() => {
        setPendingRequests(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }, 3000);
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      await acceptInvite(friendId);
      
      if (socket) {
        socket.emit('friend_request_accepted', {
          friendId: friendId,
          userId: currentUser?.id,
          timestamp: new Date().toISOString()
        });
      }
      
      if (window.refreshFriendList) {
        window.refreshFriendList();
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleRejectRequest = async (friendId) => {
    try {
      await rejectInvite(friendId);
      
      if (socket) {
        socket.emit('friend_request_rejected', {
          friendId: friendId,
          userId: currentUser?.id,
          timestamp: new Date().toISOString()
        });
      }
      
      if (window.refreshFriendList) {
        window.refreshFriendList();
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  // Get friend status based on your data structure
  const getFriendStatus = (friend) => {
    if (friend.isConnected) return 'connected';
    if (friend.isInvited) return 'sent';
    if (friend.getInvite) return 'received';
    if (friend.rejectInvite) return 'rejected';
    return 'none';
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const handleChatSelect = (type, roomId, otherUserId = null, name = null) => {
    if (!roomId || roomId === "undefined") return;
    
    onSelectChat({
      type,
      roomId,
      otherUserId,
      name: name || `Chat with ${type}`
    });
  };

  // Filter lists based on search
  const getFilteredList = (list) => {
    if (!list) return [];
    return list.filter(item => {
      const searchableText = (item.name || item.title || '').toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  };

  // Render search result item
  const renderSearchResultItem = (member) => {
    const existingFriend = friendList?.find(friend => 
      friend.friendId === member._id
    );
    
    const friendStatus = existingFriend ? getFriendStatus(existingFriend) : 'none';
    const requestStatus = pendingRequests[member._id];
    const isOnline = isUserOnline(member._id);

    const requestSent = existingFriend?.isInvited || requestStatus === 'sent';
    const requestReceived = existingFriend?.getInvite;
    const isConnected = existingFriend?.isConnected;

    return (
      <div className="p-3 rounded-lg border border-gray-200 mb-2 bg-white hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={member?.avatar?.url || "/default-avatar.png"}
                alt={member?.firstName || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {member.username || member.firstName || 'Unknown User'}
                </h4>
                {isOnline && (
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Online</span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{member.email}</p>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            {isConnected ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg whitespace-nowrap">
                Friends
              </span>
            ) : requestReceived ? (
              <div className="flex gap-1">
                <button
                  onClick={() => handleAcceptRequest(member._id)}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(member._id)}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            ) : requestSent ? (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg whitespace-nowrap">
                Request Sent
              </span>
            ) : requestStatus === 'pending' ? (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-lg whitespace-nowrap">
                Sending...
              </span>
            ) : requestStatus === 'error' ? (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg whitespace-nowrap">
                Failed
              </span>
            ) : (
              <button
                onClick={() => handleSendFriendRequest(member._id)}
                disabled={requestStatus === 'pending'}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors whitespace-nowrap"
              >
                Add Friend
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render friend item
  const renderFriendItem = (friend) => {
    const friendId = friend.friendId;
    const roomId = user._id;
    const isActive = activeChat?.roomId === roomId;
    const status = getFriendStatus(friend);
    const canChat = status === 'connected';
    const isOnline = isUserOnline(friendId);

    return (
      <div
        key={roomId}
        className={`p-3 rounded-lg transition-all ${
          isActive
            ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
            : 'border border-transparent hover:bg-gray-50 hover:shadow-sm'
        } ${canChat ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
        onClick={() => {
          if (!roomId || !canChat) return;
          handleChatSelect('user', roomId, friendId, friend.name);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
              isActive ? 'bg-blue-600' : 
              status === 'connected' ? 'bg-green-500' :
              status === 'received' ? 'bg-yellow-500' :
              status === 'sent' ? 'bg-blue-400' : 'bg-gray-400'
            }`}>
              {friend.avatar?.url ? (
                <img 
                  src={friend.avatar.url} 
                  alt={friend.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                friend.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            {isOnline && canChat && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className={`font-medium truncate ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {friend.name}
                  {status === 'sent' && " (Request Sent)"}
                  {status === 'received' && " (Pending)"}
                </h4>
                {isOnline && canChat && (
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Online</span>
                )}
              </div>
              {status === 'received' && (
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptRequest(friendId);
                    }}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectRequest(friendId);
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            <p className={`text-sm truncate ${
              isActive ? 'text-blue-700' : 'text-gray-500'
            }`}>
              {friend.email || 
                (status === 'connected' ? 
                  (isOnline ? 'Online - Click to chat' : 'Offline - Click to chat') : 
                 status === 'sent' ? 'Friend request sent' : 
                 status === 'received' ? 'Wants to be friends' : 
                 'Unknown status')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render workspace item
  const renderWorkspaceItem = (workspace) => {
    const roomId = workspace.workspaceId;
    const isActive = activeChat?.roomId === roomId;
    const onlineMembers = workspace.members?.filter(member => 
      isUserOnline(member.userId)
    ).length || 0;

    return (
      <div
        key={roomId}
        className={`p-3 rounded-lg cursor-pointer transition-all ${
          isActive
            ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
            : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
        }`}
        onClick={() => handleChatSelect('workspace', roomId, null, workspace.name)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
            isActive ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            {workspace.name?.charAt(0)?.toUpperCase() || 'W'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium truncate ${
              isActive ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {workspace.name}
            </h4>
            <p className={`text-sm truncate ${
              isActive ? 'text-blue-700' : 'text-gray-500'
            }`}>
              {workspace.members?.length || 0} members • {onlineMembers} online
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render document item
  const renderDocumentItem = (document) => {
    const roomId = document.documentId;
    const isActive = activeChat?.roomId === roomId;

    return (
      <div
        key={roomId}
        className={`p-3 rounded-lg cursor-pointer transition-all ${
          isActive
            ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
            : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
        }`}
        onClick={() => handleChatSelect('document', roomId, null, document.title)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
            isActive ? 'bg-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            {document.title?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium truncate ${
              isActive ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {document.title}
            </h4>
            <p className={`text-sm truncate ${
              isActive ? 'text-blue-700' : 'text-gray-500'
            }`}>
              Document collaboration chat
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Main list renderer
  const renderList = () => {
    if (searchTerm) {
      if (searchLoading) {
        return (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      }

      if (searchResults.length > 0) {
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Search Results ({searchResults.length})
            </h3>
            <div className="space-y-2">
              {searchResults.map(member => renderSearchResultItem(member))}
            </div>
          </div>
        );
      }

      return (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          No users found for "{searchTerm}"
        </div>
      );
    }

    // Normal tab view
    let list = [];
    let emptyMessage = "";
    let emptyIcon = "";

    switch (activeTab) {
      case "friends":
        list = getFilteredList(friendList || []);
        emptyMessage = "No friends found";
        emptyIcon = "👥";
        break;
      case "workspaces":
        list = getFilteredList(workspaceList || []);
        emptyMessage = "No workspaces found";
        emptyIcon = "💼";
        break;
      case "documents":
        list = getFilteredList(documentList || []);
        emptyMessage = "No documents found";
        emptyIcon = "📄";
        break;
      default:
        return null;
    }

    if (loading) {
      return (
        <div className="space-y-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">{emptyIcon}</div>
          <p className="text-lg font-medium mb-2">{emptyMessage}</p>
          {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1 p-2">
        {list.map((item) => {
          switch (activeTab) {
            case "friends":
              return renderFriendItem(item);
            case "workspaces":
              return renderWorkspaceItem(item);
            case "documents":
              return renderDocumentItem(item);
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleGlobalSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search friends, workspaces, documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Tabs - Responsive */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex">
          {[
            { id: 'friends', label: 'Friends', count: friendList?.length || 0, icon: '👥' },
            { id: 'workspaces', label: 'Workspaces', count: workspaceList?.length || 0, icon: '💼' },
            { id: 'documents', label: 'Documents', count: documentList?.length || 0, icon: '📄' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 px-1">
                <span className="text-base">{tab.icon}</span>
                <span className="hidden xs:inline">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {renderList()}
      </div>
    </div>
  );
};

export default ChatSelector;