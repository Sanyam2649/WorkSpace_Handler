import React, { useState } from "react";
import { searchWorkspaces, requestToJoinWorkspace } from "../api";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus, Check, ArrowRight, Users, Eye } from "lucide-react";

export default function WorkSpaceSlide() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(true);
    const [requestedWorkspaces, setRequestedWorkspaces] = useState(new Set());

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const res = await searchWorkspaces(query);
            setWorkspaces(res || []);
            setIsClosed(false);
        } catch (error) {
            console.error("Error searching workspaces:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async (workspaceId) => {
        try {
            const res = await requestToJoinWorkspace(workspaceId);
            alert(res.message || "Request sent successfully!");
            setRequestedWorkspaces(prev => new Set([...prev, workspaceId]));
        } catch (error) {
            console.error("Error sending join request:", error);
            alert("Failed to send join request.");
        }
    };

    const handleVisitWorkSpace = () => {
        navigate("/workspace");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleClose = () => {
        setIsClosed(true);
    };

    return (
        <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] bg-cover bg-center bg-no-repeat rounded-xl overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                }}
            />
            
            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-4 lg:p-6 xl:p-8">
                {/* Search Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                    <div className="relative flex-1 max-w-2xl w-full">
                        <div className="relative flex items-center">
                            {loading ? (
                                <span className="absolute left-3 z-10">
                                    <span className="loading loading-spinner loading-xs text-base-content/70"></span>
                                </span>
                            ) : (
                                <Search 
                                    size={18} 
                                    className="absolute left-3 z-10 text-base-content/70 transition-colors duration-200" 
                                />
                            )}

                            <input
                                type="text"
                                placeholder="Search workspaces..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-lg sm:rounded-xl border-2 border-transparent bg-base-100/95 backdrop-blur-sm text-base-content placeholder-base-content/60 outline-none transition-all duration-300 ease-in-out hover:border-primary/30 focus:border-primary/50 focus:bg-base-100 focus:shadow-lg focus:shadow-primary/10 text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                {workspaces.length > 0 && !isClosed && (
                    <div className="absolute top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 lg:mx-auto lg:max-w-4xl bg-base-100/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-base-300 shadow-2xl z-20 animate-in fade-in slide-in-from-top-5 duration-300">
                        <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b border-base-300">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-base-content flex items-center gap-2">
                                <Users size={18} className="sm:w-5 sm:h-5" />
                                Available Workspaces ({workspaces.length})
                            </h3>
                            <button 
                                onClick={handleClose}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content/70 hover:text-base-content transition-all duration-200 hover:scale-110"
                            >
                                <X size={14} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        
                        <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto p-3 sm:p-4 lg:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                {workspaces.map((workspace) => (
                                    <div 
                                        key={workspace._id} 
                                        className="group relative p-3 sm:p-4 rounded-lg sm:rounded-xl bg-base-200/50 border border-base-300 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base font-semibold text-base-content truncate">
                                                    {workspace.name}
                                                </h4>
                                                {workspace.description && (
                                                    <p className="text-xs sm:text-sm text-base-content/70 mt-1 line-clamp-2">
                                                        {workspace.description}
                                                    </p>
                                                )}
                                                {workspace.members && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <Users size={12} className="text-base-content/50" />
                                                        <span className="text-xs text-base-content/50">
                                                            {workspace.members.length} members
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleJoinRequest(workspace._id)}
                                                disabled={requestedWorkspaces.has(workspace._id)}
                                                className={`flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm ${
                                                    requestedWorkspaces.has(workspace._id)
                                                        ? "bg-success/20 text-success border border-success/30 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-primary to-secondary text-primary-content hover:from-primary/90 hover:to-secondary/90"
                                                }`}
                                            >
                                                {requestedWorkspaces.has(workspace._id) ? (
                                                    <>
                                                        <Check size={14} className="sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Requested</span>
                                                        <span className="sm:hidden">Sent</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={14} className="sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Join</span>
                                                        <span className="sm:hidden">Join</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center text-base-100 space-y-4 sm:space-y-6 py-4 sm:py-6 lg:py-8">
                    <div className="space-y-3 sm:space-y-4 max-w-2xl">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold drop-shadow-lg bg-gradient-to-r from-base-100 to-base-200 bg-clip-text text-transparent">
                            Discover Workspaces
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl opacity-90 drop-shadow-lg max-w-md mx-auto px-2">
                            Find and join amazing spaces to collaborate with your team
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
                        <button
                            onClick={handleVisitWorkSpace}
                            className="btn btn-accent btn-sm sm:btn-lg px-4 sm:px-6 lg:px-8 glass text-accent-content hover:glass:hover transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Eye size={16} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Explore Workspace</span>
                        </button>
                        
                        {workspaces.length > 0 && !isClosed && (
                            <button
                                onClick={handleClose}
                                className="btn btn-outline btn-sm sm:btn-lg px-4 sm:px-6 lg:px-8 text-base-100 border-base-100 hover:bg-base-100 hover:text-base-content transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                            >
                                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base">View Results</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Search Prompt */}
                    <div className="sm:hidden text-base-100/80 text-xs mt-2">
                        <p>Search above to find workspaces</p>
                    </div>

                    {/* Stats for larger screens */}
                    <div className="hidden sm:flex items-center gap-4 sm:gap-6 mt-4 text-base-100/80 text-sm">
                        <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>Join teams</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Search size={16} />
                            <span>Discover spaces</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Plus size={16} />
                            <span>Start collaborating</span>
                        </div>
                    </div>
                </div>

                {/* Bottom gradient for better text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}