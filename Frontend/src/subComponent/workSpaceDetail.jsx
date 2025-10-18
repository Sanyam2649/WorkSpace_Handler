import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { fetchWorkspace } from "../reducer/thunks/WorkSpaceThunk";
import { Edit, Plus, Search, SquarePen, X, Users, FileText, Activity, Calendar, User } from "lucide-react";
import AddMemberForm from "../components/AddMemberForm";
import EditMembersList from "../components/EditMemberForm";

export default function WorkspaceDetail({workspaceId}) {
  
  const dispatch = useDispatch();
  const id = workspaceId;
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [openAddMemberForm, setOpenAddMemberForm] = useState(false);
  const [openEditMemberForm, setOpenEditMemberForm] = useState(false);

  const handleAddMember = () => {
    setOpenAddMemberForm(true);
  };
  
  const handleEditMember = () => {
    setOpenEditMemberForm(true);
  };

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content text-sm sm:text-base">Loading workspace details...</p>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive, isRequested) => {
    if (isRequested && !isActive) return "badge-warning text-warning-content";
    if (isActive) return "badge-success text-success-content";
    return "badge-neutral text-neutral-content";
  };

  const getStatusText = (isActive, isRequested) => {
    if (isRequested && !isActive) return "Pending";
    if (isActive) return "Active";
    return "Inactive";
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">      
      <main className="flex-1 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto bg-base-100 px-3 sm:px-4 lg:px-6 w-full">
          {/* Header Section */}
          <div className="bg-base-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-base-content mb-1 sm:mb-2 break-words">
                  {currentWorkspace.name}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-base-content opacity-80 line-clamp-2">
                  {currentWorkspace.description}
                </p>
              </div>
              <div className="text-right mt-2 lg:mt-0">
                <div className="text-xs sm:text-sm text-base-content opacity-70">Workspace ID</div>
                <div className="font-mono text-xs text-base-content opacity-60 break-all">
                  {currentWorkspace.slug}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* All cards remain the same as above */}
            {/* Team Members */}
            <div className="bg-primary text-primary-content p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{currentWorkspace.members?.length || 0}</div>
              <div className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                <Users size={14} className="sm:w-4 sm:h-4" />
                Team Members
              </div>
            </div>

            {/* Documents */}
            <div className="bg-success text-success-content p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{currentWorkspace.documents?.length || 0}</div>
              <div className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                <FileText size={14} className="sm:w-4 sm:h-4" />
                Documents
              </div>
            </div>

            {/* Activities */}
            <div className="bg-info text-info-content p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{currentWorkspace.trackActivity?.length || 0}</div>
              <div className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                <Activity size={14} className="sm:w-4 sm:h-4" />
                Activities
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-warning text-warning-content p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {currentWorkspace.members?.filter(m => m.isActive).length || 0}
              </div>
              <div className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                <User size={14} className="sm:w-4 sm:h-4" />
                Active Members
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Team Members Section */}
            <div className="bg-base-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center gap-2">
                  <Users size={20} className="sm:w-6 sm:h-6" />
                  Team Members
                </h2>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handleEditMember}
                    className="p-1.5 sm:p-2 bg-base-300 hover:bg-base-400 rounded-lg transition-colors"
                    title="Edit members"
                  >
                    <SquarePen size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="p-1.5 sm:p-2 bg-primary text-primary-content hover:bg-primary/90 rounded-lg transition-colors"
                    title="Add member"
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentWorkspace.members?.map((member) => (
                  <div
                    key={member.user._id}
                    className="bg-base-100 p-3 sm:p-4 rounded-lg border border-base-300 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="avatar placeholder flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-12 rounded-full overflow-hidden flex items-center justify-center bg-accent text-accent-content font-semibold text-xs sm:text-sm">
                            {member?.user?.avatar?.url ? (
                              <img
                                src={member.user.avatar.url}
                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <>
                                {member.user.firstName?.[0] || 'U'}
                                {member.user.lastName?.[0] || ''}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base-content text-sm sm:text-base truncate">
                            {member.user.firstName} {member.user.lastName}
                          </h3>
                          <p className="text-xs text-base-content opacity-50 truncate">
                            @{member.user.username}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="flex flex-col items-end gap-1">
                          <div className="badge badge-secondary badge-sm sm:badge-md">
                            {member.roles[0]}
                          </div>
                          <div className={`badge badge-sm sm:badge-md ${getStatusBadge(member.isActive, member.isRequested)}`}>
                            {getStatusText(member.isActive, member.isRequested)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!currentWorkspace.members || currentWorkspace.members.length === 0) && (
                  <div className="text-center py-6">
                    <Users size={32} className="mx-auto mb-2 text-base-content/30" />
                    <p className="text-base-content opacity-70 text-sm">No team members yet</p>
                    <p className="text-xs text-base-content opacity-50 mt-1">
                      Add members to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity & Information Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Recent Activity */}
              <div className="bg-base-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold text-base-content mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-info rounded-full"></div>
                  Recent Activity
                </h2>
                {currentWorkspace.trackActivity && currentWorkspace.trackActivity.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-48 overflow-y-auto">
                    {currentWorkspace.trackActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="bg-base-100 p-2 sm:p-3 rounded-lg border border-base-300">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-base-content font-medium text-sm sm:text-base flex-1">
                            {activity.activity}
                          </span>
                          <span className="text-xs text-base-content opacity-60 flex-shrink-0 whitespace-nowrap">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <Activity size={32} className="mx-auto mb-2 text-base-content/30" />
                    <p className="text-base-content opacity-70 text-sm">No recent activity</p>
                    <p className="text-xs text-base-content opacity-50 mt-1">
                      Activity will appear here as the workspace is used
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline Information */}
              <div className="bg-base-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-bold text-base-content mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                  Workspace Timeline
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 sm:py-2">
                    <span className="text-base-content opacity-70 text-sm sm:text-base flex items-center gap-1">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      Created On
                    </span>
                    <span className="font-semibold text-base-content text-xs sm:text-sm text-right">
                      {formatDate(currentWorkspace.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {openAddMemberForm && (
          <Modal onClose={() => setOpenAddMemberForm(false)}>
            <AddMemberForm workspaceId={id} onClose={() => setOpenAddMemberForm(false)} />
          </Modal>
        )}

        {/* Edit Members Modal */}
        {openEditMemberForm && (
          <Modal onClose={() => setOpenEditMemberForm(false)}>
            <EditMembersList 
              workspaceId={id}
              members={currentWorkspace.members}
              onMembersUpdated={() => {
                dispatch(fetchWorkspace(id));
                setOpenEditMemberForm(false);
              }}
              onClose={() => setOpenEditMemberForm(false)}
            />
          </Modal>
        )}
      </main>
    </div>
  );
}

// Responsive Modal Component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
    <div className="bg-base-100 rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative mx-2 sm:mx-4">
      <button
        aria-label="Close modal"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1 sm:p-2 bg-base-200 hover:bg-base-300 rounded-full transition-colors"
        onClick={onClose}
      >
        <X size={16} className="sm:w-5 sm:h-5 text-base-content" />
      </button>
      <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  </div>
);