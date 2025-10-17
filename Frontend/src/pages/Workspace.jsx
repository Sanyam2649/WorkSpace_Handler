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
  Briefcase
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
      refreshWorkspaceData(); // Refresh after removal
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
      refreshWorkspaceData(); // Refresh after role update
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">Documents</h1>
                <p className="text-base-content/60 mt-1">Manage your workspace documents</p>
              </div>

              {isAdmin && (
                <div className="flex gap-3 px-10 py-2">
                  {/* New Document Button with Tooltip */}
                  <div className="relative inline-block group">
                    <button
                      className="btn btn-primary btn-sm sm:btn-md"
                      onClick={() => setShowCreateDocumentForm(true)}
                    >
                      <Plus size={18} />
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-6 bg-base-100 border-2 border-primary/20 text-base-content text-sm font-medium rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 group-hover:delay-500">
                      Create New Document
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1.5 w-4 h-4 bg-base-100 border-r-2 border-b-2 border-primary/20 rotate-45"></div>
                    </div>
                  </div>

                  {/* Refresh Button with Tooltip */}
                  <div className="relative inline-block group">
                    <button
                      onClick={refreshWorkspaceData}
                      className="btn btn-outline btn-sm sm:btn-md"
                      disabled={workspaceLoading || documentsLoading}
                    >
                      <RefreshCw size={16} className={workspaceLoading ? 'animate-spin' : ''} />
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-base-100 border-2 border-base-300 text-base-content text-sm font-medium rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 group-hover:delay-500">
                      Refresh Workspace Data
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1.5 w-4 h-4 bg-base-100 border-r-2 border-b-2 border-base-300 rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-5 shadow-lg  transition-all duration-300 rounded-2xl group">
              <form onSubmit={handleSearchSubmit} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/60 transition-all duration-300 group-hover:text-primary group-focus-within:text-primary" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="input w-full pl-12 pr-6 py-4 bg-base-100 border-2 border-base-300 text-base-content placeholder-base-content/60 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300  focus:shadow-2xl text-lg"
                    placeholder="Search documents by title or content..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn bg-gradient-to-r from-primary to-secondary  text-primary-content border-2 border-primary hover:border-primary-focus shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-8"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <div className="flex items-center gap-3">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Search size={18} className="transition-transform duration-300" />
                      <span className="font-semibold">Search</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Documents Grid */}
            {(searchQuery.length > 0 && canSearch) ? (
              searchLoading ? (
                <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-12 text-center rounded-2xl shadow-lg">
                  <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                  <h3 className="text-lg font-semibold text-base-content mb-2">Searching Documents</h3>
                  <p className="text-base-content/60">Looking for documents matching your search...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-12 text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Files size={64} className="text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-base-content mb-3">No Results Found</h3>
                  <p className="text-base-content/60 mb-2">No documents match</p>
                  <p className="text-primary font-medium">"{searchQuery}"</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn btn-outline btn-sm border-2 hover:border-primary"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 max-h-96 overflow-y-auto p-1">
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
              <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-12 text-center rounded-2xl shadow-lg">
                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                <h3 className="text-lg font-semibold text-base-content mb-2">Loading Documents</h3>
                <p className="text-base-content/60">Fetching your workspace documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-16 text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Files size={40} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-base-content mb-3">No Documents Yet</h3>
                <p className="text-base-content/60 text-lg mb-8 max-w-md mx-auto">
                  Start organizing your work by creating your first document
                </p>
                {isAdmin && (
                  <div className="relative inline-block group">
                    <button
                      className="bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 font-semibold"
                      onClick={() => setShowCreateDocumentForm(true)}
                    >
                      <Plus size={20} className="mr-2" />
                      Create First Document
                    </button>
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-base-100 border-2 border-primary/20 text-base-content text-sm font-semibold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50">
                      Start your documentation journey
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-3 h-3 bg-base-100 border-r-2 border-b-2 border-primary/20 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 max-h-[600px] overflow-hidden p-10">
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
            case 'chat':
            return (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-base-content">
                    {activeChat?.type === 'document' ? 'Document Chat' : 'Workspace Chat'}
                  </h1>
                  <p className="text-base-content/60 mt-1">
                    {activeChat?.type === 'document'
                      ? 'Collaborate on this document in real-time'
                      : 'Communicate with your team members'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Connection Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isChatConnected ? 'bg-success' : 'bg-error'}`}></div>
                    <span className="text-sm text-base-content/60">
                      {isChatConnected ? 'Connected' : 'Connecting...'}
                    </span>
                  </div>

                  {/* View Toggle */}
                  <div className="tabs tabs-boxed bg-base-200 border border-base-300 p-1 rounded-xl">
                    <button
                      className={`tab tab-sm ${!isComponent ? 'tab-active' : ''}`}
                      onClick={() => setIsComponent(false)}
                    >
                      Full Chat
                    </button>
                    <button
                      className={`tab tab-sm ${isComponent ? 'tab-active' : ''}`}
                      onClick={() => setIsComponent(true)}
                    >
                      Compact
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Chat Component */}
              <div className="flex-1 border-2 border-base-300 rounded-2xl overflow-hidden bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
                <Chat
                  isOpen={true}
                  onClose={() => {
                    // Optional: Add logic if you want to close chat and return to another view
                    // setCurrentView('workspace');
                  }}
                  workspaceId={activeChat?.type === 'workspace' ? id : undefined}
                  documentId={activeChat?.type === 'document' ? activeChat.roomId : undefined}
                  chatType={activeChat?.type || 'workspace'}
                  onChatSelect={handleChatSelect}
                  onConnectionChange={handleChatConnection}
                  key={`chat-${activeChat?.type}-${activeChat?.roomId}`} // Force re-render on chat change
                />
              </div>

              {/* Quick Stats Footer */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-2xl border border-base-300">
                  <div className="stat-figure text-primary">
                    <Users size={20} />
                  </div>
                  <div className="stat-title">Active Members</div>
                  <div className="stat-value text-lg">{members.filter(m => m.isActive).length}</div>
                </div>

                <div className="stat bg-base-200 rounded-2xl border border-base-300">
                  <div className="stat-figure text-success">
                    <FileText size={20} />
                  </div>
                  <div className="stat-title">Document Chats</div>
                  <div className="stat-value text-lg">{documents?.length || 0}</div>
                </div>

                <div className="stat bg-base-200 rounded-2xl border border-base-300">
                  <div className="stat-figure text-info">
                    <MessageCircle size={20} />
                  </div>
                  <div className="stat-title">Connection</div>
                  <div className="stat-value text-lg">
                    {isChatConnected ? 'Live' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
            );

            <Chat
              isOpen={true}
              onClose={() => { }}
              workspaceId={activeChat?.type === 'workspace' ? id : undefined}
              documentId={activeChat?.type === 'document' ? activeChat.roomId : undefined}
              chatType={activeChat?.type || 'workspace'}
              onChatSelect={handleChatSelect} // ADDED: Callback for chat selection
              onConnectionChange={handleChatConnection} // ADDED: Callback for connection status
              key={`chat-${activeChat?.type}-${activeChat?.roomId}`} // ADDED: Force re-render
            />
          </div>
        );

      case 'members':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">Team Members</h1>
                <p className="text-base-content/60 mt-1">Manage workspace collaborators</p>
              </div>

              {isAdmin && (
                <div className="relative group">
                  <button
                    className="btn  text-success-content border-0 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    <Plus size={18} className="mr-2 bg-accent" />
                  </button>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-base-100 border-2 border-success/20 text-base-content text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Invite new team member
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-base-100 border-r-2 border-b-2 border-success/20 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Members List */}
            {members.length === 0 ? (
              <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-base-300 p-16 text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users size={40} className="text-success" />
                </div>
                <h3 className="text-2xl font-bold text-base-content mb-3">No Team Members Yet</h3>
                <p className="text-base-content/60 text-lg mb-8 max-w-md mx-auto">
                  Start building your team by inviting collaborators to this workspace
                </p>
                {isAdmin && (
                  <div className="relative inline-block group">
                    <button
                      className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => setShowAddMemberForm(true)}
                    >
                      <Plus size={20} className="mr-2" />
                      Add First Member
                    </button>
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-base-100 border-2 border-success/20 text-base-content text-sm font-semibold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50">
                      Build your dream team
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-3 h-3 bg-base-100 border-r-2 border-b-2 border-success/20 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
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
    <div className="min-h-screen bg-base-100 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-base-200 border-r border-base-300 
        transition-all duration-300 ease-in-out
        flex flex-col
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          {!sidebarCollapsed && currentWorkspace && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="text-primary-content" size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base-content truncate text-sm">
                  {currentWorkspace.name}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {currentWorkspace.members?.length || 0} members
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn btn-ghost btn-square btn-sm flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
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
                  w-full flex items-center gap-3 p-3 rounded-lg 
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary text-primary-content shadow-lg'
                    : 'text-base-content hover:bg-base-300 hover:text-base-content'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-base-100 text-base-content text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          showMobileMenu={true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {workspaceLoading && currentView === 'workspace' ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-4 text-base-content/60">Loading workspace...</p>
              </div>
            </div>
          ) : workspaceError ? (
            <div className="alert alert-error">
              <div>
                <span>{workspaceError}</span>
                <button
                  onClick={refreshWorkspaceData}
                  className="btn btn-sm btn-outline ml-4"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : currentWorkspace || currentView !== 'workspace' ? (
            renderContent()
          ) : (
            <div className="card bg-base-200 p-12 text-center">
              <p className="text-base-content text-lg mb-4">Workspace not found</p>
              <button
                onClick={refreshWorkspaceData}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCreateDocumentForm}
        onClose={() => setShowCreateDocumentForm(false)}
        title="Create New Document"
      >
        <DocumentForm
          onClose={() => setShowCreateDocumentForm(false)}
          onSubmit={handleCreateDocument}
        />
      </Modal>

      <Modal
        isOpen={showDocumentModal && selectedDocumentId}
        onClose={closeDocumentModal}
        title={documentModalMode === 'edit' ? 'Edit Document' : 'View Document'}
        size="xl"
      >
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

      <Modal
        isOpen={showAddMemberForm}
        onClose={() => setShowAddMemberForm(false)}
        title="Add Team Member"
      >
        <AddMemberForm
          workspaceId={id}
          onSuccess={() => {
            setShowAddMemberForm(false);
            refreshWorkspaceData();
          }}
        />
      </Modal>
    </div>
  );
}

const DocumentCard = ({ doc, onView, onEdit, canEdit }) => {
  // Get the latest version info
  const latestVersion = doc.versions?.[doc.versions.length - 1];
  const collaboratorCount = doc.permissions?.filter(p => p.role !== 'Owner')?.length || 0;

  const hasFiles = doc.files && doc.files.length > 0;
  const fileCount = doc.files?.length || 0;

  return (
    <div
      className="group bg-base-100 border-2 border-base-300 hover:border-primary/40 rounded-xl p-5 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <FileText className="text-primary-content" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-base-content mb-2 leading-tight">
                {doc.title}
              </h3>

              {/* Content Preview */}
              {doc.content && (
                <p className="text-base-content/70 text-sm mb-3 leading-relaxed">
                  {doc.content.substring(0, 120)}
                  {doc.content.length > 120 && '...'}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-base-content/60">
                {/* Updated Date */}
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>Updated {new Date(latestVersion?.createdAt || doc.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Version */}
                <div className="flex items-center gap-1.5">
                  <History size={12} />
                  <span>v{doc.versions?.length || 1}</span>
                </div>

                {/* Files */}
                {hasFiles && (
                  <div className="flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Collaborators */}
                {collaboratorCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users2 size={12} />
                    <span>{collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4 flex-shrink-0">
          {/* View Button */}
          <div className="relative group/action">
            <button
              className="btn btn-ghost btn-square btn-sm text-base-content/60 hover:text-info hover:bg-info/10 border border-transparent hover:border-info/20 rounded-lg transition-all duration-200"
              onClick={onView}
            >
              <Eye size={16} />
            </button>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs font-medium rounded-md shadow-lg opacity-0 group-hover/action:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10">
              View
            </div>
          </div>

          {/* Edit Button */}
          {canEdit && (
            <div className="relative group/action">
              <button
                className="btn btn-ghost btn-square btn-sm text-base-content/60 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all duration-200"
                onClick={onEdit}
              >
                <Edit3 size={16} />
              </button>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs font-medium rounded-md shadow-lg opacity-0 group-hover/action:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10">
                Edit
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member, onRemove, onUpdateRole, canManage, currentUserId, index }) => {
  const isCurrentUser = member.user._id === currentUserId;

  return (
    <div
      className="card bg-gradient-to-br from-base-100 to-base-200 border-2 border-base-300 hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-primary-content font-semibold text-lg shadow-lg">
                {member.user.avatar?.url ? (
                  <img
                    src={member.user.avatar.url}
                    alt={member.user.username}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <>
                    {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                  </>
                )}
              </div>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-base-100 ${member.isActive
                  ? 'bg-success'
                  : member.isRequested
                    ? 'bg-warning'
                    : 'bg-error'
                }`}></div>
            </div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-base-content truncate">
                  {member.user.firstName} {member.user.lastName}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-sm text-base-content/60 mb-2">
                <div className="flex items-center gap-1">
                  <Mail size={14} />
                  <span className="truncate">{member.user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>@{member.user.username}</span>
                </div>
              </div>

              {/* Status and Role */}
              <div className="flex items-center gap-2">
                <span className={`badge badge-sm${member.roles[0] === 'Admin'
                    ? 'badge-secondary'
                    : member.roles[0] === 'Editor'
                      ? 'badge-primary'
                      : 'badge-outline'
                  }`}>
                  {member.roles[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canManage && !isCurrentUser && (
            <div className="flex gap-2 ml-4 flex-shrink-0">
              {/* Role Dropdown */}
              <div className="relative group">
                <select
                  value={member.roles[0]}
                  onChange={(e) => onUpdateRole(member.user._id, e.target.value)}
                  className="select select-bordered select-sm border-2 border-primary/20 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl bg-base-100"
                >
                  <option>Viewer</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10">
                  Change Role
                </div>
              </div>

              {/* Remove Button */}
              <div className="relative group">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${member.user.firstName} from this workspace?`)) {
                      onRemove(member.user._id);
                    }
                  }}
                  className="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10 border-2 border-error/20 hover:border-error transition-all duration-200 rounded-xl"
                >
                  <Users size={16} />
                </button>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-base-100 border border-base-300 text-base-content text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-10">
                  Remove Member
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Modal Component
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