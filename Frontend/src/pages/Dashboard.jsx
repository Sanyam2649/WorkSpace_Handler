import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceForm from '../components/workspaceForm';
import { fetchUser } from '../reducer/thunks/userThunk'; // Updated import path
import { fetchAllWorkspaces, deleteExistingWorkspace } from '../reducer/thunks/WorkSpaceThunk'; // Updated imports
import ChatButton from '../components/chatButton';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get data from Redux store
  const user = useSelector((state) => state.user.value);
  const { workspacesList, workspacesLoading, workspacesError } = useSelector(
    (state) => state.workspace
  );

  const [workspaceFormOpen, setWorkspaceFormOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Fetch all workspaces using Redux
  useEffect(() => {
    dispatch(fetchAllWorkspaces());
  }, [dispatch]);

  // Handlers
  const handleCreateWorkspaceClick = () => {
    setEditingWorkspace(null);
    setWorkspaceFormOpen(true);
  };

  const handleEditWorkspaceClick = (workspace) => {
    setEditingWorkspace(workspace);
    setWorkspaceFormOpen(true);
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await dispatch(deleteExistingWorkspace(workspaceId)).unwrap();
      // Workspace is automatically removed from Redux state
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      alert(err.message || 'Failed to delete workspace');
    }
  };

  const handleViewWorkspace = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const closeWorkspaceForm = () => {
    setEditingWorkspace(null);
    setWorkspaceFormOpen(false);
  };

  // Handle workspace form submission success
  const handleWorkspaceSubmitSuccess = () => {
    closeWorkspaceForm();
    // Data is automatically updated in Redux store
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome back,{' '}
            <span className="text-indigo-600">
              {user?.firstName || user?.username || 'User'}
            </span>
            !
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Here's what's happening with your workspaces today.
          </p>

          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Your Workspaces</h2>
              <button
                onClick={handleCreateWorkspaceClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold shadow"
              >
                + Create Workspace
              </button>
            </div>

            {workspacesLoading ? (
              <p className="text-gray-500">Loading workspaces...</p>
            ) : workspacesError ? (
              <p className="text-red-600 font-medium">{workspacesError}</p>
            ) : workspacesList.length === 0 ? (
              <p className="text-gray-500">
                No workspaces yet. Create your first workspace to get started.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 overflow-auto">
                {workspacesList.map((ws) => (
                  <li
                    key={ws._id}
                    className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded p-2"
                  >
                    <div onClick={() => handleViewWorkspace(ws._id)} className="flex-1">
                      <h3 className="text-xl font-semibold text-indigo-700">{ws.name}</h3>
                      <p className="text-gray-600">
                        {ws.description || 'No description available'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditWorkspaceClick(ws)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkspace(ws._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
             <ChatButton/>
          </section>
        </main>
       
        <Footer />

        {workspaceFormOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg relative">
              <button
                onClick={closeWorkspaceForm}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold"
                aria-label="Close workspace form"
              >
                ×
              </button>
              <WorkspaceForm 
                workspace={editingWorkspace} 
                onClose={closeWorkspaceForm}
                onSubmitSuccess={handleWorkspaceSubmitSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}