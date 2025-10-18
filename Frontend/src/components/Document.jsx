import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDocument, 
  updateExistingDocument, 
  deleteExistingDocument,
  shareDocumentThunk,
  addDocumentMemberThunk,
  removeDocumentFilesThunk,
  rollbackDocumentThunk
} from '../reducer/thunks/documentThunk';
import { clearCurrentDocument } from '../reducer/slices/documentSlice';
import {
  Edit3,
  Save,
  X,
  Share2,
  History,
  Trash2,
  FileText,
  Download,
  Users,
  Plus,
  Eye,
  Clock,
  User,
  Shield,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  RotateCcw,
  MoreVertical,
  Search
} from 'lucide-react';

const Document = ({ documentId, onClose, onUpdate }) => {
  const dispatch = useDispatch();
  const { currentDocument, loading, updating, error } = useSelector(
    (state) => state.documents
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Viewer');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchDocument(documentId));
    }

    return () => {
      dispatch(clearCurrentDocument());
    };
  }, [documentId, dispatch]);

  useEffect(() => {
    if (currentDocument) {
      setEditData({ 
        title: currentDocument.title, 
        content: currentDocument.content 
      });
    }
  }, [currentDocument]);

  const toggleEditing = () => {
    if (isEditing) {
      setEditData({ 
        title: currentDocument.title, 
        content: currentDocument.content 
      });
    }
    setIsEditing(!isEditing);
    setShowMobileMenu(false);
  };

  const saveChanges = async () => {
    try {
      const updatedDoc = await dispatch(updateExistingDocument({
        documentId,
        documentData: editData,
        files: selectedFiles
      })).unwrap();
      
      setIsEditing(false);
      setSelectedFiles(null);
      if (onUpdate) onUpdate(updatedDoc);
    } catch (err) {
      console.error('Failed to update document:', err);
    }
  };

  const deleteDoc = async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await dispatch(deleteExistingDocument(documentId)).unwrap();
        onClose && onClose();
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
    setShowMobileMenu(false);
  };

  const shareDoc = async () => {
    try {
      await dispatch(shareDocumentThunk({
        documentId,
        userIds: shareUsers
      })).unwrap();
      
      setShowShareModal(false);
      setShareUsers([]);
      dispatch(fetchDocument(documentId));
    } catch (err) {
      console.error('Failed to share document:', err);
    }
  };

  const addMember = async () => {
    if (!newMemberId.trim()) return;
    
    try {
      await dispatch(addDocumentMemberThunk({
        documentId,
        userId: newMemberId.trim(),
        role: newMemberRole
      })).unwrap();
      
      setNewMemberId('');
      setNewMemberRole('Viewer');
      dispatch(fetchDocument(documentId));
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const removeFile = async (publicId) => {
    try {
      await dispatch(removeDocumentFilesThunk({
        documentId,
        fileIds: [publicId]
      })).unwrap();
      
      dispatch(fetchDocument(documentId));
    } catch (err) {
      console.error('Failed to remove file:', err);
    }
  };

  const rollbackVersion = async (versionIndex) => {
    try {
      await dispatch(rollbackDocumentThunk({
        documentId,
        versionIndex
      })).unwrap();
      
      dispatch(fetchDocument(documentId));
      setShowVersionHistory(false);
    } catch (err) {
      console.error('Failed to rollback version:', err);
    }
  };

  const handleFileInput = (e) => setSelectedFiles(e.target.files);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-base-content/60 text-sm sm:text-base">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-error/10 border border-error/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl m-4">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <AlertCircle size={20} className="text-error" />
          <h3 className="text-lg font-semibold text-error-content">Error Loading Document</h3>
        </div>
        <p className="text-error-content/80 mb-4 text-sm sm:text-base">{error}</p>
        <button 
          onClick={() => dispatch(fetchDocument(documentId))} 
          className="btn btn-error btn-sm sm:btn-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="card bg-base-200 border border-base-300 p-6 sm:p-8 text-center rounded-xl sm:rounded-2xl m-4">
        <FileText size={40} className="text-base-content/30 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-base-content mb-2">Document Not Found</h3>
        <p className="text-base-content/60 text-sm sm:text-base">The document you're looking for doesn't exist or access is denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-base-200 rounded-xl sm:rounded-2xl border border-base-300">
        <div className="flex-1 space-y-2 sm:space-y-3">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={e => setEditData({...editData, title: e.target.value})}
              placeholder="Document title"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-base-100 border border-base-300 rounded-lg sm:rounded-xl text-base-content placeholder-base-content/50 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 text-lg sm:text-xl font-bold"
            />
          ) : (
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content break-words">
              {currentDocument.title}
            </h1>
          )}
          
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-base-content/60">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar size={14} />
              <span>Created: {new Date(currentDocument.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <History size={14} />
              <span>Updated: {new Date(currentDocument.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <FileText size={14} />
              <span>Versions: {currentDocument.versions?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <button
            onClick={toggleEditing}
            disabled={updating}
            className="btn btn-outline btn-sm border border-primary/20 hover:border-primary hover:bg-primary/10 text-primary rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            <span className="hidden lg:inline">{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>

          {isEditing && (
            <button
              onClick={saveChanges}
              disabled={updating}
              className="btn btn-primary btn-sm text-primary-content rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span className="hidden lg:inline">Save</span>
            </button>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            disabled={updating}
            className="btn btn-outline btn-sm border border-info/20 hover:border-info hover:bg-info/10 text-info rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <Share2 size={16} />
            <span className="hidden lg:inline">Share</span>
          </button>

          <button
            onClick={() => setShowVersionHistory(true)}
            disabled={updating}
            className="btn btn-outline btn-sm border border-warning/20 hover:border-warning hover:bg-warning/10 text-warning rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <History size={16} />
            <span className="hidden lg:inline">History</span>
          </button>

          <button
            onClick={deleteDoc}
            disabled={updating}
            className="btn btn-outline btn-sm border border-error/20 hover:border-error hover:bg-error/10 text-error rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span className="hidden lg:inline">Delete</span>
          </button>
        </div>

        {/* Mobile Actions Menu */}
        <div className="sm:hidden flex justify-between items-center w-full">
          <div className="flex gap-2">
            <button
              onClick={toggleEditing}
              disabled={updating}
              className="btn btn-outline btn-sm border border-primary/20 hover:border-primary hover:bg-primary/10 text-primary rounded-lg"
            >
              {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            </button>
            
            {isEditing && (
              <button
                onClick={saveChanges}
                disabled={updating}
                className="btn btn-primary btn-sm text-primary-content rounded-lg"
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMobileMenu && (
              <div className="absolute right-0 top-12 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={() => { setShowShareModal(true); setShowMobileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-base-200 rounded-t-lg"
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={() => { setShowVersionHistory(true); setShowMobileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-base-200"
                >
                  <History size={14} />
                  History
                </button>
                <button
                  onClick={deleteDoc}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-base-200 text-error rounded-b-lg"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card bg-base-100 border border-base-300 rounded-xl sm:rounded-2xl overflow-hidden">
        {isEditing ? (
          <textarea
            rows={8}
            value={editData.content}
            onChange={e => setEditData({...editData, content: e.target.value})}
            placeholder="Write your document content here..."
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-base-100 border-0 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-0 resize-vertical min-h-48 text-sm sm:text-base"
          />
        ) : (
          <div className="px-4 sm:px-6 py-3 sm:py-4 min-h-48 max-h-80 overflow-y-auto">
            <div className="prose prose-sm sm:prose-base max-w-none text-base-content">
              {currentDocument.content || (
                <div className="text-center text-base-content/60 py-8 sm:py-12">
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm sm:text-base">No content available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="border-t border-base-300 p-3 sm:p-4 bg-base-200">
            <label
              htmlFor="file-upload"
              className="btn btn-outline btn-sm border border-accent/20 hover:border-accent hover:bg-accent/10 text-accent rounded-lg cursor-pointer"
            >
              <Upload size={16} className="mr-1 sm:mr-2" />
              Add Files
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            {selectedFiles && (
              <div className="mt-2 space-y-1">
                {Array.from(selectedFiles).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-base-100 rounded text-xs">
                    <FileText size={12} className="text-base-content/60" />
                    <span className="text-base-content truncate flex-1">{file.name}</span>
                    <span className="text-base-content/40 text-xs">
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Files List */}
      {currentDocument.files?.length > 0 && (
        <div className="card bg-base-200 border border-base-300 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-base-content mb-3 sm:mb-4">
            <FileText size={18} />
            Attached Files ({currentDocument.files.length})
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {currentDocument.files.map(file => (
              <div key={file.publicId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-100 border border-base-300 rounded-lg hover:border-primary/30 transition-all duration-200 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FileText size={16} className="text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base-content text-sm truncate">{file.originalName}</p>
                    <p className="text-xs text-base-content/60">{file.mimetype}</p>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 self-end sm:self-auto">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-xs text-info hover:bg-info/10 rounded"
                  >
                    <Eye size={12} />
                  </a>
                  <a
                    href={file.url}
                    download
                    className="btn btn-ghost btn-xs text-success hover:bg-success/10 rounded"
                  >
                    <Download size={12} />
                  </a>
                  <button
                    onClick={() => removeFile(file.publicId)}
                    disabled={updating}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Section */}
      {currentDocument.permissions?.length > 0 && (
        <div className="card bg-base-200 border border-base-300 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-base-content mb-3 sm:mb-4">
            <Users size={18} />
            Document Members ({currentDocument.permissions.length})
          </h3>
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {currentDocument.permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-base-100 border border-base-300 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={12} className="text-primary-content" />
                  </div>
                  <span className="font-medium text-base-content text-sm sm:text-base">
                    {perm.user?.firstName} {perm.user?.lastName}
                  </span>
                </div>
                <span className={`badge badge-sm ${
                  perm.role === 'Admin' ? 'badge-secondary' :
                  perm.role === 'Editor' ? 'badge-primary' :
                  'badge-outline'
                }`}>
                  <Shield size={10} className="mr-1" />
                  {perm.role}
                </span>
              </div>
            ))}
          </div>
          
          {/* Add Member Form */}
          <div className="border-t border-base-300 pt-3 sm:pt-4">
            <h4 className="flex items-center gap-2 text-sm sm:text-md font-semibold text-base-content mb-2 sm:mb-3">
              <Plus size={14} />
              Add New Member
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={newMemberId}
                onChange={e => setNewMemberId(e.target.value)}
                placeholder="Enter user ID"
                className="flex-1 px-3 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder-base-content/50 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 text-sm"
              />
              <select
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
                className="px-3 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 text-sm"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                onClick={addMember}
                disabled={updating || !newMemberId.trim()}
                className="btn btn-primary btn-sm text-primary-content rounded-lg disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-base-content/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-base-100 rounded-xl sm:rounded-2xl shadow-xl border border-base-300 max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300 bg-base-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-info to-accent rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Share2 size={18} className="text-info-content" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-base-content">Share Document</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="btn btn-ghost btn-sm hover:bg-base-300 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold text-base-content mb-2">
                  User IDs (one per line)
                </label>
                <textarea
                  rows={3}
                  value={shareUsers.join('\n')}
                  onChange={e => setShareUsers(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                  placeholder="Enter user IDs, one per line"
                  className="w-full px-3 py-2 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder-base-content/50 focus:border-info focus:ring-2 focus:ring-info/15 transition-all duration-200 resize-none text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowShareModal(false)} 
                  className="btn btn-ghost border border-base-300 hover:border-base-400 flex-1 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={shareDoc} 
                  disabled={updating}
                  className="btn btn-info text-info-content flex-1 order-1 sm:order-2"
                >
                  {updating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Share2 size={16} />
                  )}
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-base-content/50 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)} />
          <div className="relative bg-base-100 rounded-xl sm:rounded-2xl shadow-xl border border-base-300 max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-base-300 bg-base-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-warning to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <History size={18} className="text-warning-content" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-base-content">Version History</h3>
              </div>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="btn btn-ghost btn-sm hover:bg-base-300 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 max-h-96 overflow-y-auto space-y-3">
              {currentDocument.versions?.map((version, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-200 border border-base-300 rounded-lg hover:border-warning/30 transition-all duration-200 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base-content text-sm sm:text-base mb-1">{version.title}</h4>
                    <p className="text-xs sm:text-sm text-base-content/60 mb-1">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                    <p className="text-base-content/70 text-xs sm:text-sm">
                      by {version.createdBy?.firstName} {version.createdBy?.lastName}
                    </p>
                    {version.content && (
                      <p className="text-base-content/60 text-xs mt-1 line-clamp-2">
                        {version.content.substring(0, 80)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => rollbackVersion(idx)}
                    disabled={updating}
                    className="btn btn-outline btn-sm border border-warning/20 hover:border-warning hover:bg-warning/10 text-warning rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Document;