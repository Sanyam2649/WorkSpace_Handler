import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { fetchWorkspace } from "../reducer/thunks/WorkSpaceThunk";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Edit, Plus, Search, SquarePen } from "lucide-react";
import AddMemberForm from "../components/AddMemberForm";
import EditMembersList from "../components/EditMemberForm";

export default function WorkspaceDetail({workspaceId}) {
  
  const dispatch = useDispatch();
  const  id  =  workspaceId
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [openAddMemberForm , setOpenAddMemberForm] = useState(false);
  const [openEditMemberForm , setOpenEditMemberForm] = useState(false);

  const handleAddMember = () => {
    setOpenAddMemberForm(true);
  }
  
    const handleEditMember = () => {
    setOpenEditMemberForm(true);
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content">Loading workspace details...</p>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const getStatusBadge = (isActive, isRequested) => {
  if (isRequested && !isActive) return "badge-warning text-black";
  if (isActive) return "badge-success text-white";
  return "badge-neutral text-gray-800";
};

const getStatusText = (isActive, isRequested) => {
  if (isRequested && !isActive) return "Pending";
  if (isActive) return "Active";
  return "Inactive";
};

  return (
      <div className="max-w-7xl h-fit mx-auto bg-base-100 p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-base-200 rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl  text-base-content mb-2">
                {currentWorkspace.name}
              </h1>
              <p className="text-lg text-base-content opacity-80">
                {currentWorkspace.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content opacity-70">Workspace ID</div>
              <div className="font-mono text-xs text-base-content opacity-60">
                {currentWorkspace.slug}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 overflow-y-auto">
          <div className="bg-primary text-primary-content p-6 rounded-xl shadow-lg">
            <div className="text-3xl ">{currentWorkspace.members?.length || 0}</div>
            <div className="text-sm opacity-90">Team Members</div>
          </div>
          <div className="bg-success text-success-content p-6 rounded-xl shadow-lg">
            <div className="text-3xl ">{currentWorkspace.documents?.length || 0}</div>
            <div className="text-sm opacity-90">Documents</div>
          </div>
          <div className="bg-info text-info-content p-6 rounded-xl shadow-lg">
            <div className="text-3xl ">{currentWorkspace.trackActivity?.length || 0}</div>
            <div className="text-sm opacity-90">Activities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          {/* Team Members Section */}
       <div className="bg-base-200 rounded-2xl p-6 shadow-lg overflow-y-auto">
            <h2 className="text-xl  text-base-content mb-4 flex items-center justify-between">
              Team Members
                          <div className="flex flex-row gap-2">
                              <Search  />
                              <SquarePen onClick={handleEditMember} />
                              <Plus onClick={handleAddMember}/>
                          </div>
                                        {openAddMemberForm && (
                                          <Modal onClose={() => setOpenAddMemberForm(false)}>
                                            <AddMemberForm workspaceId={id} />
                                          </Modal>
                                        )}
                                        
                                           {openEditMemberForm && (
                                           <Modal onClose={() => setOpenEditMemberForm(false)}>
    <EditMembersList 
      workspaceId={id}
      members={currentWorkspace.members}
      onMembersUpdated={() => {
        dispatch(fetchWorkspace(id)); // Refresh workspace data
        setOpenEditMemberForm(false);
      }}
      onClose={() => setOpenEditMemberForm(false)}
    />
  </Modal>
                                        )}
            </h2>

            <div className="space-y-4">
              {currentWorkspace.members?.map((member) => (
                <div
                  key={member.user._id}
                  className="bg-base-100 p-4 rounded-lg border border-base-300 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-accent text-accent-content font-semibold">
                          {member?.user?.avatar?.url ? (
                            <img
                              src={member.user.avatar.url}
                              alt={`${member.user.firstName} ${member.user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {member.user.firstName} {member.user.lastName}
                        </h3>
                        <p className="text-xs text-base-content opacity-50">
                          @{member.user.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                  <div className="text-right">
                        <div className="badge badge-secondary badge-lg mb-2">
                          {member.roles[0]}
                        </div>
                        <div className={`badge badge-lg ${getStatusBadge(member.isActive, member.isRequested)}`}>
                          {getStatusText(member.isActive, member.isRequested)}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity & Information Section */}
          <div className="space-y-6">
                        <div className="bg-base-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl  text-base-content mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                Recent Activity
              </h2>
              {currentWorkspace.trackActivity && currentWorkspace.trackActivity.length > 0 ? (
                <div className="space-y-3 overflow-hidden min-h-[200px]">
                  {currentWorkspace.trackActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="bg-base-100 p-3 rounded-lg border border-base-300">
                      <div className="flex justify-between items-start">
                        <span className="text-base-content font-medium">{activity.activity}</span>
                        <span className="text-xs text-base-content opacity-60">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-base-content opacity-70">No recent activity</p>
                  <p className="text-sm text-base-content opacity-50 mt-1">
                    Activity will appear here as the workspace is used
                  </p>
                </div>
              )}
            </div>
            {/* Timeline Information */}
            <div className="bg-base-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl  text-base-content mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Workspace Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-base-content opacity-70">Created On</span>
                  <span className="font-semibold text-base-content">
                    {formatDate(currentWorkspace.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// Modal Component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center p-6">
    <div className="bg-base-100 rounded-lg shadow p-6 max-w-4xl w-full max-h-full relative">
      <button
        aria-label="Close modal"
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900  text-2xl"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  </div>
);