import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { saveLastPage } from '../api';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.value);
  const userLoading = useSelector((state) => state.user.loading);
  const accessToken = sessionStorage.getItem('accessToken');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userLoading && (!user || !accessToken)) {
      saveLastPage(location.pathname + location.search);
      navigate('/login');
    }
  }, [user, accessToken, userLoading, navigate, location]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-4 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user || !accessToken) {
    return null;
  }

  return children;
};

export default ProtectedRoute;