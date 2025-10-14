// components/Workspace.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Document from '../components/Document';
import ChatButton from '../components/chatButton';
import DocumentForm from '../components/documentForm';
import AddMemberForm from '../components/AddMemberForm';
import {
  fetchWorkspace,
  fetchWorkspaceDocuments,
  removeWorkspaceMemberThunk,
  updateWorkspaceMemberRoleThunk,
  searchWorkspaceDocuments
} from '../reducer/thunks/WorkSpaceThunk';
import { createNewDocument, updateExistingDocument } from '../reducer/thunks/documentThunk';
import {
  clearSearchResults,
  updateDocumentInList,
  addDocumentToList
} from '../reducer/slices/workSpaceSlice';

export default function Workspace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const {
    currentWorkspace,
    documents,
    members,
    searchResults,
    loading: workspaceLoading,
    documentsLoading,
    searchLoading,
    error: workspaceError
  } = useSelector((state) => state.workspace);
  
  console.log(members);
  
  const user = useSelector((state) => state.user.value);

  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showCreateDocumentForm, setShowCreateDocumentForm] = useState(false);
  const [documentModalMode, setDocumentModalMode] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const loadWorkspaceData = async () => {
      try {
        await dispatch(fetchWorkspace(id)).unwrap();
        await dispatch(fetchWorkspaceDocuments(id)).unwrap();
      } catch (error) {
        console.error('Error loading workspace:', error);
      }
    };
    
    loadWorkspaceData();
    
    return () => {
      dispatch(clearSearchResults());
    };
  }, [id, dispatch]);

  const isAdmin = members?.some(
    (m) => m.user._id === user?._id && m.roles.includes('Admin')
  );

  const handleDocumentClick = (docId, mode = 'view') => {
    setSelectedDocumentId(docId);
    setDocumentModalMode(mode);
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocumentId(null);
    setDocumentModalMode('view');
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await dispatch(removeWorkspaceMemberThunk({ workspaceId: id, memberId })).unwrap();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateMemberRole = async (memberId, role) => {
    try {
      await dispatch(updateWorkspaceMemberRoleThunk({ 
        workspaceId: id, 
        memberId, 
        role 
      })).unwrap();
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleCreateDocument = async (documentData, files) => {
    try {
      const newDoc = await dispatch(createNewDocument({
        workspaceId: id,
        documentData,
        files
      })).unwrap();
      
      dispatch(addDocumentToList(newDoc));
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setShowCreateDocumentForm(false);
    }
  };

  const handleUpdateDocument = async (documentId, documentData, files) => {
    try {
      const updatedDoc = await dispatch(updateExistingDocument({
        documentId,
        documentData,
        files
      })).unwrap();
      
      dispatch(updateDocumentInList(updatedDoc));
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setSelectedDocumentId(null);
      setShowDocumentModal(false);
      setDocumentModalMode('view');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      dispatch(clearSearchResults());
      return;
    }
    
    try {
      await dispatch(searchWorkspaceDocuments({
        query: searchQuery,
        workspaceId: id
      })).unwrap();
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const refreshWorkspaceData = async () => {
    try {
      await dispatch(fetchWorkspace(id)).unwrap();
      await dispatch(fetchWorkspaceDocuments(id)).unwrap();
    } catch (error) {
      console.error('Error refreshing workspace:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto p-6">
          {workspaceLoading ? (
            <p className="text-gray-500">Loading workspace...</p>
          ) : workspaceError ? (
            <p className="text-red-600 font-semibold">{workspaceError}</p>
          ) : currentWorkspace ? (
            <>
              {/* Workspace Header */}
              <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {currentWorkspace.name}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {currentWorkspace.description || (
                      <span className="text-gray-400 italic">No description provided</span>
                    )}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-4 mb-6 ml-2 px-2">
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => setShowCreateDocumentForm(true)}
                  >
                    + Add Document
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    + Add Member
                  </button>
                  <button
                    onClick={refreshWorkspaceData}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                    disabled={workspaceLoading || documentsLoading}
                  >
                    <svg className={`w-4 h-4 ${workspaceLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex justify-around mb-6 border-b border-gray-300">
                <button
                  className={`py-2 px-4 ${activeTab === 'documents'
                    ? 'border-b-2 border-indigo-600 font-semibold text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'members'
                    ? 'border-b-2 border-indigo-600 font-semibold text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('members')}
                >
                  Members
                </button>
              </div>

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <section className="bg-white overflow-auto rounded-lg shadow p-6">
                  {/* Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2 items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Search documents..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      disabled={searchLoading}
                    >
                      {searchLoading ? "Searching..." : "Search"}
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchQuery.length > 0 ? (
                    searchLoading ? (
                      <p className="text-gray-500">Searching documents...</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-gray-500">No documents found for "{searchQuery}".</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map((doc) => (
                          <li
                            key={doc._id}
                            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded"
                          >
                            <span className="font-medium">{doc.title}</span>
                            <span className="text-gray-400 text-sm">
                              {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
                            </span>
                            <div className="flex gap-2 ml-4">
                              <button
                                className="px-3 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-100 text-sm"
                                onClick={() => handleDocumentClick(doc._id, 'view')}
                              >
                                View
                              </button>
                              <button
                                className="px-3 py-1 rounded border border-indigo-600 text-indigo-700 hover:bg-indigo-100 text-sm"
                                onClick={() => handleDocumentClick(doc._id, 'edit')}
                              >
                                Edit
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : documentsLoading ? (
                    <p className="text-gray-500">Loading documents...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-gray-500">No documents yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <li
                          key={doc._id}
                          className="flex justify-between items-center p-3 hover:bg-gray-50 rounded"
                        >
                          <span className="font-medium">{doc.title}</span>
                          <span className="text-gray-400 text-sm">
                            {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
                          </span>
                          <div className="flex gap-2 ml-4">
                            <button
                              className="px-3 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-100 text-sm"
                              onClick={() => handleDocumentClick(doc._id, 'view')}
                            >
                              View
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* Members Tab */}
                  {activeTab === 'members' && (
                    <section className="bg-white rounded-lg shadow p-6">
                      {members.length === 0 ? (
                        <p className="text-gray-500">No members found.</p>
                      ) : (
                        <ul className="space-y-3">
                          {members.map((m) => (
                            <li
                              className="flex justify-between items-center p-3 border rounded hover:shadow-sm"
                              key={m.user._id} // ← use user._id
                            >
                              <div>
                                <p className="font-medium">{m.user.username}</p>
                                <p className="text-gray-500 text-sm">{m.user.email}</p>
                              </div>
                              {isAdmin && (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={m.roles[0]}
                                    onChange={(e) => handleUpdateMemberRole(m.user._id, e.target.value)}
                                    className="border rounded p-1"
                                  >
                                    <option>Viewer</option>
                                    <option>Editor</option>
                                    <option>Admin</option>
                                  </select>
                                  <button
                                    onClick={() => handleRemoveMember(m.user._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>

                      )}
                    </section>
                  )}

              {/* Modals */}
              {showCreateDocumentForm && (
                <Modal onClose={() => setShowCreateDocumentForm(false)}>
                  <DocumentForm
                    onClose={() => setShowCreateDocumentForm(false)}
                    onSubmit={handleCreateDocument}
                  />
                </Modal>
              )}

              {showDocumentModal && selectedDocumentId && (
                <Modal onClose={closeDocumentModal}>
                  {documentModalMode === 'edit' ? (
                    <DocumentForm
                      initialData={documents.find(doc => doc._id === selectedDocumentId)}
                      onClose={closeDocumentModal}
                      onSubmit={(data, files) => handleUpdateDocument(selectedDocumentId, data, files)}
                    />
                  ) : (
                    <Document
                      documentId={selectedDocumentId}
                      onClose={closeDocumentModal}
                      onUpdate={(updatedDoc) => {
                        dispatch(updateDocumentInList(updatedDoc));
                      }}
                    />
                  )}
                </Modal>
              )}

              {showAddMemberForm && (
                <Modal onClose={() => setShowAddMemberForm(false)}>
                  <AddMemberForm workspaceId={id} />
                </Modal>
              )}
            </>
          ) : (
            <p className="text-gray-500">Workspace not found or error occurred.</p>
          )}
          <ChatButton />
        </main>
        <Footer />
        
      </div>
    </div>
  );
}

// Modal Component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl w-full max-h-full overflow-auto relative">
      <button
        aria-label="Close modal"
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-2xl"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  </div>
);