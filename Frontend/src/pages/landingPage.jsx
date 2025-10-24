import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Users, 
  Shield, 
  Zap, 
  MessageCircle, 
  FileText, 
  Star, 
  ArrowRight,
  CheckCircle,
  Github,
  Twitter,
  Linkedin,
  Calendar,
  Target,
  TrendingUp,
  Mail,
  MapPin,
  Phone,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <Rocket className="text-white" size={18} sm:size={24} />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                CollabSpace
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Features</a>
              <a href="#how-it-works" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">How It Works</a>
              <a href="#testimonials" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Testimonials</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Contact</a>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link 
                to="/login" 
                className="px-4 lg:px-6 py-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm border border-transparent hover:border-slate-300 rounded-lg"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 lg:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg shadow-md font-medium text-sm border border-blue-500/30 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={14} sm:size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 animate-in slide-in-from-top duration-300">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <a 
                  href="#features" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="#testimonials" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a 
                  href="#contact" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-slate-200/60 space-y-3">
                  <Link 
                    to="/login" 
                    className="block text-center px-4 py-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base border border-slate-300 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all duration-200 rounded-lg shadow-md font-medium text-base border border-blue-500/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-blue-200 shadow-sm">
              <Star size={14} sm:size={16} className="fill-blue-500 text-blue-500" />
              Trusted by 10,000+ teams worldwide
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight font-poppins">
              Collaborate, Create, 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline"> Conquer</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light tracking-wide px-4">
              The all-in-one workspace for modern teams. Chat, share documents, and manage projects in one seamless platform designed for productivity.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto opacity-80 mb-8 sm:mb-0">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-3 sm:p-4 rounded-lg border border-slate-200/60 bg-white/50 shadow-sm">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 font-poppins">{stat.value}</div>
                  <div className="text-slate-600 text-xs sm:text-sm font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mobile CTA Button */}
            <div className="md:hidden mt-8 space-y-3">
              <Link 
                to="/signup" 
                className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all duration-200 rounded-lg shadow-md font-medium text-base border border-blue-500/30 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="block w-full px-6 py-3 text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-base border border-slate-300 rounded-lg text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-poppins text-slate-800">Everything Your Team Needs</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide px-4">
              Powerful features designed to boost your team's productivity and collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden"
              >
                <div className="card bg-white border border-slate-200/60 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl relative z-10">
                  <div className="card-body p-4 sm:p-6 lg:p-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      {React.cloneElement(feature.icon, { 
                        size: window.innerWidth < 640 ? 20 : window.innerWidth < 1024 ? 24 : 28 
                      })}
                    </div>
                    <h3 className="card-title text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-slate-800 font-poppins">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-light text-sm sm:text-base">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-poppins text-slate-800">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide px-4">
              Get started in minutes and transform how your team collaborates
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg border border-blue-500/30">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 sm:top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-1/2 -z-10" />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-800 font-poppins">{step.title}</h3>
                <p className="text-slate-600 font-light text-sm sm:text-base px-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Target size={32} sm:size={40} lg:size={48} className="text-white mx-auto mb-3 sm:mb-4" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 font-poppins">95%</div>
              <div className="text-white/80 font-light text-sm sm:text-base">Faster Project Completion</div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <TrendingUp size={32} sm:size={40} lg:size={48} className="text-white mx-auto mb-3 sm:mb-4" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 font-poppins">3x</div>
              <div className="text-white/80 font-light text-sm sm:text-base">Increase in Productivity</div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Calendar size={32} sm:size={40} lg:size={48} className="text-white mx-auto mb-3 sm:mb-4" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 font-poppins">40%</div>
              <div className="text-white/80 font-light text-sm sm:text-base">Fewer Meetings Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-poppins text-slate-800">What Our Users Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide px-4">
              Join thousands of satisfied teams transforming their collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-slate-600 text-xs sm:text-sm font-light">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 italic font-light leading-relaxed text-sm sm:text-base">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-3 sm:mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} sm:size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
    <div className="text-center mb-12 sm:mb-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-poppins text-slate-800">Get In Touch</h2>
      <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide px-4">
        Have questions? We'd love to hear from you
      </p>
    </div>
    
    <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border border-slate-200/60 rounded-xl sm:rounded-2xl bg-slate-50/50">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <Mail size={20} sm:size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">Email Us</div>
            <div className="text-slate-600 font-light text-xs sm:text-sm">hello@collabspace.com</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border border-slate-200/60 rounded-xl sm:rounded-2xl bg-slate-50/50">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <Phone size={20} sm:size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">Call Us</div>
            <div className="text-slate-600 font-light text-xs sm:text-sm">+1 (555) 123-4567</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border border-slate-200/60 rounded-xl sm:rounded-2xl bg-slate-50/50">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <MapPin size={20} sm:size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">Visit Us</div>
            <div className="text-slate-600 font-light text-xs sm:text-sm">123 Innovation Drive, San Francisco, CA 94107</div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
        <form 
          action= {import.meta.env.VITE_FORM_URL} 
          method="POST"
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="firstName" className="block text-slate-700 font-medium mb-2 text-xs sm:text-sm">
                First Name
              </label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm sm:text-base"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-slate-700 font-medium mb-2 text-xs sm:text-sm">
                Last Name
              </label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm sm:text-base"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-slate-700 font-medium mb-2 text-xs sm:text-sm">
              Email
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm sm:text-base"
              placeholder="john@company.com"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-slate-700 font-medium mb-2 text-xs sm:text-sm">
              Message
            </label>
            <textarea 
              id="message"
              name="message"
              rows={4}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none text-sm sm:text-base"
              placeholder="Tell us about your project..."
            />
          </div>
          
          <input type="hidden" name="_subject" value="New Contact Form Submission from CollabSpace" />
          
          <input type="text" name="_gotcha" className="hidden" />
          
          <button 
            type="submit"
            className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg sm:rounded-xl shadow-lg font-semibold text-sm sm:text-base border border-blue-500/30"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white font-poppins px-4">
            Ready to Transform Your Team's Collaboration?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto font-light tracking-wide px-4">
            Join thousands of teams already using CollabSpace to work smarter and faster.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-lg sm:rounded-xl shadow-lg font-semibold text-sm sm:text-base border border-white/30"
          >
            Start Your Free Trial
            <Rocket size={18} sm:size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="text-white" size={14} sm:size={18} />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white font-poppins">CollabSpace</span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed text-xs sm:text-sm">
                The modern workspace for teams that want to achieve more together.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-xs sm:text-sm tracking-wide">PRODUCT</h4>
              <div className="space-y-1 sm:space-y-2">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Features</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Pricing</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Security</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Updates</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-xs sm:text-sm tracking-wide">COMPANY</h4>
              <div className="space-y-1 sm:space-y-2">
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">About</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Blog</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Careers</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light text-xs sm:text-sm">Press</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-white text-xs sm:text-sm tracking-wide">CONNECT</h4>
              <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-1.5 sm:p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Twitter size={16} sm:size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-1.5 sm:p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Github size={16} sm:size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-1.5 sm:p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Linkedin size={16} sm:size={20} />
                </a>
              </div>
              <div className="text-slate-400 text-xs sm:text-sm font-light">
                Subscribe to our newsletter
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-6 sm:pt-8 text-center text-slate-400 text-xs sm:text-sm font-light">
            <p>&copy; 2024 CollabSpace. All rights reserved. | <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data arrays
