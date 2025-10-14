import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { isAuthenticated, setAuth, getAndClearLastPage } from '../api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const handleLoginSuccess = (redirectPath) => {
    navigate(redirectPath);
  };

  const handleSignupSuccess = (redirectPath) => {
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        {isLogin ? (
          <Login
            onSwitchToSignup={() => setIsLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Signup
            onSwitchToLogin={() => setIsLogin(true)}
            onSignupSuccess={handleSignupSuccess}
          />
        )}
    </div>
  );
};

export default Auth;
