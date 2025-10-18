import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import WorkspacesPage from './pages/workspaces';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchUser } from './reducer/thunks/userThunk'; 
import OAuthRedirectHandler from './components/oAuthHandler';
import { fetchAllWorkspaces } from './reducer/thunks/WorkSpaceThunk';
import WorkspaceDetail from './subComponent/workSpaceDetail';
import Login from './components/Login';
import SignupFlow from './components/Signup';
import Chat from './components/Chat';
import LandingPage from './pages/landingPage';
import ForgotPasswordFlow from './components/forgotpassword';

function App() {
  const dispatch = useDispatch();  
  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchAllWorkspaces());
  }, [dispatch]);

  return (
    <Router>
      <div className="App min-h-screen bg-base-100 font-fredoka">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupFlow />} />
          <Route path="/forgot-password" element={<ForgotPasswordFlow/>}/>
          <Route path="/auth" element={<Auth />} />
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
          
          {/* Fallback Routes */}
          <Route path="/test" element={<WorkspaceDetail />} />
          <Route path="/" element={<LandingPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;