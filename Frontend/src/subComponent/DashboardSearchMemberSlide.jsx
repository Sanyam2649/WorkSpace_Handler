import React, { useState } from 'react';
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

    // New function to start chat with a member
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

    // New function to handle general chat opening
    const handleOpenChat = () => {
        setSelectedChat(null); // No specific chat selected, user can choose from sidebar
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
            <div className="relative z-10 w-full h-full flex flex-col p-4 lg:p-6">
                {/* Search Section */}
                {showSearch && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-in fade-in duration-300">
                        <div className="relative flex-1 w-full">
                            <div className="relative flex items-center">
                                {loading ? (
                                    <span className="absolute left-3 z-10">
                                        <span className="loading loading-spinner loading-xs text-primary"></span>
                                    </span>
                                ) : (
                                    <svg
                                        className="absolute left-3 z-10 w-4 h-4 text-base-content/60 transition-colors duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                )}

                                <input
                                    type="text"
                                    placeholder="Search members by username or email..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-base-300 bg-base-100 text-base-content placeholder-base-content/60 outline-none transition-all duration-300 ease-in-out hover:border-primary/50 focus:border-primary focus:bg-base-100 focus:shadow-lg focus:shadow-primary/20"
                                />
                            </div>
                            <p className="text-xs text-base-content/60 mt-2 ml-1">
                                Search by username or email address
                            </p>
                        </div>
                    </div>
                )}

                {/* Results Panel */}
                {members.length > 0 && !isClosed && (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-lg flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 lg:p-6 border-b border-base-300">
                                <div>
                                    <h3 className="text-lg lg:text-xl  text-base-content">
                                        Found {members.length} Member{members.length !== 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-sm text-base-content/60 mt-1">
                                        Search results for "{query}"
                                    </p>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Close
                                </button>
                            </div>
                            
                            {/* Members Grid */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-min">
                                    {members.map((member) => (
                                        <div 
                                            key={member._id || member.id} 
                                            className="group relative p-4 rounded-xl bg-base-200 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                        >
                                            {/* Member Header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-content  text-lg shadow-lg">
                                                    {member.profile?.firstName?.charAt(0) || member.username?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-semibold text-base-content truncate">
                                                        {member.profile?.firstName && member.profile?.lastName 
                                                            ? `${member.profile.firstName} ${member.profile.lastName}`
                                                            : member.username
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-base-content/60 truncate">
                                                        @{member.username}
                                                    </p>
                                                    {member.profile?.title && (
                                                        <p className="text-xs text-primary truncate mt-1">
                                                            {member.profile.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 text-sm text-base-content/70 mb-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                            </div>

                                            {/* Member Details */}
                                            <div className="flex-1 space-y-3">
                                                {member.profile?.skills && member.profile.skills.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-medium text-primary mb-1">Skills</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.profile.skills.slice(0, 3).map((skill, index) => (
                                                                <span 
                                                                    key={index}
                                                                    className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs border border-primary/30"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {member.profile.skills.length > 3 && (
                                                                <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs border border-secondary/30">
                                                                    +{member.profile.skills.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {member.profile?.interests && (
                                                    <div>
                                                        <p className="text-xs font-medium text-secondary mb-1">Interests</p>
                                                        <p className="text-sm text-base-content/70 line-clamp-2">
                                                            {member.profile.interests}
                                                        </p>
                                                    </div>
                                                )}

                                                {member.mutualConnections > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-base-content/50">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        {member.mutualConnections} mutual connection{member.mutualConnections !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4 pt-3 border-t border-base-300">
                                                <button 
                                                    onClick={() => handleFriendRequest(member._id || member.id)}
                                                    disabled={requestedMembers.has(member._id || member.id)}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ${
                                                        requestedMembers.has(member._id || member.id)
                                                            ? "bg-success/20 text-success border border-success/30 cursor-not-allowed"
                                                            : "bg-gradient-to-r from-primary to-secondary text-primary-content hover:from-primary/90 hover:to-secondary/90"
                                                    }`}
                                                >
                                                    {requestedMembers.has(member._id || member.id) ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Request Sent
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                            </svg>
                                                            Add Friend
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleStartChat(member)}
                                                    className="px-4 py-2.5 bg-base-300 hover:bg-base-400 text-base-content rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                                                    title="Start Chat"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Chat
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
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in fade-in duration-500">
                        <div className="space-y-4 max-w-2xl">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl lg:text-3xl  text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Connect with Members
                            </h1>
                            <p className="text-lg text-base-content/70 max-w-md mx-auto">
                                Search by username or email to find and connect with people
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <button
                                onClick={handleOpenChat}
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-2xl font-semibold transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Start Chatting
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {members.length === 0 && !isClosed && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in fade-in duration-500">
                        <div className="space-y-4 max-w-2xl">
                            <div className="w-16 h-16 mx-auto bg-base-200 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl lg:text-2xl  text-base-content">
                                No Members Found
                            </h2>
                            <p className="text-base-content/70">
                                No members found for "{query}". Try searching with a different username or email.
                            </p>
                            <div className="text-sm text-base-content/60 mt-2">
                                <p>Try searching by:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Exact username (e.g., "johndoe")</li>
                                    <li>Email address (e.g., "john@example.com")</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <button
                                onClick={handleShowSearch}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl font-semibold transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 hover:scale-105"
                            >
                                Try Another Search
                            </button>
                            <button
                                onClick={handleOpenChat}
                                className="px-6 py-3 bg-base-300 hover:bg-base-400 text-base-content rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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