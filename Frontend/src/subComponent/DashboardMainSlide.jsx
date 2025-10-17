import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {getFriendList} from '../api';

const DashboardMainSection = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  
  const slides = [
    {
      title: "Team Collaboration",
      description: "Connect with team members and work together seamlessly on projects",
      icon: "👥",
      stats: `${friendList.length} Connections`,
      gradient: "from-blue-500/10 to-purple-500/10",
      color: "text-blue-600"
    },
    {
      title: "Project Management",
      description: "Organize tasks, set deadlines, and track progress in real-time",
      icon: "📊",
      stats: `${workspaceList.length} Workspaces`,
      gradient: "from-green-500/10 to-teal-500/10",
      color: "text-green-600"
    },
    {
      title: "Document Sharing",
      description: "Share and collaborate on documents with your team",
      icon: "📝",
      stats: `${documentList.length} Documents`,
      gradient: "from-orange-500/10 to-red-500/10",
      color: "text-orange-600"
    }
  ];

  // Load friend list on component mount
  useEffect(() => {
    const loadFriendList = async () => {
      try {
        const response = await getFriendList();
        setFriendList(response?.friendList || []);
        setWorkspaceList(response?.workspaceList || []);
        setDocumentList(response?.documentList || []);
      } catch (error) {
        console.error('Failed to load friend list:', error);
        setFriendList([]);
        setWorkspaceList([]);
        setDocumentList([]);
      }
    };

    loadFriendList();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleWorkspace = () => {
    navigate('/workspace');
  };

  const handleDashboard = () => {
    navigate('/analytics');
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-8 lg:py-12">
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-6">
        {/* Left Panel: Informative Slider */}
        <div className="w-full xl:w-2/5  px-4 pt-2  h-fit bg-base-100 rounded-2xl shadow-xl  border border-base-300 backdrop-blur-sm bg-base-100/80">
          <div className="relative mb-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 py-4 px-6 border border-base-300">
            <div className="relative h-56">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === activeSlide
                      ? 'opacity-100 translate-x-0'
                      : index < activeSlide
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className={`p-6 text-center h-full flex flex-col justify-center bg-gradient-to-br ${slide.gradient} rounded-xl`}>
                    <div className="text-5xl mb-4 transform hover:scale-110 transition-transform duration-300">{slide.icon}</div>
                    <h3 className="text-xl  text-base-content mb-3">
                      {slide.title}
                    </h3>
                    <p className="text-base-content/70 mb-4 text-sm leading-relaxed">
                      {slide.description}
                    </p>
                    <div className={` text-sm ${slide.color}`}>
                      {slide.stats}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-3 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index === activeSlide 
                      ? 'bg-primary w-8 scale-125' 
                      : 'bg-base-300 hover:bg-base-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-base-100/90 hover:bg-base-100 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-base-300"
            >
              <svg className="w-5 h-5 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-base-100/90 hover:bg-base-100 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-base-300"
            >
              <svg className="w-5 h-5 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 mb-8">
            <div className="text-center">
              <h3 className=" text-base-content text-lg mb-4">Quick Access</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleWorkspace}
                className="p-4 bg-gradient-to-br from-base-200 to-base-300 hover:from-base-300 hover:to-base-400 rounded-2xl border border-base-300 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-base-content">Workspace</div>
                <div className="text-xs text-base-content/60 mt-1">Manage projects</div>
              </button>
              
              <button
                onClick={handleDashboard}
                className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-2xl border border-primary/20 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-base-content">Analytics</div>
                <div className="text-xs text-base-content/60 mt-1">View insights</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Workspace Info */}
        <div className="w-full xl:w-3/5 h-full bg-base-100 rounded-2xl shadow-xl p-11 border border-base-300 backdrop-blur-sm bg-base-100/80">
          <div>            
            <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl p-6 border border-base-300 mb-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl  text-base-content mb-3 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Advanced Task Analysis
              </h3>
              <p className="text-base-content/70 leading-relaxed text-base">
                Streamline your workflows with real-time collaboration, automated task tracking, 
                and intelligent project insights. Everything you need to boost productivity and 
                deliver exceptional results with your team.
              </p>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-2xl  text-primary mb-2 group-hover:scale-110 transition-transform duration-300">{workspaceList.length}</div>
                <div className="text-sm font-semibold text-base-content/70">Active Workspaces</div>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-5 border border-secondary/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-2xl  text-secondary mb-2 group-hover:scale-110 transition-transform duration-300">{friendList.length}</div>
                <div className="text-sm font-semibold text-base-content/70">Team Connections</div>
              </div>
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-5 border border-success/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-2xl  text-success mb-2 group-hover:scale-110 transition-transform duration-300">{documentList.length}</div>
                <div className="text-sm font-semibold text-base-content/70">Shared Documents</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-base-300">
            <div className="flex items-center text-base-content/50 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: Just now
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardMainSection;