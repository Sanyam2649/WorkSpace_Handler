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
  X,
  Grid3X3,
  List
} from 'lucide-react';
import {useToast} from "../context/useToast";

// Responsive Modal Component
const Modal = ({ isOpen, onClose, children, title, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md mx-2',
    md: 'max-w-2xl mx-2',
    lg: 'max-w-4xl mx-2',
    xl: 'max-w-6xl mx-2',
    full: 'max-w-full mx-2'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-base-100 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-base-300 w-full ${sizeClasses[size]} max-h-[94vh] overflow-hidden animate-in zoom-in duration-300 scale-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-base-300 bg-base-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="text-primary-content" size={16} sm:size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content leading-tight truncate">
                  {title}
                </h2>
                <p className="text-base-content/60 text-xs sm:text-sm mt-0.5 hidden sm:block">
                  {size === 'sm' ? 'Quick action' : size === 'md' ? 'Standard view' : 'Detailed view'}
                </p>
              </div>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error border border-transparent hover:border-error/30 transition-all duration-200 flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={16} sm:size={20} className="text-base-content/70" />
              </button>
            )}
          </div>
        )}
        
        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(94vh-80px)] sm:max-h-[calc(94vh-120px)]">
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Bottom Sheet Component
const MobileBottomSheet = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Container */}
      <div 
        className="relative bg-base-100 rounded-t-2xl shadow-2xl border border-base-300 w-full max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center p-3">
          <div className="w-12 h-1 bg-base-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <FileText className="text-primary-content" size={16} />
            </div>
            <h2 className="text-lg font-bold text-base-content">
              {title}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Close"
          >
            <X size={16} className="text-base-content/70" />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function WorkspacesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { workspacesList, workspacesLoading, workspacesError } = useSelector(
    (state) => state.workspace
  );
  const user = useSelector((state) => state.user.value);

  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        await dispatch(fetchAllWorkspaces()).unwrap();
        showToast('Workspaces loaded successfully');
      } catch (error) {
        showToast('Failed to load workspaces', 'error');
      }
    };
    loadWorkspaces();
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
    setShowForm(false);
    setEditingWorkspace(null);
  };

  const handleSubmitSuccess = () => {
    setShowForm(false);
    setEditingWorkspace(null);
    showToast(editingWorkspace ? 'Workspace updated successfully' : 'Workspace created successfully');
  };

  const handleDelete = async (workspaceId) => {
    try {
      await dispatch(deleteExistingWorkspace(workspaceId)).unwrap();
      setDeleteConfirm(null);
      showToast('Workspace deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete workspace', 'error');
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
      <div className="flex flex-col min-h-screen bg-base-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            <p className="text-base-content text-base sm:text-lg">Loading workspaces...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-100">
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                  My Workspaces
                </h1>
                <p className="text-base-content/70 text-sm sm:text-base md:text-lg">
                  Manage your collaborative spaces and projects
                </p>
              </div>
              <button
                onClick={handleAddWorkspace}
                className="group bg-gradient-to-r from-primary to-secondary text-primary-content px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold hover:scale-105 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Create Workspace</span>
              </button>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-base-100 border border-base-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-base-content placeholder-base-content/50 text-sm sm:text-base"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-base-content/60 text-sm hidden sm:block">View:</span>
                <div className="flex bg-base-200 border border-base-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-content' 
                        : 'text-base-content/60 hover:text-base-content'
                    }`}
                  >
                    <Grid3X3 size={16} sm:size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-content' 
                        : 'text-base-content/60 hover:text-base-content'
                    }`}
                  >
                    <List size={16} sm:size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {workspacesError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error/10 border border-error/20 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error flex-shrink-0" />
              <p className="text-error text-sm sm:text-base">{workspacesError}</p>
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

          {/* Mobile Bottom Sheet for Forms */}
          <MobileBottomSheet
            isOpen={showForm}
            onClose={handleCancelForm}
            title={editingWorkspace ? "Edit Workspace" : "Create Workspace"}
          >
            <WorkspaceForm
              workspace={editingWorkspace}
              onClose={handleCancelForm}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </MobileBottomSheet>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            title="Delete Workspace"
            size="sm"
          >
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <div className="p-3 sm:p-4 bg-error/10 rounded-full">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-error" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-base-content">
                  Confirm Deletion
                </h3>
                <p className="text-base-content/70 text-sm sm:text-base">
                  Are you sure you want to delete <strong className="text-error">"{deleteConfirm?.name}"</strong>? 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2 sm:pt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-base-300 text-base-content rounded-lg sm:rounded-xl hover:bg-base-400 transition-all duration-200 font-semibold border border-transparent hover:border-base-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm?._id)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-error text-error-content rounded-lg sm:rounded-xl hover:bg-error/90 transition-all duration-200 font-semibold border border-transparent hover:border-error/30 flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Workspace
                </button>
              </div>
            </div>
          </Modal>

          {/* Workspaces List */}
          {!showForm && (
            <div className="space-y-4 sm:space-y-6">
              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-base-100 rounded-xl sm:rounded-2xl border border-base-300">
                  <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-base-content/30 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-base-content mb-1 sm:mb-2">
                    {searchTerm ? 'No matching workspaces' : 'No workspaces yet'}
                  </h3>
                  <p className="text-base-content/70 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Create your first workspace to get started'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddWorkspace}
                      className="bg-gradient-to-r from-primary to-secondary text-primary-content px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 font-semibold text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Create Workspace
                    </button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3 sm:space-y-4"
                }>
                  {filteredWorkspaces.map((ws) => {
                    const role = getUserRole(ws);
                    return (
                      <div
                        key={ws._id}
                        className={`group bg-base-100 rounded-xl sm:rounded-2xl border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden ${
                          viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center' : ''
                        }`}
                      >
                        <div 
                          className={`flex-1 p-4 sm:p-6 ${viewMode === 'list' ? 'sm:flex sm:items-center sm:gap-4' : ''}`}
                          onClick={() => handleView(ws._id)}
                        >
                          <div className={`flex items-start justify-between mb-3 ${viewMode === 'list' ? 'sm:mb-0 sm:flex-1' : ''}`}>
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg sm:rounded-xl flex-shrink-0">
                                <FolderOpen className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                                  {ws.name}
                                </h3>
                                <p className="text-base-content/70 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-1">
                                  {ws.description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(role)} flex-shrink-0 ml-2`}>
                              {role}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-base-content/50">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{ws.members?.length || 0} members</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-3 bg-base-200 border-t border-base-300 flex justify-end gap-1 sm:gap-2 ${
                          viewMode === 'list' ? 'sm:border-t-0 sm:border-l sm:px-3 sm:py-4' : ''
                        }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(ws._id);
                            }}
                            className="p-1.5 sm:p-2 text-info hover:bg-info/10 rounded-lg transition-colors"
                            title="View Workspace"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          
                          {(role === 'Admin' || role === 'Editor') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(ws);
                              }}
                              className="p-1.5 sm:p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                              title="Edit Workspace"
                            >
                              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          
                          {role === 'Admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(ws);
                              }}
                              className="p-1.5 sm:p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="Delete Workspace"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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