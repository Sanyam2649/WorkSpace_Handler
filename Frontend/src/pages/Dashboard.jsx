import React, { useState} from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardMainSection from '../subComponent/DashboardMainSlide';
import SearchMemberSlide from '../subComponent/DashboardSearchMemberSlide';
import WorkSpaceSlide from '../subComponent/DashboardWorkSpaceSlide';
import { ChevronLeft, ChevronRight, Circle, Square, X } from 'lucide-react';
import { useToast } from '../context/useToast';

export default function Dashboard() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { showToast } = useToast();


  const slides = [ 
    { 
      component: <WorkSpaceSlide showToast={showToast} />, 
      title: "Workspaces", 
      icon: "🏢" 
    }, 
    { 
      component: <SearchMemberSlide showToast={showToast} />, 
      title: "Find Members", 
      icon: "👥" 
    },
    { 
      component: <DashboardMainSection showToast={showToast} />, 
      title: "Dashboard", 
      icon: "📊" 
    }
  ];

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // // Auto-rotate slides on desktop
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     nextSlide();
  //   }, 8000); // 8 seconds for better UX

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-200 via-base-100 to-base-300">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="w-full max-w-7xl">
          {/* Responsive Frame */}
          <div className="bg-base-100/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-base-300/50 overflow-hidden">
            
            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-base-300/30 bg-base-200/50">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="p-2 sm:p-3 bg-base-100 hover:bg-base-200 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-base-300/50"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5 text-base-content" />
              </button>
              
              {/* Slide Indicators & Title */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 flex-1 px-2 sm:px-4">
                {/* Mobile: Compact indicators */}
                <div className="flex gap-1.5 sm:gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`transition-all duration-300 ${
                        index === activeSlide 
                          ? 'text-primary scale-110' 
                          : 'text-base-300 hover:text-base-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      {index === activeSlide ? (
                        <Square size={12} className="sm:w-3 sm:h-3 fill-current" />
                      ) : (
                        <Circle size={8} className="sm:w-2 sm:h-2 fill-current" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Slide Title */}
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{slides[activeSlide].icon}</span>
                  <span className="text-sm sm:text-base font-medium text-base-content">
                    {slides[activeSlide].title}
                  </span>
                </div>
              </div>
              
              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="p-2 sm:p-3 bg-base-100 hover:bg-base-200 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-base-300/50"
                aria-label="Next slide"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5 text-base-content" />
              </button>
            </div>

            {/* Slide Content with Touch Support */}
            <div 
              className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === activeSlide 
                      ? 'opacity-100 translate-x-0' 
                      : index < activeSlide 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
                    {React.cloneElement(slide.component, { 
                      // Pass mobile state if needed by child components
                      isMobile: window.innerWidth < 768 
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation for Mobile */}
            <div className="sm:hidden flex justify-center items-center p-3 border-t border-base-300/30 bg-base-200/50">
              <div className="flex gap-3">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
                      index === activeSlide 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-base-content/60 hover:text-base-content'
                    }`}
                  >
                    <span className="text-lg">{slide.icon}</span>
                    <span className="text-xs font-medium truncate">{slide.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Buttons for Mobile */}
          <div className="sm:hidden grid grid-cols-3 gap-3 mt-4">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  index === activeSlide
                    ? 'bg-primary text-primary-content border-primary shadow-lg'
                    : 'bg-base-100 border-base-300 hover:bg-base-200'
                }`}
              >
                <div className="text-lg mb-1">{slide.icon}</div>
                <div className="text-xs font-medium truncate">{slide.title}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Responsive Modal Component for child components to use
export const ResponsiveModal = ({ children, onClose, size = "md" }) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl", 
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div 
        className={`bg-base-100 rounded-xl sm:rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden relative mx-2 sm:mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-base-200 hover:bg-base-300 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <ChevronRight size={16} className="sm:w-5 sm:h-5 text-base-content transform rotate-45" />
        </button>
        <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Responsive Slide Container for child components
export const SlideContainer = ({ children, className = "" }) => (
  <div className={`w-full h-full ${className}`}>
    {children}
  </div>
);