// components/Document.jsx
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
  CheckCircle
} from 'lucide-react';

const Document = ({ documentId, onClose, onUpdate }) => {
  const dispatch = useDispatch();
  const { currentDocument, loading, updating, error } = useSelector(
    (state) => state.documents
  );
  
  console.log(currentDocument);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Viewer');

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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/60">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-error/10 border-2 border-error/20 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-error" size={24} />
          <h3 className="text-lg font-semibold text-error-content">Error Loading Document</h3>
        </div>
        <p className="text-error-content/80 mb-4">{error}</p>
        <button 
          onClick={() => dispatch(fetchDocument(documentId))} 
          className="btn btn-error"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="card bg-base-200 border-2 border-base-300 p-8 text-center rounded-2xl">
        <FileText size={48} className="text-base-content/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-base-content mb-2">Document Not Found</h3>
        <p className="text-base-content/60">The document you're looking for doesn't exist or access is denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 p-6 bg-base-200 rounded-2xl border-2 border-base-300">
        <div className="flex-1 space-y-3">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={e => setEditData({...editData, title: e.target.value})}
              placeholder="Document title"
              className="w-full px-4 py-3 bg-base-100 border-2 border-base-300 rounded-xl text-base-content placeholder-base-content/50 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200 text-xl font-bold"
            />
          ) : (
            <h1 className="text-3xl font-bold text-base-content">{currentDocument.title}</h1>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Created: {new Date(currentDocument.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <History size={16} />
              <span>Updated: {new Date(currentDocument.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Versions: {currentDocument.versions?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Edit Button */}
          <div className="relative group">
            <button
              onClick={toggleEditing}
              disabled={updating}
              className="btn btn-outline border-2 border-primary/20 hover:border-primary hover:bg-primary/10 text-primary rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {isEditing ? <X size={18} /> : <Edit3 size={18} />}
            </button>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-primary/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              {isEditing ? 'Cancel Edit' : 'Edit Document'}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="relative group">
              <button
                onClick={saveChanges}
                disabled={updating}
                className="btn bg-gradient-to-r from-primary to-secondary text-primary-content border-0 hover:shadow-lg transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                {updating ? <div className="loading loading-spinner loading-sm"></div> : <Save size={18} />}
              </button>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-primary/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                {updating ? 'Saving...' : 'Save Changes'}
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="relative group">
            <button
              onClick={() => setShowShareModal(true)}
              disabled={updating}
              className="btn btn-outline border-2 border-info/20 hover:border-info hover:bg-info/10 text-info rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <Share2 size={18} />
            </button>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-info/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              Share Document
            </div>
          </div>

          {/* History Button */}
          <div className="relative group">
            <button
              onClick={() => setShowVersionHistory(true)}
              disabled={updating}
              className="btn btn-outline border-2 border-warning/20 hover:border-warning hover:bg-warning/10 text-warning rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <History size={18} />
            </button>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-warning/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              Version History
            </div>
          </div>

          {/* Delete Button */}
          <div className="relative group">
            <button
              onClick={deleteDoc}
              disabled={updating}
              className="btn btn-outline border-2 border-error/20 hover:border-error hover:bg-error/10 text-error rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-error/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              Delete Document
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card bg-base-100 border-2 border-base-300 rounded-2xl overflow-hidden">
        {isEditing ? (
          <textarea
            rows={12}
            value={editData.content}
            onChange={e => setEditData({...editData, content: e.target.value})}
            placeholder="Write your document content here..."
            className="w-full px-6 py-4 bg-base-100 border-0 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-0 resize-vertical min-h-64"
          />
        ) : (
          <div className="px-6 py-4 min-h-64 max-h-96 overflow-y-auto">
            <div className="prose prose-lg max-w-none text-base-content">
              {currentDocument.content || (
                <div className="text-center text-base-content/60 py-12">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No content available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="border-t-2 border-base-300 p-4 bg-base-200">
            <label
              htmlFor="file-upload"
              className="btn btn-outline border-2 border-accent/20 hover:border-accent hover:bg-accent/10 text-accent rounded-xl cursor-pointer"
            >
              <Upload size={18} className="mr-2" />
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
              <div className="mt-3 space-y-2">
                {Array.from(selectedFiles).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-base-100 rounded-lg">
                    <FileText size={16} className="text-base-content/60" />
                    <span className="text-sm text-base-content">{file.name}</span>
                    <span className="text-xs text-base-content/40">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-base-content mb-4">
            <FileText size={20} />
            Attached Files ({currentDocument.files.length})
          </h3>
          <div className="space-y-3">
            {currentDocument.files.map(file => (
              <div key={file.publicId} className="flex items-center justify-between p-4 bg-base-100 border-2 border-base-300 rounded-xl hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="font-semibold text-base-content">{file.originalName}</p>
                    <p className="text-sm text-base-content/60">{file.mimetype}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm text-info hover:bg-info/10 rounded-lg"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={file.url}
                    download
                    className="btn btn-ghost btn-sm text-success hover:bg-success/10 rounded-lg"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => removeFile(file.publicId)}
                    disabled={updating}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Section */}
      {currentDocument.permissions?.length > 0 && (
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-base-content mb-4">
            <Users size={20} />
            Document Members ({currentDocument.permissions.length})
          </h3>
          <div className="space-y-3 mb-6">
            {currentDocument.permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-base-100 border-2 border-base-300 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-content" />
                  </div>
                  <span className="font-medium text-base-content">
                    {perm.user?.firstName} {perm.user?.lastName}
                  </span>
                </div>
                <span className={`badge badge-lg ${
                  perm.role === 'Admin' ? 'badge-secondary' :
                  perm.role === 'Editor' ? 'badge-primary' :
                  'badge-outline'
                }`}>
                  <Shield size={12} className="mr-1" />
                  {perm.role}
                </span>
              </div>
            ))}
          </div>
          
          {/* Add Member Form */}
          <div className="border-t-2 border-base-300 pt-4">
            <h4 className="flex items-center gap-2 text-md font-semibold text-base-content mb-3">
              <Plus size={16} />
              Add New Member
            </h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={newMemberId}
                onChange={e => setNewMemberId(e.target.value)}
                placeholder="Enter user ID"
                className="flex-1 px-4 py-2 bg-base-100 border-2 border-base-300 rounded-xl text-base-content placeholder-base-content/50 focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
              />
              <select
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
                className="px-4 py-2 bg-base-100 border-2 border-base-300 rounded-xl text-base-content focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                onClick={addMember}
                disabled={updating || !newMemberId.trim()}
                className="btn bg-gradient-to-r from-primary to-secondary text-primary-content border-0 hover:shadow-lg transform hover:scale-105 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-neutral/70 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-base-100 rounded-3xl shadow-2xl border-2 border-base-300 max-w-md w-full overflow-hidden animate-in zoom-in duration-300 scale-95">
            <div className="flex items-center justify-between p-6 border-b-2 border-base-300 bg-base-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-info to-accent rounded-xl flex items-center justify-center">
                  <Share2 className="text-info-content" size={20} />
                </div>
                <h3 className="text-xl font-bold text-base-content">Share Document</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-base-content mb-2">
                  User IDs (one per line)
                </label>
                <textarea
                  rows={4}
                  value={shareUsers.join('\n')}
                  onChange={e => setShareUsers(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                  placeholder="Enter user IDs, one per line"
                  className="w-full px-4 py-3 bg-base-100 border-2 border-base-300 rounded-xl text-base-content placeholder-base-content/50 focus:border-info focus:ring-4 focus:ring-info/15 transition-all duration-200 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowShareModal(false)} 
                  className="btn btn-ghost border-2 border-base-300 hover:border-base-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={shareDoc} 
                  disabled={updating}
                  className="btn bg-gradient-to-r from-info to-accent text-info-content border-0 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {updating ? (
                    <div className="loading loading-spinner loading-sm"></div>
                  ) : (
                    <Share2 size={18} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-neutral/70 backdrop-blur-md" onClick={() => setShowVersionHistory(false)} />
          <div className="relative bg-base-100 rounded-3xl shadow-2xl border-2 border-base-300 max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in duration-300 scale-95">
            <div className="flex items-center justify-between p-6 border-b-2 border-base-300 bg-base-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-500 rounded-xl flex items-center justify-center">
                  <History className="text-warning-content" size={20} />
                </div>
                <h3 className="text-xl font-bold text-base-content">Version History</h3>
              </div>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {currentDocument.versions?.map((version, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-base-200 border-2 border-base-300 rounded-xl hover:border-warning/30 transition-all duration-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base-content mb-1">{version.title}</h4>
                    <p className="text-sm text-base-content/60 mb-2">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                    <p className="text-base-content/70 text-sm">
                      by {version.createdBy?.firstName} {version.createdBy?.lastName}
                    </p>
                    {version.content && (
                      <p className="text-base-content/60 text-sm mt-2 line-clamp-2">
                        {version.content.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => rollbackVersion(idx)}
                    disabled={updating}
                    className="btn btn-outline border-2 border-warning/20 hover:border-warning hover:bg-warning/10 text-warning rounded-xl transition-all duration-200 disabled:opacity-50 ml-4"
                  >
                    <History size={16} />
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