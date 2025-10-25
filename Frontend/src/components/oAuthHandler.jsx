import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {setUser} from '../reducer/slices/authSlice';
import { useDispatch } from 'react-redux';

const OAuthRedirectHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userEncoded = urlParams.get('user');

    if (accessToken && refreshToken && userEncoded) {
      try {
        // Decode URI component then parse JSON
        const user = JSON.parse(decodeURIComponent(userEncoded));

        // Optional: You can validate it's a proper JWT (basic check)
        const isJWT = (token) =>
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);

        if (!isJWT(accessToken) || !isJWT(refreshToken)) {
          throw new Error('Invalid token format');
        }

        // Store in sessionStorage
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        dispatch(setUser(user));

        console.log('✅ Tokens and user info stored in sessionStorage.');
        navigate('/dashboard');
      } catch (err) {
        console.error('❌ Failed to parse user data:', err);
        navigate('/login');
      }
    } else {
      console.warn('❗ Missing one or more query parameters.');
      navigate('/login');
    }
  }, [navigate]);

  return <p>Signing you in...</p>;
};

export default OAuthRedirectHandler;
