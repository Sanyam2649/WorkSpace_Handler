// components/Workspace.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Document from '../components/Document';
import DocumentForm from '../components/documentForm';
import AddMemberForm from '../components/AddMemberForm';
import WorkspaceDetail from '../subComponent/workSpaceDetail';
import Chat from '../components/Chat';
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
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Files,
  FileText,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Users,
  Menu,
  X,
  Calendar,
  Tag,
  Eye,
  Edit3,
  Paperclip,
  History,
  Users2,
  Mail,
  Shield,
  Briefcase,
  ArrowLeft
} from 'lucide-react';

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

  const user = useSelector((state) => state.user.value);

  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showCreateDocumentForm, setShowCreateDocumentForm] = useState(false);
  const [documentModalMode, setDocumentModalMode] = useState('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [canSearch, setCanSearch] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [isComponent, setIsComponent] = useState(false);

  // Single API call in parent component
  useEffect(() => {
    if (!id) return;

    console.log('Loading workspace data for:', id);

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

  useEffect(() => {
    if (currentView === 'chat' && currentWorkspace && !activeChat) {
      setActiveChat({
        type: 'workspace',
        roomId: id,
        otherUserId: null,
        name: currentWorkspace.name,
        ...currentWorkspace
      });
    }
  }, [currentView, currentWorkspace, id, activeChat]);

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

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleChatConnection = (connected) => {
    setIsChatConnected(connected);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await dispatch(removeWorkspaceMemberThunk({ workspaceId: id, memberId })).unwrap();
      refreshWorkspaceData();
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
      refreshWorkspaceData();
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
    setCanSearch(true);
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

  const navigationItems = [
    { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'members', label: 'Team', icon: Users }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'workspace':
        return (
          <WorkspaceDetail
            workspaceId={id}
            currentWorkspace={currentWorkspace}
            loading={workspaceLoading}
            onRefresh={refreshWorkspaceData}
          />
        );

      case 'documents':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-base-content">Documents</h1>
                <p className="text-base-content/60 mt-1 text-sm md:text-base">Manage your workspace documents</p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 md:gap-3">
                  {/* New Document Button */}
                  <div className="relative group">
                    <button
                      className="btn btn-primary btn-sm md:btn-md rounded-lg md:rounded-xl"
                      onClick={() => setShowCreateDocumentForm(true)}
                    >
                      <Plus size={16} md:size={18} />
                      <span className="hidden sm:inline">New</span>
                    </button>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 hidden sm:block">
                      Create Document
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="relative group">
                    <button
                      onClick={refreshWorkspaceData}
                      className="btn btn-outline btn-sm md:btn-md rounded-lg md:rounded-xl"
                      disabled={workspaceLoading || documentsLoading}
                    >
                      <RefreshCw size={14} md:size={16} className={workspaceLoading ? 'animate-spin' : ''} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 hidden sm:block">
                      Refresh Data
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="card bg-base-200 border border-base-300 p-4 md:p-5 rounded-xl md:rounded-2xl">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="input w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 text-base-content placeholder-base-content/60 rounded-lg md:rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 text-sm md:text-base"
                    placeholder="Search documents..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary py-3 px-4 md:px-8 rounded-lg md:rounded-xl min-w-[100px]"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="text-sm">Searching</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search size={16} />
                      <span className="text-sm">Search</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Documents Grid */}
            {(searchQuery.length > 0 && canSearch) ? (
              searchLoading ? (
                <div className="card bg-base-200 border border-base-300 p-8 text-center rounded-xl">
                  <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
                  <h3 className="text-lg font-semibold text-base-content mb-2">Searching</h3>
                  <p className="text-base-content/60 text-sm">Looking for documents...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="card bg-base-200 border border-base-300 p-8 text-center rounded-xl">
                  <Files size={48} className="text-base-content/30 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-base-content mb-2">No Results</h3>
                  <p className="text-base-content/60 text-sm mb-4">No documents match "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn btn-outline btn-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {searchResults.map((doc, index) => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      onView={() => handleDocumentClick(doc._id, 'view')}
                      onEdit={() => handleDocumentClick(doc._id, 'edit')}
                      canEdit={isAdmin}
                      index={index}
                    />
                  ))}
                </div>
              )
            ) : documentsLoading ? (
              <div className="card bg-base-200 border border-base-300 p-8 text-center rounded-xl">
                <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
                <h3 className="text-lg font-semibold text-base-content mb-2">Loading</h3>
                <p className="text-base-content/60 text-sm">Fetching documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="card bg-base-200 border border-base-300 p-8 text-center rounded-xl">
                <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Files size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-base-content mb-2">No Documents</h3>
                <p className="text-base-content/60 text-sm mb-6">
                  Start by creating your first document
                </p>
                {isAdmin && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateDocumentForm(true)}
                  >
                    <Plus size={18} className="mr-2" />
                    Create Document
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                {documents.map((doc, index) => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onView={() => handleDocumentClick(doc._id, 'view')}
                    onEdit={() => handleDocumentClick(doc._id, 'edit')}
                    canEdit={isAdmin}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-base-content">
                  {activeChat?.type === 'document' ? 'Document Chat' : 'Workspace Chat'}
                </h1>
                <p className="text-base-content/60 mt-1 text-sm md:text-base">
                  {activeChat?.type === 'document'
                    ? 'Collaborate on this document'
                    : 'Communicate with your team'
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isChatConnected ? 'bg-success' : 'bg-error'}`}></div>
                  <span className="text-xs text-base-content/60">
                    {isChatConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>

                {/* View Toggle */}
                <div className="tabs tabs-boxed bg-base-200 border border-base-300 p-1 rounded-lg">
                  <button
                    className={`tab tab-xs ${!isComponent ? 'tab-active' : ''}`}
                    onClick={() => setIsComponent(false)}
                  >
                    Full
                  </button>
                  <button
                    className={`tab tab-xs ${isComponent ? 'tab-active' : ''}`}
                    onClick={() => setIsComponent(true)}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Component */}
            <div className="flex-1 border border-base-300 rounded-xl md:rounded-2xl overflow-hidden bg-base-100">
              <Chat
                isOpen={true}
                onClose={() => {}}
                workspaceId={activeChat?.type === 'workspace' ? id : undefined}
                documentId={activeChat?.type === 'document' ? activeChat.roomId : undefined}
                chatType={activeChat?.type || 'workspace'}
                onChatSelect={handleChatSelect}
                onConnectionChange={handleChatConnection}
                key={`chat-${activeChat?.type}-${activeChat?.roomId}`}
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              <div className="stat bg-base-200 rounded-lg md:rounded-2xl border border-base-300 p-3">
                <div className="stat-figure text-primary">
                  <Users size={16} />
                </div>
                <div className="stat-title text-xs">Active</div>
                <div className="stat-value text-sm">{members.filter(m => m.isActive).length}</div>
              </div>

              <div className="stat bg-base-200 rounded-lg md:rounded-2xl border border-base-300 p-3">
                <div className="stat-figure text-success">
                  <FileText size={16} />
                </div>
                <div className="stat-title text-xs">Documents</div>
                <div className="stat-value text-sm">{documents?.length || 0}</div>
              </div>

              <div className="stat bg-base-200 rounded-lg md:rounded-2xl border border-base-300 p-3 col-span-2 md:col-span-1">
                <div className="stat-figure text-info">
                  <MessageCircle size={16} />
                </div>
                <div className="stat-title text-xs">Status</div>
                <div className="stat-value text-sm">
                  {isChatConnected ? 'Live' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-base-content">Team Members</h1>
                <p className="text-base-content/60 mt-1 text-sm md:text-base">Manage workspace collaborators</p>
              </div>

              {isAdmin && (
                <div className="relative group">
                  <button
                    className="btn btn-success btn-sm md:btn-md rounded-lg md:rounded-xl"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    <Plus size={16} md:size={18} className="mr-1" />
                    <span className="text-sm">Add Member</span>
                  </button>
                </div>
              )}
            </div>

            {/* Members List */}
            {members.length === 0 ? (
              <div className="card bg-base-200 border border-base-300 p-8 text-center rounded-xl">
                <div className="w-16 h-16 bg-success/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-success" />
                </div>
                <h3 className="text-xl font-bold text-base-content mb-2">No Team Members</h3>
                <p className="text-base-content/60 text-sm mb-6">
                  Start building your team
                </p>
                {isAdmin && (
                  <button
                    className="btn btn-success"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    <Plus size={18} className="mr-2" />
                    Add Member
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {members.map((m, index) => (
                  <MemberCard
                    key={m.user._id}
                    member={m}
                    onRemove={handleRemoveMember}
                    onUpdateRole={handleUpdateMemberRole}
                    canManage={isAdmin}
                    currentUserId={user?._id}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <WorkspaceDetail
            workspaceId={id}
            currentWorkspace={currentWorkspace}
            loading={workspaceLoading}
            onRefresh={refreshWorkspaceData}
          />
        );
    }
  };

return (
  <div className="min-h-screen bg-base-100 flex flex-col">
    {/* Navbar - Always at the top */}
    <Navbar
      onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      showMobileMenu={true}
    />

    {/* Main Content Area with Sidebar */}
    <div className="flex-1 flex min-h-0">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        bg-base-200 border-r border-base-300 
        transition-all duration-300 ease-in-out
        flex flex-col
        ${sidebarCollapsed ? 'w-14' : 'w-64'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        mt-0 lg:mt-0
      `}>
        {/* Sidebar Header (commented out as per your code) */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-base-300">
          {!sidebarCollapsed && currentWorkspace && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="text-primary-content" size={14} md:size={18} />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn btn-ghost btn-square btn-xs md:btn-sm flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-1 md:p-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg 
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary text-primary-content shadow-lg'
                    : 'text-base-content hover:bg-base-300 hover:text-base-content'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate text-sm md:text-base">{item.label}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-base-100 text-base-content text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {workspaceLoading && currentView === 'workspace' ? (
            <div className="flex items-center justify-center h-48 md:h-64">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-3 md:mt-4 text-base-content/60 text-sm md:text-base">Loading workspace...</p>
              </div>
            </div>
          ) : workspaceError ? (
            <div className="alert alert-error">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm">{workspaceError}</span>
                <button
                  onClick={refreshWorkspaceData}
                  className="btn btn-sm btn-outline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : currentWorkspace || currentView !== 'workspace' ? (
            renderContent()
          ) : (
            <div className="card bg-base-200 p-6 md:p-12 text-center rounded-xl">
              <p className="text-base-content text-base md:text-lg mb-4">Workspace not found</p>
              <button
                onClick={refreshWorkspaceData}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </main>
      </div>
    </div>

    {/* Footer - Always at the bottom */}
    <Footer />

    {/* Mobile Bottom Navigation */}
    <div className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 p-2 flex justify-around lg:hidden z-30">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              flex flex-col items-center p-2 rounded-lg transition-all duration-200
              ${isActive
                ? 'text-primary bg-primary/10'
                : 'text-base-content/60'
              }
            `}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>

    {/* Modals */}
    <MobileModal
      isOpen={showCreateDocumentForm}
      onClose={() => setShowCreateDocumentForm(false)}
      title="Create Document"
      position="bottom"
    >
      <DocumentForm
        onClose={() => setShowCreateDocumentForm(false)}
        onSubmit={handleCreateDocument}
      />
    </MobileModal>

    <MobileModal
      isOpen={showDocumentModal && selectedDocumentId}
      onClose={closeDocumentModal}
      title={documentModalMode === 'edit' ? 'Edit Document' : 'View Document'}
      position="bottom"
      size="full"
    >
      {documentModalMode === 'edit' ? (
        <DocumentForm
          initialData={documents.find(doc => doc._id === selectedDocumentId)}
          onClose={closeDocumentModal}
          onSubmit={(data, files) => handleUpdateDocument(selectedDocumentId, data, files)}
        />
      ) : (
        <div className="h-full flex flex-col">
          <Document
            documentId={selectedDocumentId}
            onClose={closeDocumentModal}
            onUpdate={(updatedDoc) => {
              dispatch(updateDocumentInList(updatedDoc));
            }}
          />
        </div>
      )}
    </MobileModal>

    <MobileModal
      isOpen={showAddMemberForm}
      onClose={() => setShowAddMemberForm(false)}
      title="Add Team Member"
      position="bottom"
    >
      <AddMemberForm
        workspaceId={id}
        onSuccess={() => {
          setShowAddMemberForm(false);
          refreshWorkspaceData();
        }}
      />
    </MobileModal>
  </div>
);
}

const DocumentCard = ({ doc, onView, onEdit, canEdit }) => {
  const latestVersion = doc.versions?.[doc.versions.length - 1];
  const collaboratorCount = doc.permissions?.filter(p => p.role !== 'Owner')?.length || 0;
  const hasFiles = doc.files && doc.files.length > 0;
  const fileCount = doc.files?.length || 0;

  return (
    <div className="group bg-base-100 border border-base-300 hover:border-primary/40 rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-200">
      <div className="flex items-start justify-between">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 md:gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <FileText className="text-primary-content" size={14} md:size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-base-content mb-1 leading-tight">
                {doc.title}
              </h3>

              {/* Content Preview */}
              {doc.content && (
                <p className="text-base-content/70 text-xs md:text-sm mb-2 leading-relaxed line-clamp-2">
                  {doc.content.substring(0, 80)}
                  {doc.content.length > 80 && '...'}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{new Date(latestVersion?.createdAt || doc.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <History size={10} />
                  <span>v{doc.versions?.length || 1}</span>
                </div>

                {hasFiles && (
                  <div className="flex items-center gap-1">
                    <Paperclip size={10} />
                    <span>{fileCount}</span>
                  </div>
                )}

                {collaboratorCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Users2 size={10} />
                    <span>{collaboratorCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <button
            className="btn btn-ghost btn-square btn-xs text-base-content/60 hover:text-info"
            onClick={onView}
          >
            <Eye size={12} />
          </button>

          {canEdit && (
            <button
              className="btn btn-ghost btn-square btn-xs text-base-content/60 hover:text-primary"
              onClick={onEdit}
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member, onRemove, onUpdateRole, canManage, currentUserId, index }) => {
  const isCurrentUser = member.user._id === currentUserId;

  return (
    <div className="card bg-base-100 border border-base-300 rounded-lg md:rounded-xl p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg md:rounded-xl flex items-center justify-center text-primary-content font-semibold text-sm">
              {member.user.avatar?.url ? (
                <img
                  src={member.user.avatar.url}
                  alt={member.user.username}
                  className="w-full h-full rounded-lg md:rounded-xl object-cover"
                />
              ) : (
                <>
                  {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                </>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border border-base-100 ${
              member.isActive ? 'bg-success' : member.isRequested ? 'bg-warning' : 'bg-error'
            }`}></div>
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-base-content truncate">
              {member.user.firstName} {member.user.lastName}
            </h3>
            <p className="text-xs text-base-content/60 truncate">{member.user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`badge badge-xs ${
                member.roles[0] === 'Admin' ? 'badge-secondary' :
                member.roles[0] === 'Editor' ? 'badge-primary' : 'badge-outline'
              }`}>
                {member.roles[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canManage && !isCurrentUser && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <select
              value={member.roles[0]}
              onChange={(e) => onUpdateRole(member.user._id, e.target.value)}
              className="select select-bordered select-xs border border-base-300 rounded-lg text-xs"
            >
              <option>Viewer</option>
              <option>Editor</option>
              <option>Admin</option>
            </select>
            <button
              onClick={() => {
                if (window.confirm(`Remove ${member.user.firstName}?`)) {
                  onRemove(member.user._id);
                }
              }}
              className="btn btn-ghost btn-square btn-xs text-error"
            >
              <Users size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Mobile Modal Component with Slide Animation
const MobileModal = ({ isOpen, onClose, children, title, position = 'bottom', size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  const positionClasses = {
    bottom: 'items-end justify-center',
    center: 'items-center justify-center',
    top: 'items-start justify-center'
  };

  const animationClasses = {
    bottom: isOpen ? 'animate-in slide-in-from-bottom duration-300' : 'animate-out slide-out-to-bottom duration-300',
    center: isOpen ? 'animate-in zoom-in duration-300' : 'animate-out zoom-out duration-300',
    top: isOpen ? 'animate-in slide-in-from-top duration-300' : 'animate-out slide-out-to-top duration-300'
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${positionClasses[position]} p-2 md:p-4 ${animationClasses[position]}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-base-100 rounded-xl md:rounded-2xl shadow-2xl border border-base-300 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden ${animationClasses[position]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200 sticky top-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-square btn-sm md:hidden"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-base-content">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-square btn-sm hidden md:flex"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>

        {/* Mobile Handle */}
        {position === 'bottom' && (
          <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-1 bg-base-300 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};