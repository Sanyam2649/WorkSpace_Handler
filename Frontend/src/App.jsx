import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import WorkspacesPage from './pages/workspaces';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchUser } from './reducer/thunks/userThunk'; 
import OAuthRedirectHandler from './components/oAuthHandler';
import Login from './components/Login';
import SignupFlow from './components/Signup';
import LandingPage from './pages/landingPage';
import ForgotPasswordFlow from './components/forgotpassword';
import { fetchAllWorkspaces } from './reducer/thunks/WorkSpaceThunk';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const userLoading = useSelector((state) => state.user.loading);
  const hasFetched = useRef(false);
  
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token && !user && !userLoading && !hasFetched.current) {
      console.log('🔄 Initial user fetch...');
      hasFetched.current = true;
      dispatch(fetchUser());
    }
  }, [dispatch, user, userLoading]);
  
  useEffect(() => {
    if(user)
    {
      dispatch(fetchAllWorkspaces());
    }
  }, [dispatch , user, userLoading]);
  
  return (
    <Router>
      <div className="App min-h-screen bg-base-100 font-fredoka">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupFlow />} />
          <Route path="/forgot-password" element={<ForgotPasswordFlow/>}/>
          <Route path="/auth-login" element={<OAuthRedirectHandler />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/workspace/:id" element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          } />
          <Route path="/workspace" element={
            <ProtectedRoute>
              <WorkspacesPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;