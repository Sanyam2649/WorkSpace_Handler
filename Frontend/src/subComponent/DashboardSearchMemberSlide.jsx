import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Check, 
  UserPlus, 
  MessageCircle, 
  Users, 
  Mail, 
  User,
  MessageSquare,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { searchMembers, sendFriendRequest } from '../api';
import Chat from '../components/Chat'; 

const SearchMemberSlide = () => {
    const [query, setQuery] = useState("");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(true);
    const [requestedMembers, setRequestedMembers] = useState(new Set());
    const [showSearch, setShowSearch] = useState(true);
    
    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const res = await searchMembers(query);
            setMembers(res || []);
            setIsClosed(false);
            setShowSearch(false);
        } catch (error) {
            console.error("Error searching members:", error);
            alert("Failed to search members. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFriendRequest = async (memberId) => {
        try {
            const res = await sendFriendRequest(memberId);
            alert(res.message || "Friend request sent successfully!");
            setRequestedMembers(prev => new Set([...prev, memberId]));
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert("Failed to send friend request.");
        }
    };

    const handleStartChat = (member) => {
        setSelectedChat({
            type: 'user',
            roomId: `user_${member._id}`,
            otherUserId: member._id,
            name: member.profile?.firstName && member.profile?.lastName 
                ? `${member.profile.firstName} ${member.profile.lastName}`
                : member.username,
            memberData: member
        });
        setIsChatOpen(true);
    };

    const handleOpenChat = () => {
        setSelectedChat(null);
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setSelectedChat(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClose = () => {
        setIsClosed(true);
        setShowSearch(true);
        setQuery("");
    };

    const handleShowSearch = () => {
        setShowSearch(true);
        setIsClosed(true);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Chat Component */}
            {isChatOpen && (
                <Chat 
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    workspaceId={selectedChat?.type === 'workspace' ? selectedChat.roomId : null}
                    chatType={selectedChat?.type || 'user'}
                />
            )}

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-4 lg:p-6">
                {/* Search Section */}
                {showSearch && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 animate-in fade-in duration-300">
                        <div className="relative flex-1 w-full">
                            <div className="relative flex items-center">
                                {loading ? (
                                    <span className="absolute left-3 z-10">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </span>
                                ) : (
                                    <Search className="absolute left-3 z-10 w-4 h-4 text-base-content/60 transition-colors duration-200" />
                                )}

                                <input
                                    type="text"
                                    placeholder="Search members by username or email..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-lg sm:rounded-xl border-2 border-base-300 bg-base-100 text-base-content placeholder-base-content/60 outline-none transition-all duration-300 ease-in-out hover:border-primary/50 focus:border-primary focus:bg-base-100 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                                />
                            </div>
                            <p className="text-xs text-base-content/60 mt-1 sm:mt-2 ml-1">
                                Search by username or email address
                            </p>
                        </div>
                    </div>
                )}

                {/* Results Panel */}
                {members.length > 0 && !isClosed && (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                        <div className="bg-base-100 rounded-xl sm:rounded-2xl border border-base-300 shadow-lg flex flex-col h-full">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 border-b border-base-300">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-base-content">
                                        Found {members.length} Member{members.length !== 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-base-content/60 mt-1 truncate">
                                        Search results for "{query}"
                                    </p>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    className="px-3 sm:px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                                >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Close
                                </button>
                            </div>
                            
                            {/* Members Grid */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 auto-rows-min">
                                    {members.map((member) => (
                                        <div 
                                            key={member._id || member.id} 
                                            className="group relative p-3 sm:p-4 rounded-lg sm:rounded-xl bg-base-200 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                        >
                                            {/* Member Header */}
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-content text-sm sm:text-base lg:text-lg shadow-lg flex-shrink-0">
                                                    {member.profile?.firstName?.charAt(0) || member.username?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-base-content truncate">
                                                        {member.profile?.firstName && member.profile?.lastName 
                                                            ? `${member.profile.firstName} ${member.profile.lastName}`
                                                            : member.username
                                                        }
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-base-content/60 truncate">
                                                        @{member.username}
                                                    </p>
                                                    {member.profile?.title && (
                                                        <p className="text-xs text-primary truncate mt-0.5">
                                                            {member.profile.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="mb-2 sm:mb-3">
                                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-base-content/70 mb-1">
                                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                            </div>

                                            {/* Member Details */}
                                            <div className="flex-1 space-y-2 sm:space-y-3">
                                                {member.profile?.skills && member.profile.skills.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-medium text-primary mb-1">Skills</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.profile.skills.slice(0, 3).map((skill, index) => (
                                                                <span 
                                                                    key={index}
                                                                    className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-primary/20 text-primary text-xs border border-primary/30"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {member.profile.skills.length > 3 && (
                                                                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-secondary/20 text-secondary text-xs border border-secondary/30">
                                                                    +{member.profile.skills.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {member.profile?.interests && (
                                                    <div>
                                                        <p className="text-xs font-medium text-secondary mb-1">Interests</p>
                                                        <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2">
                                                            {member.profile.interests}
                                                        </p>
                                                    </div>
                                                )}

                                                {member.mutualConnections > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-base-content/50">
                                                        <Users className="w-3 h-3 flex-shrink-0" />
                                                        {member.mutualConnections} mutual connection{member.mutualConnections !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-base-300">
                                                <button 
                                                    onClick={() => handleFriendRequest(member._id || member.id)}
                                                    disabled={requestedMembers.has(member._id || member.id)}
                                                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-xs sm:text-sm ${
                                                        requestedMembers.has(member._id || member.id)
                                                            ? "bg-success/20 text-success border border-success/30 cursor-not-allowed"
                                                            : "bg-gradient-to-r from-primary to-secondary text-primary-content hover:from-primary/90 hover:to-secondary/90"
                                                    }`}
                                                >
                                                    {requestedMembers.has(member._id || member.id) ? (
                                                        <>
                                                            <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <span className="truncate">Request Sent</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <span className="truncate">Add Friend</span>
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleStartChat(member)}
                                                    className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-base-300 hover:bg-base-400 text-base-content rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
                                                    title="Start Chat"
                                                >
                                                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="hidden xs:inline">Chat</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Content */}
                {(isClosed || members.length === 0) && showSearch && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-4 sm:py-8 animate-in fade-in duration-500">
                        <div className="space-y-3 sm:space-y-4 max-w-2xl">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
                            </div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Connect with Members
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-base-content/70 max-w-md mx-auto">
                                Search by username or email to find and connect with people
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                            <button
                                onClick={handleOpenChat}
                                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                            >
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                Start Chatting
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {members.length === 0 && !isClosed && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-4 sm:py-8 animate-in fade-in duration-500">
                        <div className="space-y-3 sm:space-y-4 max-w-2xl">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-base-200 rounded-full flex items-center justify-center">
                                <Search className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-base-content/40" />
                            </div>
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-base-content">
                                No Members Found
                            </h2>
                            <p className="text-sm sm:text-base text-base-content/70">
                                No members found for "{query}". Try searching with a different username or email.
                            </p>
                            <div className="text-xs sm:text-sm text-base-content/60 mt-2">
                                <p>Try searching by:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Exact username (e.g., "johndoe")</li>
                                    <li>Email address (e.g., "john@example.com")</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                            <button
                                onClick={handleShowSearch}
                                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 hover:scale-105 text-sm sm:text-base"
                            >
                                Try Another Search
                            </button>
                            <button
                                onClick={handleOpenChat}
                                className="px-4 py-2 sm:px-6 sm:py-3 bg-base-300 hover:bg-base-400 text-base-content rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                            >
                                Browse Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchMemberSlide;