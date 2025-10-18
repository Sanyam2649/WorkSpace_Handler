import { useState ,useEffect } from 'react';
import { login, setAuth, getAndClearLastPage, isAuthenticated } from '../api';
import { Eye, EyeOff , ChevronLeft , ChevronRight , UserRound} from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
const testimonials = [
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682295/freepik__the-style-is-modern-and-it-is-a-detailed-illustrat__61814_s0g4kc.png",
    quote: "Collaborate smarter, deliver faster: cloud synergy at your fingertips.",
  },
  {
    image: "https://res.cloudinary.com/dhahajyth/image/upload/v1760682295/freepik__realtime-data-insights-a-network-of-connections-vi__61815_dsy0tx.png",
    quote: "Transform decisions with live data—your team’s success is one dashboard away.",
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
          navigate(lastPage);
        } catch (error) {
          console.error('Error parsing OAuth data:', error);
        }
      }
    }, [searchParams, navigate]);
  
  
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
    try {
      const response = await login(formData.identifier, formData.password);
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/google`;
  };
  
    const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/github`;
  };
  
  const handleSignup = () => {
    navigate('/signup');
  }


  const testimonial = testimonials[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex size-full  flex flex-row-reverse bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="relative w-[54%] bg-[#F3F4FF] flex flex-col items-center justify-center">
      <img
        src={testimonial.image}
        alt="Smart Locker"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/0 to-blue-50/60" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[95%]">
            <div className="bg-none rounded-2xl shadow-lg p-7 flex flex-col gap-4">
              <p className="text-xl font-semibold leading-snug text-blue-800">
                {testimonial.quote}
              </p>
            </div>
          </div>
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
            aria-label="Next Testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="w-[46%] flex items-center justify-center px-12 py-12 bg-white">
          <div className="w-full max-w-md flex flex-col">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                {/* Screenshot logo */}
                <UserRound width="34" height="34" viewBox="0 0 24 24" fill="none"/>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mt-2">Log in to your account</h2>
            </div>
            {/* Form */}
            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-3">
              <input
                type="text"
                name="identifier"
                placeholder="Enter your email or Phone"
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username"
                required
                className="rounded-lg border border-gray-200 px-4 py-3 bg-gray-50 focus:border-blue-400 outline-none"
              />
              <div className="relative rounded-lg border border-gray-200">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="px-4 py-3 pr-12 bg-gray-50 focus:border-blue-400 outline-none"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mt-1 mb-1">
                <label className="flex gap-2 items-center">
                  <input type="checkbox" className="accent-blue-600" />
                  <span className="text-gray-500">Remember me</span>
                </label>
                <a href='/forgot-password' className="text-blue-500 hover:underline font-medium">Forgot password</a>
              </div>
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition text-white text-base font-semibold py-3 rounded-lg shadow w-full mt-2 ${
                  loading ? 'bg-blue-300 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign in'}
              </button>
            </form>
            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={
                "w-full flex items-center justify-center gap-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow hover:bg-gray-50 transition mt-2 text-base"
              }
              disabled={loading}
            >
<svg width="24px" height="24px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000" stroke="#000000" stroke-width="0.00262" transform="matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg>
              Sign in with Google
            </button>
            
               <button
              type="button"
              onClick={handleGitHubLogin}
              className={
                "w-full flex items-center justify-center gap-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow hover:bg-gray-50 transition mt-2 text-base"
              }
              disabled={loading}
            >
           <svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" fill-rule="evenodd" d="M8 1C4.133 1 1 4.13 1 7.993c0 3.09 2.006 5.71 4.787 6.635.35.064.478-.152.478-.337 0-.166-.006-.606-.01-1.19-1.947.423-2.357-.937-2.357-.937-.319-.808-.778-1.023-.778-1.023-.635-.434.048-.425.048-.425.703.05 1.073.72 1.073.72.624 1.07 1.638.76 2.037.582.063-.452.244-.76.444-.935-1.554-.176-3.188-.776-3.188-3.456 0-.763.273-1.388.72-1.876-.072-.177-.312-.888.07-1.85 0 0 .586-.189 1.924.716A6.711 6.711 0 018 4.381c.595.003 1.194.08 1.753.236 1.336-.905 1.923-.717 1.923-.717.382.963.142 1.674.07 1.85.448.49.72 1.114.72 1.877 0 2.686-1.638 3.278-3.197 3.45.251.216.475.643.475 1.296 0 .934-.009 1.688-.009 1.918 0 .187.127.404.482.336A6.996 6.996 0 0015 7.993 6.997 6.997 0 008 1z" clip-rule="evenodd"></path></g></svg>
              Sign in with Github
            </button>
            <div className="text-center mt-5 text-gray-600 text-base">
              Don't have an account?{' '}
              <button type="button" className="text-blue-600 hover:underline" onClick={handleSignup}>
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
