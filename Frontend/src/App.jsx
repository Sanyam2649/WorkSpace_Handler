import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import {useDispatch, useSelector } from 'react-redux';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import WorkspacesPage from './pages/workspaces';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
// import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchUser } from './reducer/thunks/userThunk'; 
import './App.css';
import './styles/auth.css';
import OAuthRedirectHandler from './components/oAuthHandler';


function App() {
  const dispatch = useDispatch();
  const { value: user } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const isAuth = Boolean(user);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/auth" 
            element={isAuth ? <Navigate to="/dashboard" replace /> : <Auth />} 
          />
          <Route path="/login" element={<OAuthRedirectHandler />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><WorkspacesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
          <Route path="/" element={isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
