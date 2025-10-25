import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { saveLastPage } from '../api';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.value);
  const accessToken = sessionStorage.getItem('accessToken');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !accessToken) {
      saveLastPage(location.pathname + location.search);
      navigate('/login');
    }
  }, [user, accessToken, navigate, location]);

  if (!user || !accessToken) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
