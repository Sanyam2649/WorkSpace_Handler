import React, { useState } from "react";
import { searchWorkspaces, requestToJoinWorkspace } from "../api";
import { useNavigate } from "react-router-dom";

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
        <div className="relative w-full h-full min-h-[400px] bg-cover bg-center bg-no-repeat rounded-xl overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                }}
            />
            
            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col p-4 sm:p-6 lg:p-8">
                {/* Search Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div className="relative flex-1 max-w-2xl w-full">
                        <div className="relative flex items-center">
                            {loading ? (
                                <span className="absolute left-3 z-10">
                                    <span className="loading loading-spinner loading-xs text-base-content/70"></span>
                                </span>
                            ) : (
                                <svg
                                    className="absolute left-3 z-10 w-4 h-4 text-base-content/70 transition-colors duration-200"
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
                                placeholder="Search workspaces..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-transparent bg-base-100/95 backdrop-blur-sm text-base-content placeholder-base-content/60 outline-none transition-all duration-300 ease-in-out hover:border-primary/30 focus:border-primary/50 focus:bg-base-100 focus:shadow-lg focus:shadow-primary/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                {workspaces.length > 0 && !isClosed && (
                    <div className="absolute top-20 left-0 right-0 mx-auto max-w-4xl bg-base-100/95 backdrop-blur-sm rounded-2xl border border-base-300 shadow-2xl z-20 animate-in fade-in slide-in-from-top-5 duration-300">
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-base-300">
                            <h3 className="text-lg sm:text-xl  text-base-content">
                                Available Workspaces ({workspaces.length})
                            </h3>
                            <button 
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content/70 hover:text-base-content transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspaces.map((workspace) => (
                                    <div 
                                        key={workspace._id} 
                                        className="group relative p-4 rounded-xl bg-base-200/50 border border-base-300 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-semibold text-base-content truncate">
                                                    {workspace.name}
                                                </h4>
                                                {workspace.description && (
                                                    <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                                                        {workspace.description}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleJoinRequest(workspace._id)}
                                                disabled={requestedWorkspaces.has(workspace._id)}
                                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 min-w-[100px] ${
                                                    requestedWorkspaces.has(workspace._id)
                                                        ? "bg-success/20 text-success-content border border-success/30 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-primary to-secondary text-primary-content hover:from-primary/90 hover:to-secondary/90"
                                                }`}
                                            >
                                                {requestedWorkspaces.has(workspace._id) ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Requested
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Join
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
                <div className="flex-1 flex flex-col items-center justify-center text-center text-base-100 space-y-6 py-8">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl  drop-shadow-lg bg-gradient-to-r from-base-100 to-base-200 bg-clip-text text-transparent">
                            Discover Workspaces
                        </h1>
                        <p className="text-lg sm:text-xl opacity-90 drop-shadow-lg max-w-md mx-auto">
                            Find and join amazing spaces to collaborate with your team
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button
                            onClick={handleVisitWorkSpace}
                            className="btn btn-accent btn-lg px-8 glass text-accent-content hover:glass:hover transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Explore Workspace
                        </button>
                        
                        {workspaces.length > 0 && !isClosed && (
                            <button
                                onClick={handleClose}
                                className="btn btn-outline btn-lg px-8 text-base-100 border-base-100 hover:bg-base-100 hover:text-base-content transform hover:scale-105 transition-all duration-300"
                            >
                                View Results
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}