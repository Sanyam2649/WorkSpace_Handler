import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardMainSection from '../subComponent/DashboardMainSlide';
import SearchMemberSlide from '../subComponent/DashboardSearchMemberSlide';
import WorkSpaceSlide from '../subComponent/DashboardWorkSpaceSlide';

export default function Dashboard() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [ 
    { component: <WorkSpaceSlide />, title: "Workspaces" }, 
    { component: <SearchMemberSlide />, title: "Find Members" },
    { component: <DashboardMainSection />, title: "Dashboard" }
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-200 via-base-100 to-base-300">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-7xl">
          {/* Simple Transparent Frame */}
          <div className="bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-300/50 overflow-hidden">
            
            {/* Minimal Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-base-300/30 bg-base-200/50">
              <button
                onClick={prevSlide}
                className="p-3 bg-base-100 hover:bg-base-200 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeSlide ? 'bg-primary w-6' : 'bg-base-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-base-content/60 font-medium">
                  {slides[activeSlide].title}
                </span>
              </div>
              
              <button
                onClick={nextSlide}
                className="p-3 bg-base-100 hover:bg-base-200 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Slide Content */}
            <div className="relative min-h-[600px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-6 h-full">
                    {slide.component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}