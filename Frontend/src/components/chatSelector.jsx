import React, { useState, useEffect, useRef } from "react";
import { acceptInvite, rejectInvite, searchMembers, sendFriendRequest } from "../api";
import {
  Users,
  Briefcase,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  UserPlus,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const ChatSelector = ({
  friendList,
  workspaceList,
  documentList,
  onSelectChat,
  activeChat,
  loading,
  searchQuery,
  defaultType = 'workspace',
  socket,
  currentUser,
  isMobile = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    workspaces: defaultType === 'workspace',
    documents: defaultType === 'document',
    friends: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const searchTimeoutRef = useRef(null);

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterItems = (items, query) => {
    if (!query) return items;
    return items.filter(item =>
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredFriends = filterItems(friendList || [], searchQuery);
  const filteredWorkspaces = filterItems(workspaceList || [], searchQuery);
  const filteredDocuments = filterItems(documentList || [], searchQuery);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleGlobalSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fixed color mapping function
  const getSectionColor = (color) => {
    switch (color) {
      case 'primary': return 'from-primary to-secondary';
      case 'success': return 'from-success to-warning';
      case 'accent': return 'from-accent to-info';
      default: return 'from-primary to-secondary';
    }
  };

  const getTextColor = (color) => {
    switch (color) {
      case 'primary': return 'text-primary-content';
      case 'success': return 'text-success-content';
      case 'accent': return 'text-accent-content';
      default: return 'text-primary-content';
    }
  };

  const ChatSection = ({
    title,
    items,
    type,
    icon,
    sectionKey,
    emptyMessage,
    color = 'primary'
  }) => (
    <div className="mb-3 sm:mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-base-300 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${getSectionColor(color)} ${getTextColor(color)}`}>
            {React.cloneElement(icon, { size: isMobile ? 16 : 18 })}
          </div>
          <div className="text-left">
            <span className="font-semibold text-base-content block text-sm sm:text-base">{title}</span>
            <span className="text-xs text-base-content/60">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
        {expandedSections[sectionKey] ?
          <ChevronUp size={isMobile ? 14 : 16} className="text-base-content/60" /> :
          <ChevronDown size={isMobile ? 14 : 16} className="text-base-content/60" />
        }
      </button>

      {expandedSections[sectionKey] && (
        <div className="mt-2 space-y-2 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
          {items.length > 0 ? (
            items.map((item) => {
              if (type === 'user') {
                return renderFriendItem(item);
              } else if (type === 'workspace') {
                return renderWorkspaceItem(item);
              } else if (type === 'document') {
                return renderDocumentItem(item);
              }
              return null;
            })
          ) : (
            <div className="text-center py-4 sm:py-6 text-base-content/50">
              <MessageCircle size={isMobile ? 24 : 32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render workspace item
  const renderWorkspaceItem = (workspace) => {
    const roomId = workspace.workspaceId;
    const isActive = activeChat?.roomId === roomId && activeChat?.type === 'workspace';
    const onlineMembers = workspace.members?.filter(member =>
      isUserOnline(member.userId)
    ).length || 0;

    return (
      <div
        key={roomId}
        className={`p-2 sm:p-3 mx-1 sm:mx-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 group ${isActive
            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg'
            : 'hover:bg-base-300 border-2 border-transparent hover:border-base-300'
          }`}
        onClick={() => onSelectChat({
          type: 'workspace',
          roomId: workspace.workspaceId,
          otherUserId: null,
          name: workspace.name,
          ...workspace
        })}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-primary-content font-semibold text-sm sm:text-lg flex-shrink-0 ${isActive
              ? 'bg-gradient-to-br from-primary to-secondary shadow-lg'
              : 'bg-gradient-to-br from-accent to-info group-hover:shadow-lg'
            }`}>
            <Briefcase size={isMobile ? 14 : 16} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold truncate text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-base-content'
              }`}>
              {workspace.name}
            </h4>
            <p className={`text-xs truncate ${isActive ? 'text-primary/80' : 'text-base-content/60'
              }`}>
              {workspace.members?.length || 0} members • {onlineMembers} online
            </p>
          </div>
          {isActive && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
          )}
        </div>
      </div>
    );
  };

  // Render document item
  const renderDocumentItem = (document) => {
    const roomId = document.documentId;
    const isActive = activeChat?.roomId === roomId && activeChat?.type === 'document';
    const latestVersion = document.versions?.[document.versions.length - 1];

    return (
      <div
        key={roomId}
        className={`p-2 sm:p-3 mx-1 sm:mx-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 group ${isActive
            ? 'bg-gradient-to-r from-success/20 to-warning/20 border-2 border-success/30 shadow-lg'
            : 'hover:bg-base-300 border-2 border-transparent hover:border-base-300'
          }`}
        onClick={() => onSelectChat({
          type: 'document',
          roomId: document.documentId,
          otherUserId: null,
          name: document.title,
          ...document
        })}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-primary-content font-semibold text-sm sm:text-lg flex-shrink-0 ${isActive
              ? 'bg-gradient-to-br from-success to-warning shadow-lg'
              : 'bg-gradient-to-br from-success/80 to-warning/80 group-hover:shadow-lg'
            }`}>
            <FileText size={isMobile ? 14 : 16} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold truncate text-xs sm:text-sm ${isActive ? 'text-success' : 'text-base-content'
              }`}>
              {document.title}
            </h4>
            <p className={`text-xs truncate ${isActive ? 'text-success/80' : 'text-base-content/60'
              }`}>
              v{document.versions?.length || 1} • {latestVersion ? 'Recently updated' : 'New document'}
            </p>
          </div>
          {isActive && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full flex-shrink-0"></div>
          )}
        </div>
      </div>
    );
  };

  // Render friend item with full functionality
  const renderFriendItem = (friend) => {
    const friendId = friend.friendId;
    const roomId = friendId;
    const isActive = activeChat?.roomId === roomId && activeChat?.type === 'user';
    const status = getFriendStatus(friend);
    const canChat = status === 'connected';
    const isOnline = isUserOnline(friendId);

    return (
      <div
        key={roomId}
        className={`p-2 sm:p-3 mx-1 sm:mx-2 rounded-lg sm:rounded-xl transition-all duration-200 group ${canChat ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
          } ${isActive
            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg'
            : 'hover:bg-base-300 border-2 border-transparent hover:border-base-300'
          }`}
        onClick={() => {
          if (!canChat) return;
          onSelectChat({
            type: 'user',
            roomId: friendId,
            otherUserId: friendId,
            name: friend.name,
            ...friend
          });
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-primary-content font-semibold text-sm sm:text-lg ${isActive
                ? 'bg-gradient-to-br from-primary to-secondary shadow-lg'
                : 'bg-gradient-to-br from-primary/80 to-secondary/80 group-hover:shadow-lg'
              }`}>
              {friend.avatar?.url ? (
                <img
                  src={friend.avatar.url}
                  alt={friend.name}
                  className="w-full h-full rounded-lg sm:rounded-xl object-cover"
                />
              ) : (
                <Users size={isMobile ? 14 : 16} className="sm:w-5 sm:h-5" />
              )}
            </div>
            {isOnline && canChat && (
              <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-success border-2 border-base-100 rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`font-semibold truncate text-xs sm:text-sm ${isActive ? 'text-primary' : 'text-base-content'
                }`}>
                {friend.name}
                {status === 'sent' && " (Request Sent)"}
                {status === 'received' && " (Pending)"}
              </h4>
              {isOnline && canChat && (
                <span className="text-xs text-success font-medium flex-shrink-0 hidden sm:inline">Online</span>
              )}
            </div>

            <p className={`text-xs truncate ${isActive ? 'text-primary/80' : 'text-base-content/60'
              }`}>
              {friend.email ||
                (status === 'connected' ?
                  (isOnline ? 'Online - Click to chat' : 'Offline - Click to chat') :
                  status === 'sent' ? 'Friend request sent' :
                    status === 'received' ? 'Wants to be friends' :
                      'Unknown status')}
            </p>
          </div>

          {/* Action buttons for friend requests */}
          {status === 'received' && (
            <div className="flex gap-1 flex-shrink-0 ml-1 sm:ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptRequest(friendId);
                }}
                className="p-1 sm:p-1.5 bg-success text-success-content rounded-lg hover:bg-success/90 transition-colors"
                title="Accept friend request"
              >
                <CheckCircle size={isMobile ? 12 : 14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectRequest(friendId);
                }}
                className="p-1 sm:p-1.5 bg-error text-error-content rounded-lg hover:bg-error/90 transition-colors"
                title="Reject friend request"
              >
                <XCircle size={isMobile ? 12 : 14} />
              </button>
            </div>
          )}

          {isActive && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
          )}
        </div>
      </div>
    );
  };

  // Render search result item
  const renderSearchResultItem = (member) => {
    const existingFriend = friendList?.find(friend =>
      friend.friendId === member._id
    );
    const requestStatus = pendingRequests[member._id];
    const isOnline = isUserOnline(member._id);

    const requestSent = existingFriend?.isInvited || requestStatus === 'sent';
    const requestReceived = existingFriend?.getInvite;
    const isConnected = existingFriend?.isConnected;

    return (
      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-base-300 mb-2 bg-base-100 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center text-primary-content font-semibold">
                {member.avatar?.url ? (
                  <img
                    src={member.avatar.url}
                    alt={member.firstName || "User"}
                    className="w-full h-full rounded-lg sm:rounded-xl object-cover"
                  />
                ) : (
                  member.firstName?.[0] || member.username?.[0] || 'U'
                )}
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-success border-2 border-base-100 rounded-full" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <h4 className="font-semibold text-base-content truncate text-xs sm:text-sm">
                  {member.firstName} {member.lastName}
                </h4>
                {isOnline && (
                  <span className="text-xs text-success font-medium flex-shrink-0 hidden sm:inline">Online</span>
                )}
              </div>
              <p className="text-xs text-base-content/60 truncate">
                @{member.username} • {member.email}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 ml-1 sm:ml-2">
            {isConnected ? (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-success text-success-content rounded-lg whitespace-nowrap">
                Friends
              </span>
            ) : requestReceived ? (
              <div className="flex gap-0.5 sm:gap-1">
                <button
                  onClick={() => handleAcceptRequest(member._id)}
                  className="p-1 sm:p-1.5 bg-success text-success-content rounded-lg hover:bg-success/90 transition-colors"
                  title="Accept friend request"
                >
                  <CheckCircle size={isMobile ? 12 : 14} />
                </button>
                <button
                  onClick={() => handleRejectRequest(member._id)}
                  className="p-1 sm:p-1.5 bg-error text-error-content rounded-lg hover:bg-error/90 transition-colors"
                  title="Reject friend request"
                >
                  <XCircle size={isMobile ? 12 : 14} />
                </button>
              </div>
            ) : requestSent ? (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-primary text-primary-content rounded-lg whitespace-nowrap">
                Request Sent
              </span>
            ) : requestStatus === 'pending' ? (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-base-300 text-base-content rounded-lg whitespace-nowrap">
                Sending...
              </span>
            ) : requestStatus === 'error' ? (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-error text-error-content rounded-lg whitespace-nowrap">
                Failed
              </span>
            ) : (
              <button
                onClick={() => handleSendFriendRequest(member._id)}
                disabled={requestStatus === 'pending'}
                className="p-1 sm:p-1.5 bg-primary text-primary-content rounded-lg hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
                title="Add friend"
              >
                <UserPlus size={isMobile ? 12 : 14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main list renderer for search results
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-base-300 rounded-lg sm:rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1 sm:space-y-2">
                <div className="h-3 sm:h-4 bg-base-300 rounded w-3/4" />
                <div className="h-2 sm:h-3 bg-base-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-base-content mb-2 sm:mb-3">
            Search Results ({searchResults.length})
          </h3>
          <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar">
            {searchResults.map(member => renderSearchResultItem(member))}
          </div>
        </div>
      );
    }

    if (searchQuery) {
      return (
        <div className="text-center py-6 sm:py-8 text-base-content/50">
          <Search size={isMobile ? 32 : 48} className="mx-auto mb-2 sm:mb-3 text-base-content/30" />
          <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No users found</p>
          <p className="text-xs sm:text-sm">No results found for "{searchQuery}"</p>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-3 sm:mb-4"></div>
          <p className="text-base-content/60 text-sm sm:text-base">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Show search results when searching */}
      {searchQuery ? (
        renderSearchResults()
      ) : (
        /* Normal section view when not searching */
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4">
          <ChatSection
            title="Workspaces"
            items={filteredWorkspaces}
            type="workspace"
            icon={<Briefcase />}
            sectionKey="workspaces"
            emptyMessage="No workspaces available"
            color="primary"
          />

          <ChatSection
            title="Documents"
            items={filteredDocuments}
            type="document"
            icon={<FileText />}
            sectionKey="documents"
            emptyMessage="No documents available"
            color="success"
          />

          <ChatSection
            title="Friends"
            items={filteredFriends}
            type="user"
            icon={<Users />}
            sectionKey="friends"
            emptyMessage="No friends available"
            color="accent"
          />
        </div>
      )}
    </div>
  );
};

export default ChatSelector;