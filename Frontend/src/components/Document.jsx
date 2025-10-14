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
    if (window.confirm('Are you sure? This cannot be undone.')) {
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
      // Refresh document data
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
      // Refresh document data
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
      
      // Refresh document data
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
      
      // Refresh document data
      dispatch(fetchDocument(documentId));
      setShowVersionHistory(false);
    } catch (err) {
      console.error('Failed to rollback version:', err);
    }
  };

  const handleFileInput = (e) => setSelectedFiles(e.target.files);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-3 text-gray-500">
        <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p>Loading document…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-300 rounded bg-red-50 text-red-700">
        <h3 className="font-semibold mb-2">Error</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => dispatch(fetchDocument(documentId))} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="p-6 border border-gray-300 text-center rounded text-gray-500">
        <h3 className="font-semibold mb-2">Document not found</h3>
        <p>The document you're looking for doesn't exist or access is denied.</p>
      </div>
    );
  }

  return (
    <>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={e => setEditData({...editData, title: e.target.value})}
              placeholder="Document title"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          ) : (
            <h1 className="text-3xl font-semibold">{currentDocument.title}</h1>
          )}
          <div className="text-gray-400 text-sm space-x-4">
            <span>Created: {new Date(currentDocument.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(currentDocument.updatedAt).toLocaleDateString()}</span>
            <span>Versions: {currentDocument.versions?.length || 0}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 justify-around">
          <button
            onClick={toggleEditing}
            disabled={updating}
            className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={saveChanges}
              disabled={updating}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            disabled={updating}
            className="px-4 py-2 rounded border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            Share
          </button>
          <button
            onClick={() => setShowVersionHistory(true)}
            disabled={updating}
            className="px-4 py-2 rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50"
          >
            History
          </button>
          <button
            onClick={deleteDoc}
            disabled={updating}
            className="px-4 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </header>

      {/* Content */}
      <div>
        {isEditing ? (
          <textarea
            rows={12}
            value={editData.content}
            onChange={e => setEditData({...editData, content: e.target.value})}
            placeholder="Write your document content here..."
            className="w-full border border-gray-300 rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        ) : (
          <div className="whitespace-pre-wrap p-4 border border-gray-200 rounded h-4rem overflow-y-auto text-gray-800">
            {currentDocument.content || 'No content available'}
          </div>
        )}

        {isEditing && (
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="inline-block cursor-pointer text-blue-600 underline hover:text-blue-800"
            >
              📎 Add Files
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            {selectedFiles && (
              <div className="mt-2 space-x-2 text-sm text-gray-600">
                {Array.from(selectedFiles).map((file, idx) => (
                  <span key={idx} className="inline-block bg-blue-100 rounded px-2 py-1">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Files List */}
      {currentDocument.files?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Attached Files</h3>
          <ul className="space-y-2">
            {currentDocument.files.map(file => (
              <li key={file.publicId} className="flex justify-between items-center border rounded px-3 py-2">
                <div>
                  <p className="font-semibold">{file.originalName}</p>
                  <p className="text-xs text-gray-500">{file.mimetype}</p>
                </div>
                <div className="space-x-3">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                  <button
                    onClick={() => removeFile(file.publicId)}
                    disabled={updating}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Members */}
      {currentDocument.permissions?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Document Members</h3>
          <ul className="space-y-2">
            {currentDocument.permissions.map((perm, idx) => (
              <li key={idx} className="flex justify-between border rounded px-3 py-2">
                <span>{perm.user?.firstName} {perm.user?.lastName}</span>
                <span className="italic text-gray-500">{perm.role}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={newMemberId}
              onChange={e => setNewMemberId(e.target.value)}
              placeholder="User ID to add"
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={newMemberRole}
              onChange={e => setNewMemberRole(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              onClick={addMember}
              disabled={updating || !newMemberId.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-lg w-full space-y-4">
            <h3 className="text-xl font-semibold">Share Document</h3>
            <textarea
              rows={4}
              value={shareUsers.join('\n')}
              onChange={e => setShareUsers(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
              placeholder="Enter user IDs, one per line"
              className="w-full border border-gray-300 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowShareModal(false)} 
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={shareDoc} 
                disabled={updating}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded p-6 max-w-xl w-full space-y-4">
            <h3 className="text-xl font-semibold">Version History</h3>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {currentDocument.versions?.map((version, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <h4 className="font-semibold">{version.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(version.createdAt).toLocaleString()}</p>
                    <p className="text-gray-600">
                      by {version.createdBy?.firstName} {version.createdBy?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => rollbackVersion(idx)}
                    disabled={updating}
                    className="text-yellow-600 hover:underline ml-4 disabled:opacity-50"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowVersionHistory(false)} 
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Document;