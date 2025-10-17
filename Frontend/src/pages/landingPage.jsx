import React from 'react';
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
  Play,
  Github,
  Twitter,
  Linkedin,
  Calendar,
  Target,
  TrendingUp,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Rocket className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                CollabSpace
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Features</a>
              <a href="#how-it-works" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">How It Works</a>
              <a href="#testimonials" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Testimonials</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Contact</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="px-6 py-2.5 text-slate-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm border border-transparent hover:border-slate-300 rounded-lg"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg shadow-md font-medium text-sm border border-blue-500/30 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6 border border-blue-200 shadow-sm">
              <Star size={16} className="fill-blue-500 text-blue-500" />
              Trusted by 10,000+ teams worldwide
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-poppins">
              Collaborate, Create, 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Conquer</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              The all-in-one workspace for modern teams. Chat, share documents, and manage projects in one seamless platform designed for productivity.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-80">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg border border-slate-200/60 bg-white/50 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 font-poppins">{stat.value}</div>
                  <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-slate-800">Everything Your Team Needs</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide">
              Powerful features designed to boost your team's productivity and collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden"
              >
                <div className="card bg-white border-2 border-slate-200/60 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl relative z-10">
                  <div className="card-body p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className="card-title text-2xl font-bold mb-3 text-slate-800 font-poppins">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-light">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-slate-800">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide">
              Get started in minutes and transform how your team collaborates
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg border border-blue-500/30">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-1/2 -z-10" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 font-poppins">{step.title}</h3>
                <p className="text-slate-600 font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Target size={48} className="text-white mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2 font-poppins">95%</div>
              <div className="text-white/80 font-light">Faster Project Completion</div>
            </div>
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <TrendingUp size={48} className="text-white mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2 font-poppins">3x</div>
              <div className="text-white/80 font-light">Increase in Productivity</div>
            </div>
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Calendar size={48} className="text-white mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2 font-poppins">40%</div>
              <div className="text-white/80 font-light">Fewer Meetings Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-slate-800">What Our Users Say</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide">
              Join thousands of satisfied teams transforming their collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border-2 border-slate-200/60 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm font-light">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 italic font-light leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-poppins text-slate-800">Get In Touch</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light tracking-wide">
              Have questions? We'd love to hear from you
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-center gap-4 p-6 border-2 border-slate-200/60 rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Email Us</div>
                  <div className="text-slate-600 font-light">hello@collabspace.com</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 border-2 border-slate-200/60 rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Call Us</div>
                  <div className="text-slate-600 font-light">+1 (555) 123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 border-2 border-slate-200/60 rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Visit Us</div>
                  <div className="text-slate-600 font-light">123 Innovation Drive, San Francisco, CA 94107</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50/50 border-2 border-slate-200/60 rounded-2xl p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl shadow-lg font-semibold text-base border border-blue-500/30"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-poppins">
            Ready to Transform Your Team's Collaboration?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light tracking-wide">
            Join thousands of teams already using CollabSpace to work smarter and faster.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl shadow-lg font-semibold text-base border border-white/30"
          >
            Start Your Free Trial
            <Rocket size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold text-white font-poppins">CollabSpace</span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed">
                The modern workspace for teams that want to achieve more together.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white text-sm tracking-wide">PRODUCT</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Features</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Pricing</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Security</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Updates</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white text-sm tracking-wide">COMPANY</h4>
              <div className="space-y-2">
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">About</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Blog</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Careers</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-light">Press</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white text-sm tracking-wide">CONNECT</h4>
              <div className="flex gap-4 mb-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Github size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                  <Linkedin size={20} />
                </a>
              </div>
              <div className="text-slate-400 text-sm font-light">
                Subscribe to our newsletter
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm font-light">
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
    icon: <MessageCircle size={28} />,
    title: "Real-time Chat",
    description: "Instant messaging with file sharing, emoji reactions, and threaded conversations for seamless communication."
  },
  {
    icon: <FileText size={28} />,
    title: "Document Collaboration",
    description: "Work together on documents in real-time with version history and commenting features."
  },
  {
    icon: <Users size={28} />,
    title: "Team Workspaces",
    description: "Organize your projects with dedicated workspaces, member roles, and permission controls."
  },
  {
    icon: <Shield size={28} />,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption, SSO, and compliance certifications."
  },
  {
    icon: <Zap size={28} />,
    title: "Lightning Fast",
    description: "Built for speed with real-time updates and instant synchronization across all devices."
  },
  {
    icon: <CheckCircle size={28} />,
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