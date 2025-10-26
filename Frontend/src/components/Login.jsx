import { useState, useEffect } from 'react';
import { login, setAuth, getAndClearLastPage, isAuthenticated } from '../api';
import { Eye, EyeOff, ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setUser } from '../reducer/slices/authSlice';
import { useDispatch } from 'react-redux';
import { useToast } from '../context/useToast';

const testimonials = [
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682295/freepik__the-style-is-modern-and-it-is-a-detailed-illustrat__61814_s0g4kc.png",
    quote: "Collaborate smarter, deliver faster: cloud synergy at your fingertips.",
  },
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682295/freepik__realtime-data-insights-a-network-of-connections-vi__61815_dsy0tx.png",
    quote: "Transform decisions with live data—your team's success is one dashboard away.",
  },
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682293/freepik__the-style-is-modern-and-it-is-a-detailed-illustrat__61816_ombm3a.png",
    quote: "Innovation thrives when every project connects ideas and people seamlessly.",
  },
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682296/freepik__i-want-images-related-to-workspace-team-collaborat__61813_pzcjlz.png",
    quote: "Workspace collaboration reimagined—where teamwork makes vision reality.",
  }
];

const Login = () => {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated()) {
      const lastPage = getAndClearLastPage();
      navigate(lastPage);
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const user = searchParams.get('user');

    if (accessToken && refreshToken && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        setAuth(accessToken, refreshToken, userData);
        window.history.replaceState({}, document.title, window.location.pathname);
        const lastPage = getAndClearLastPage();
        showToast('Successfully logged in via OAuth!', 'success');
        navigate(lastPage);
      } catch (error) {
        console.error('Error parsing OAuth data:', error);
        showToast('Failed to process OAuth login', 'error');
      }
    }
  }, [searchParams, navigate, showToast]);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate form
    if (!formData.identifier.trim() || !formData.password.trim()) {
      showToast('Please fill in all fields', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.identifier, formData.password);
      setAuth(response.accessToken, response.refreshToken, response.user);
      
      dispatch(setUser(response.user));
      showToast('Successfully logged in!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
-      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to Google...', 'info');
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/google`;
  };
  
  const handleGitHubLogin = () => {
    showToast('Redirecting to GitHub...', 'info');
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/github`;
  };
  
  const handleSignup = () => {
    showToast('Redirecting to signup...', 'info');
    navigate('/signup');
  }

  const handleForgotPassword = () => {
    showToast('Redirecting to password recovery...', 'info');
    navigate('/forgot-password');
  }

  const testimonial = testimonials[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="flex flex-col lg:flex-row-reverse w-full max-w-6xl bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Testimonial Section */}
        <div className="relative w-full lg:w-[54%] h-64 md:h-80 lg:h-auto bg-[#F3F4FF] flex flex-col items-center justify-center">
          <img
            src={testimonial.image}
            alt="Smart Locker"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.85)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/0 to-blue-50/60" />
          
          {/* Testimonial Content - Hidden on mobile, visible on tablet and up */}
          <div className="absolute bottom-4 md:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] lg:w-[95%] hidden sm:block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 lg:p-7 flex flex-col gap-3 md:gap-4">
              <p className="text-sm md:text-lg lg:text-xl font-semibold leading-snug text-blue-800 text-center">
                {testimonial.quote}
              </p>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 md:p-2 shadow hover:bg-gray-100 transition-colors"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 md:p-2 shadow hover:bg-gray-100 transition-colors"
            aria-label="Next Testimonial"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Login Form Section */}
        <div className="w-full lg:w-[46%] flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 bg-white">
          <div className="w-full max-w-md flex flex-col">
            {/* Logo */}
            <div className="mb-6 md:mb-8 flex flex-col items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <UserRound className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mt-2">Log in to your account</h2>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 text-center bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5 mb-4">
              <input
                type="text"
                name="identifier"
                placeholder="Enter your email or Phone"
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 focus:border-blue-400 outline-none transition-colors text-sm md:text-base"
              />
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 bg-gray-50 focus:border-blue-400 outline-none transition-colors text-sm md:text-base"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs md:text-sm mt-1 mb-1">
                <label className="flex gap-2 items-center cursor-pointer">
                  <input type="checkbox" className="accent-blue-600 w-4 h-4" />
                  <span className="text-gray-500">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Forgot password
                </button>
              </div>
              
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition text-white text-sm md:text-base font-semibold py-3 rounded-lg shadow w-full mt-2 ${
                  loading ? 'bg-blue-300 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign in'}
              </button>
            </form>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg shadow hover:bg-gray-50 transition text-sm md:text-base"
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="-3 0 262 262" fill="#000000">
                  <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path>
                  <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path>
                  <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path>
                  <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path>
                </svg>
                Sign in with Google
              </button>
              
              <button
                type="button"
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg shadow hover:bg-gray-50 transition text-sm md:text-base"
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#000000">
                  <path fill="#000000" fillRule="evenodd" d="M8 1C4.133 1 1 4.13 1 7.993c0 3.09 2.006 5.71 4.787 6.635.35.064.478-.152.478-.337 0-.166-.006-.606-.01-1.19-1.947.423-2.357-.937-2.357-.937-.319-.808-.778-1.023-.778-1.023-.635-.434.048-.425.048-.425.703.05 1.073.72 1.073.72.624 1.07 1.638.76 2.037.582.063-.452.244-.76.444-.935-1.554-.176-3.188-.776-3.188-3.456 0-.763.273-1.388.72-1.876-.072-.177-.312-.888.07-1.85 0 0 .586-.189 1.924.716A6.711 6.711 0 018 4.381c.595.003 1.194.08 1.753.236 1.336-.905 1.923-.717 1.923-.717.382.963.142 1.674.07 1.85.448.49.72 1.114.72 1.877 0 2.686-1.638 3.278-3.197 3.45.251.216.475.643.475 1.296 0 .934-.009 1.688-.009 1.918 0 .187.127.404.482.336A6.996 6.996 0 0015 7.993 6.997 6.997 0 008 1z" clipRule="evenodd"></path>
                </svg>
                Sign in with Github
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6 text-gray-600 text-sm md:text-base">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="text-blue-600 hover:underline font-medium" 
                onClick={handleSignup}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Login;