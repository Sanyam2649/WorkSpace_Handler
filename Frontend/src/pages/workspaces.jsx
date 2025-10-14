// components/WorkspacesPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceForm from '../components/workspaceForm';
import ChatButton from '../components/chatButton';
import { 
  fetchAllWorkspaces, 
  deleteExistingWorkspace 
} from '../reducer/thunks/WorkSpaceThunk';

export default function WorkspacesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { workspacesList, workspacesLoading, workspacesError } = useSelector(
    (state) => state.workspace
  );
  const user = useSelector((state) => state.user.value);

  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchAllWorkspaces());
  }, [dispatch]);

  const getUserRole = (workspace) => {
    const member = workspace.members.find((m) => m.user === user?._id);
    return member?.roles?.[0] || 'Viewer';
  };

  const handleAddWorkspace = () => {
    setEditingWorkspace(null);
    setShowForm(true);
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingWorkspace(null);
    setShowForm(false);
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    setEditingWorkspace(null);
  };

  const handleDelete = async (workspaceId) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await dispatch(deleteExistingWorkspace(workspaceId)).unwrap();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete workspace');
    }
  };

  const handleView = (id) => navigate(`/workspace/${id}`);

  if (workspacesLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Loading workspaces...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Workspaces</h1>
            <button
              onClick={handleAddWorkspace}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
            >
              + Add Workspace
            </button>
          </div>

          {workspacesError && <p className="text-red-600 mb-4">{workspacesError}</p>}

          {showForm ? (
            <div className="bg-white p-6 rounded shadow-md border border-gray-200">
              <WorkspaceForm
                workspace={editingWorkspace}
                onClose={handleCancelForm}
                onSubmitSuccess={handleSubmitSuccess}
              />
            </div>
          ) : workspacesList.length === 0 ? (
            <p className="text-gray-500">No workspaces available.</p>
          ) : (
            <div className="overflow-auto bg-white rounded shadow border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workspacesList.map((ws) => {
                    const role = getUserRole(ws);
                    return (
                      <tr
                        key={ws._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleView(ws._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{ws.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ws.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{role}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          {(role === 'Admin' || role === 'Editor') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(ws);
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                          )}
                          {role === 'Admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ws._id);
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <ChatButton/>
        </main>
        <Footer />
      </div>
    </div>
  );
}