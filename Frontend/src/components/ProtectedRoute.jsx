import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, saveLastPage } from '../api';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      saveLastPage(location.pathname + location.search);
      navigate('/auth');
    }
  }, [navigate, location]);

  // If not authenticated, don't render children
  if (!isAuthenticated()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