const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "100K+", label: "Documents" },
  { value: "10K+", label: "Workspaces" },
  { value: "99.9%", label: "Uptime" }
];

const features = [
  {
    icon: <MessageCircle />,
    title: "Real-time Chat",
    description: "Instant messaging with file sharing, emoji reactions, and threaded conversations for seamless communication."
  },
  {
    icon: <FileText />,
    title: "Document Collaboration",
    description: "Work together on documents in real-time with version history and commenting features."
  },
  {
    icon: <Users />,
    title: "Team Workspaces",
    description: "Organize your projects with dedicated workspaces, member roles, and permission controls."
  },
  {
    icon: <Shield />,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption, SSO, and compliance certifications."
  },
  {
    icon: <Zap />,
    title: "Lightning Fast",
    description: "Built for speed with real-time updates and instant synchronization across all devices."
  },
  {
    icon: <CheckCircle />,
    title: "Task Management",
    description: "Assign tasks, track progress, and manage deadlines with intuitive project management tools."
  }
];

const steps = [
  {
    title: "Create Your Workspace",
    description: "Set up your team workspace in seconds with our intuitive onboarding process."
  },
  {
    title: "Invite Your Team",
    description: "Add team members and start collaborating immediately with real-time features."
  },
  {
    title: "Start Collaborating",
    description: "Chat, share files, and manage projects all in one seamless platform."
  }
];

const testimonials = [
  {
    initials: "SD",
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    quote: "CollabSpace transformed how our remote team collaborates. We've seen a 40% increase in productivity since switching."
  },
  {
    initials: "MJ",
    name: "Michael Chen",
    role: "CTO at StartupXYZ",
    quote: "The real-time collaboration features are game-changing. Our development team ships features 50% faster now."
  },
  {
    initials: "ET",
    name: "Emily Rodriguez",
    role: "Design Lead at CreativeCo",
    quote: "Finally, a tool that understands how creative teams work. The document collaboration is incredibly smooth."
  }
];

export default LandingPage;