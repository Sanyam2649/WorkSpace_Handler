// components/WorkspacesPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceForm from '../components/workspaceForm';
import { 
  fetchAllWorkspaces, 
  deleteExistingWorkspace 
} from '../reducer/thunks/WorkSpaceThunk';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  FolderOpen,
  Loader2,
  AlertCircle,
  Search,
  FileText,
  X
} from 'lucide-react';

// Modal Component (as provided)
const Modal = ({ isOpen, onClose, children, title, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-base-100 rounded-3xl shadow-2xl border-2 border-base-300 w-full ${sizeClasses[size]} max-h-[94vh] overflow-hidden animate-in zoom-in duration-300 scale-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-8 border-b-2 border-base-300 bg-gradient-to-r from-base-200 to-base-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <FileText className="text-primary-content" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-base-content leading-tight">
                  {title}
                </h2>
                <p className="text-base-content/60 text-sm mt-1">
                  {size === 'sm' ? 'Quick action' : size === 'md' ? 'Standard view' : 'Detailed view'}
                </p>
              </div>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error border-2 border-transparent hover:border-error/30 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={20} className="text-base-content/70" />
              </button>
            )}
          </div>
        )}
        
        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(94vh-120px)]">
          <div className="p-8 space-y-6">
            {children}
          </div>
        </div>

        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-primary/5 to-secondary/5 -z-10" />
      </div>
    </div>
  );
};

export default function WorkspacesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { workspacesList, workspacesLoading, workspacesError } = useSelector(
    (state) => state.workspace
  );
  const user = useSelector((state) => state.user.value);

  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    try {
      await dispatch(deleteExistingWorkspace(workspaceId)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleView = (id) => navigate(`/workspace/${id}`);

  const filteredWorkspaces = workspacesList.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-error to-warning text-error-content';
      case 'editor':
        return 'bg-gradient-to-r from-info to-accent text-info-content';
      case 'viewer':
        return 'bg-gradient-to-r from-success to-accent text-success-content';
      default:
        return 'bg-gradient-to-r from-neutral to-base-300 text-neutral-content';
    }
  };

  if (workspacesLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-base-content text-lg">Loading workspaces...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  My Workspaces
                </h1>
                <p className="text-base-content/70 text-lg">
                  Manage your collaborative spaces and projects
                </p>
              </div>
              <button
                onClick={handleAddWorkspace}
                className="group bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Workspace
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-base-content placeholder-base-content/50"
              />
            </div>
          </div>

          {/* Error Message */}
          {workspacesError && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error" />
              <p className="text-error">{workspacesError}</p>
            </div>
          )}

          {/* Workspace Form Modal */}
          <Modal
            isOpen={showForm}
            onClose={handleCancelForm}
            title={editingWorkspace ? "Edit Workspace" : "Create New Workspace"}
            size="md"
          >
            <WorkspaceForm
              workspace={editingWorkspace}
              onClose={handleCancelForm}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Delete Workspace"
            size="sm"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-error/10 rounded-full">
                  <AlertCircle className="w-12 h-12 text-error" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-base-content">
                  Confirm Deletion
                </h3>
                <p className="text-base-content/70">
                  Are you sure you want to delete <strong className="text-error">"{deleteConfirm?.name}"</strong>? 
                  This action cannot be undone and all associated data will be lost.
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 bg-base-300 text-base-content rounded-xl hover:bg-base-400 transition-all duration-200 font-semibold border-2 border-transparent hover:border-base-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm?._id)}
                  className="px-6 py-3 bg-error text-error-content rounded-xl hover:bg-error/90 transition-all duration-200 font-semibold border-2 border-transparent hover:border-error/30 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Workspace
                </button>
              </div>
            </div>
          </Modal>

          {/* Workspaces List */}
          {!showForm && (
            <div className="space-y-6">
              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-12 bg-base-100 rounded-2xl border border-base-300">
                  <FolderOpen className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-base-content mb-2">
                    {searchTerm ? 'No matching workspaces' : 'No workspaces yet'}
                  </h3>
                  <p className="text-base-content/70 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Create your first workspace to get started'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddWorkspace}
                      className="bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Create Workspace
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredWorkspaces.map((ws) => {
                    const role = getUserRole(ws);
                    return (
                      <div
                        key={ws._id}
                        className="group bg-base-100 rounded-2xl border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
                      >
                        <div 
                          className="p-6"
                          onClick={() => handleView(ws._id)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                                <FolderOpen className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors">
                                  {ws.name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(role)}`}>
                                  {role}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                            {ws.description || 'No description provided'}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-base-content/50">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{ws.members?.length || 0} members</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-base-200 border-t border-base-300 flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(ws._id);
                            }}
                            className="p-2 text-info hover:bg-info/10 rounded-lg transition-colors"
                            title="View Workspace"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {(role === 'Admin' || role === 'Editor') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(ws);
                              }}
                              className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                              title="Edit Workspace"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          
                          {role === 'Admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(ws);
                              }}
                              className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="Delete Workspace"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}