import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriendList } from '../api';
import { 
  ChevronLeft, 
  ChevronRight, 
  FolderKanban, 
  BarChart3, 
  Zap,
  Users,
  FileText,
  Clock,
  Rocket
} from 'lucide-react';

const getSlides = (friendCount, workspaceCount, documentCount) => [
  {
    title: "Team Collaboration",
    description: "Connect with team members and work together seamlessly on projects",
    icon: "👥",
    stats: `${friendCount} Connections`,
    gradient: "from-blue-500/10 to-purple-500/10",
    color: "text-blue-600"
  },
  {
    title: "Project Management",
    description: "Organize tasks, set deadlines, and track progress in real-time",
    icon: "📊",
    stats: `${workspaceCount} Workspaces`,
    gradient: "from-green-500/10 to-teal-500/10",
    color: "text-green-600"
  },
  {
    title: "Document Sharing",
    description: "Share and collaborate on documents with your team",
    icon: "📝",
    stats: `${documentCount} Documents`,
    gradient: "from-orange-500/10 to-red-500/10",
    color: "text-orange-600"
  }
];

const DashboardMainSection = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
   
  const slides = useMemo(() => 
    getSlides(friendList.length, workspaceList.length, documentList.length),
    [friendList.length, workspaceList.length, documentList.length]
  );

  // Load friend list on component mount - IMPROVED
  useEffect(() => {
    const loadFriendList = async () => {
      // Prevent multiple simultaneous calls
      if (isLoading || hasFetched) return;
      
      setIsLoading(true);
      try {
        const response = await getFriendList();
        setFriendList(response?.friendList || []);
        setWorkspaceList(response?.workspaceList || []);
        setDocumentList(response?.documentList || []);
        setHasFetched(true);
      } catch (error) {
        console.error('Failed to load friend list:', error);
        setFriendList([]);
        setWorkspaceList([]);
        setDocumentList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendList();
  }, [isLoading, hasFetched]); 
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
    <main className="flex-grow flex items-center justify-center px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 xl:py-12">
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-4 sm:gap-6">
        {/* Left Panel: Informative Slider */}
        <div className="w-full xl:w-2/5 px-3 sm:px-4 pt-2 h-fit bg-base-100 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-base-300 backdrop-blur-sm bg-base-100/80">
          <div className="relative mb-2 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 py-3 sm:py-4 px-4 sm:px-6 border border-base-300">
            <div className="relative h-48 sm:h-56">
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
                  <div className={`p-4 sm:p-6 text-center h-full flex flex-col justify-center bg-gradient-to-br ${slide.gradient} rounded-xl`}>
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 transform hover:scale-110 transition-transform duration-300">{slide.icon}</div>
                    <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">
                      {slide.title}
                    </h3>
                    <p className="text-base-content/70 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                      {slide.description}
                    </p>
                    <div className={`font-semibold text-xs sm:text-sm ${slide.color}`}>
                      {slide.stats}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                    index === activeSlide 
                      ? 'bg-primary w-6 sm:w-8 scale-125' 
                      : 'bg-base-300 hover:bg-base-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-base-100/90 hover:bg-base-100 rounded-full p-2 sm:p-3 shadow-lg sm:shadow-xl transition-all duration-300 hover:scale-110 border border-base-300"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-base-content" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-base-100/90 hover:bg-base-100 rounded-full p-2 sm:p-3 shadow-lg sm:shadow-xl transition-all duration-300 hover:scale-110 border border-base-300"
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5 text-base-content" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="text-center">
              <h3 className="text-base-content text-base sm:text-lg mb-3 sm:mb-4 font-semibold">Quick Access</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleWorkspace}
                className="p-3 sm:p-4 bg-gradient-to-br from-base-200 to-base-300 hover:from-base-300 hover:to-base-400 rounded-xl sm:rounded-2xl border border-base-300 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  <FolderKanban size={24} className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content">Workspace</div>
                <div className="text-xs text-base-content/60 mt-1 hidden sm:block">Manage projects</div>
                <div className="text-xs text-base-content/60 mt-1 sm:hidden">Projects</div>
              </button>
              
              <button
                onClick={handleDashboard}
                className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={24} className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content">Analytics</div>
                <div className="text-xs text-base-content/60 mt-1 hidden sm:block">View insights</div>
                <div className="text-xs text-base-content/60 mt-1 sm:hidden">Insights</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Workspace Info */}
        <div className="w-full xl:w-3/5 h-full bg-base-100 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 xl:p-11 border border-base-300 backdrop-blur-sm bg-base-100/80">
          <div>            
            <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-base-300 mb-6 sm:mb-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl">
                  <Rocket size={20} className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                Advanced Task Analysis
              </h3>
              <p className="text-base-content/70 leading-relaxed text-sm sm:text-base">
                Streamline your workflows with real-time collaboration, automated task tracking, 
                and intelligent project insights. Everything you need to boost productivity and 
                deliver exceptional results with your team.
              </p>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-primary/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  {workspaceList.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content/70 flex items-center gap-1">
                  <FolderKanban size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Active</span> Workspaces
                </div>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-secondary/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-xl sm:text-2xl font-bold text-secondary mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  {friendList.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content/70 flex items-center gap-1">
                  <Users size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Team</span> Connections
                </div>
              </div>
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-success/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-xl sm:text-2xl font-bold text-success mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  {documentList.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content/70 flex items-center gap-1">
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Shared</span> Documents
                </div>
              </div>
              <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-warning/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="text-xl sm:text-2xl font-bold text-warning mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                  {workspaceList.length + friendList.length + documentList.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-base-content/70 flex items-center gap-1">
                  <Zap size={14} className="sm:w-4 sm:h-4" />
                  Total Assets
                </div>
              </div>
            </div>

            {/* Additional Mobile-Only Stats Summary */}
            <div className="sm:hidden bg-gradient-to-br from-base-200 to-base-300 rounded-xl p-4 border border-base-300 mb-4">
              <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                <Users size={16} />
                Quick Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Workspaces:</span>
                  <span className="font-semibold text-base-content">{workspaceList.length} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Connections:</span>
                  <span className="font-semibold text-base-content">{friendList.length} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Documents:</span>
                  <span className="font-semibold text-base-content">{documentList.length} shared</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-base-300">
            <div className="flex items-center text-base-content/50 text-xs sm:text-sm">
              <Clock size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Last updated: Just now
            </div>
            <button 
              onClick={handleWorkspace}
              className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              Explore more
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardMainSection;