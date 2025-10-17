import React, { useState } from 'react';
import { Edit, User, Mail, Shield, CheckCircle, XCircle, Trash2, Save, X, MoreVertical, Search } from 'lucide-react';
import { updateWorkspaceMemberRole, removeWorkspaceMember, acceptWorkspaceRequest, rejectWorkspaceRequest } from '../api';

const roles = ["Viewer", "Editor", "Admin"];

// Individual Member Edit Form (opens inside the list modal)
const EditMemberForm = ({ workspaceId, member, onMemberUpdated, onClose }) => {
    const [selectedRole, setSelectedRole] = useState(member.roles[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdateRole = async () => {
        if (selectedRole === member.roles[0]) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateWorkspaceMemberRole(workspaceId, member.user._id, [selectedRole]);
            setSuccess('Role updated successfully!');
            setTimeout(() => {
                if (onMemberUpdated) onMemberUpdated();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!confirm(`Are you sure you want to remove ${member.user.firstName} ${member.user.lastName} from this workspace?`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await removeWorkspaceMember(workspaceId, member.user._id);
            setSuccess('Member removed successfully!');
            setTimeout(() => {
                if (onMemberUpdated) onMemberUpdated();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setLoading(true);
        setError('');

        try {
            await acceptWorkspaceRequest(workspaceId, member.user._id);
            setSuccess('Request accepted successfully!');
            setTimeout(() => {
                if (onMemberUpdated) onMemberUpdated();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to accept request');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!confirm(`Are you sure you want to reject ${member.user.firstName}'s join request?`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await rejectWorkspaceRequest(workspaceId, member.user._id);
            setSuccess('Request rejected successfully!');
            setTimeout(() => {
                if (onMemberUpdated) onMemberUpdated();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to reject request');
        } finally {
            setLoading(false);
        }
    };

    const getRoleDescription = (role) => {
        const descriptions = {
            Viewer: "Can view content but cannot make changes",
            Editor: "Can create and edit documents and content",
            Admin: "Full access including member management and settings"
        };
        return descriptions[role] || '';
    };

    const getStatusInfo = () => {
        if (member.isRequested && !member.isActive) {
            return {
                type: 'pending',
                text: 'Pending Approval',
                color: 'text-warning',
                bgColor: 'bg-warning/10',
                borderColor: 'border-warning/20'
            };
        }
        if (member.isActive) {
            return {
                type: 'active',
                text: 'Active Member',
                color: 'text-success',
                bgColor: 'bg-success/10',
                borderColor: 'border-success/20'
            };
        }
        return {
            type: 'inactive',
            text: 'Inactive',
            color: 'text-error',
            bgColor: 'bg-error/10',
            borderColor: 'border-error/20'
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Header - Compact */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                        <Edit className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-base-content">Edit Member</h2>
                        <p className="text-base-content/60 text-xs">Manage permissions and status</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-base-300 rounded-lg transition-all duration-200"
                >
                    <X size={18} className="text-base-content/60" />
                </button>
            </div>

            {/* Member Card - Compact */}
            <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-xl p-4 mb-4 border border-base-300">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                            {member.user.avatar?.url ? (
                                <img
                                    src={member.user.avatar.url}
                                    alt={`${member.user.firstName} ${member.user.lastName}`}
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            ) : (
                                <>
                                    {member.user.firstName[0]}
                                    {member.user.lastName[0]}
                                </>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-base-100 ${statusInfo.bgColor} ${statusInfo.color}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content text-sm truncate">
                            {member.user.firstName} {member.user.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                <Mail size={10} />
                                <span className="truncate">{member.user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                <User size={10} />
                                <span>@{member.user.username}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} whitespace-nowrap`}>
                        {statusInfo.text}
                    </div>
                </div>
            </div>

            {/* Role Management - Compact */}
            <div className="bg-base-100 rounded-xl p-4 mb-4 border border-base-300">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="text-primary" size={16} />
                    <h3 className="font-semibold text-base-content text-sm">Role & Permissions</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-base-content mb-2">
                            Select Role
                        </label>
                        <div className="grid gap-2">
                            {roles.map((role) => (
                                <div
                                    key={role}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedRole === role
                                            ? 'border-primary bg-primary/5'
                                            : 'border-base-300 hover:border-base-400 hover:bg-base-200'
                                        }`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedRole === role
                                                    ? 'border-primary bg-primary'
                                                    : 'border-base-400'
                                                }`}>
                                                {selectedRole === role && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-base-content text-sm">{role}</div>
                                                <div className="text-xs text-base-content/60 mt-0.5">
                                                    {getRoleDescription(role)}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedRole === role && (
                                            <CheckCircle className="text-primary" size={16} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleUpdateRole}
                        disabled={loading || selectedRole === member.roles[0]}
                        className="w-full py-2 px-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold text-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                Update Role
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="space-y-2">
                {/* Pending Request Actions */}
                {member.isRequested && !member.isActive && (
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                        <h4 className="font-semibold text-warning-content text-xs mb-2 flex items-center gap-1">
                            <User size={12} />
                            Pending Join Request
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAcceptRequest}
                                disabled={loading}
                                className="flex-1 py-1.5 px-2 bg-success text-success-content rounded-lg font-medium text-xs hover:bg-success/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                <CheckCircle size={12} />
                                Accept
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                disabled={loading}
                                className="flex-1 py-1.5 px-2 bg-error text-error-content rounded-lg font-medium text-xs hover:bg-error/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                <XCircle size={12} />
                                Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* Remove Member */}
                {!member.isRequested && (
                    <button
                        onClick={handleRemoveMember}
                        disabled={loading}
                        className="w-full py-2 px-3 bg-error text-error-content rounded-lg font-semibold text-sm hover:bg-error/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        <Trash2 size={14} />
                        Remove from Workspace
                    </button>
                )}
            </div>

            {/* Status Messages - Compact */}
            <div className="mt-4 space-y-2">
                {error && (
                    <div className="p-2 rounded-lg bg-error/10 border border-error/20 text-error-content text-xs flex items-center gap-2">
                        <div className="w-2 h-2 bg-error-content rounded-full flex-shrink-0"></div>
                        <div className="flex-1">{error}</div>
                    </div>
                )}

                {success && (
                    <div className="p-2 rounded-lg bg-success/10 border border-success/20 text-success-content text-xs flex items-center gap-2">
                        <CheckCircle size={14} className="flex-shrink-0" />
                        <div className="flex-1">{success}</div>
                    </div>
                )}
            </div>

            {/* Current Role Info - Compact */}
            <div className="mt-4 p-2 bg-base-200 rounded-lg border border-base-300">
                <div className="text-xs text-base-content/60 text-center">
                    Current: <span className="font-semibold text-base-content">{member.roles[0]}</span>
                </div>
            </div>
        </div>
    );
};

// Main Edit Members List Modal
const EditMembersList = ({ workspaceId, members, onMembersUpdated}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members);

    // Filter members based on search
    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member =>
                member.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(filtered);
        }
    }, [searchQuery, members]);
    return (
        <div className="max-w-6xl mx-auto p-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                        <Edit className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-base-content">Manage Team Members</h2>
                        <p className="text-base-content/60 text-sm">
                            {members.length} member{members.length !== 1 ? 's' : ''} in workspace
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search members by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-base-300 rounded-xl bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                </div>
            </div>

            {/* Members List */}
            <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                        <div className="divide-y divide-base-300">
                            {filteredMembers.map((member) => {
                                return (
                                    <div
                                        key={member.user._id}
                                        className="p-4 hover:bg-base-200 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-lg">
                                                        {member.user.avatar?.url ? (
                                                            <img
                                                                src={member.user.avatar.url}
                                                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                                                className="w-full h-full rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <>
                                                                {member.user.firstName[0]}
                                                                {member.user.lastName[0]}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base-content truncate">
                                                        {member.user.firstName} {member.user.lastName}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                        <div className="flex items-center gap-1 text-base-content/60 text-sm">
                                                            <Mail size={12} />
                                                            <span>{member.user.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-base-content/60 text-sm">
                                                            <User size={12} />
                                                            <span>@{member.user.username}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Button */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="p-2 rounded-lg bg-base-300 text-base-content/60 hover:bg-primary hover:text-primary-content transition-all duration-200 hover:scale-110 group-hover:bg-primary group-hover:text-primary-content"
                                                    title="Edit member"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Search size={48} className="text-base-content/30 mx-auto mb-3" />
                            <p className="text-base-content/70">No members found matching your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Member Edit Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <EditMemberForm
                            workspaceId={workspaceId}
                            member={selectedMember}
                            onMemberUpdated={() => {
                                if (onMembersUpdated) onMembersUpdated();
                                setSelectedMember(null);
                            }}
                            onClose={() => setSelectedMember(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditMembersList;