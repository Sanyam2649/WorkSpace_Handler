import React, { useState, useEffect } from 'react';
import { Edit, User, Mail, Shield, CheckCircle, XCircle, Trash2, Save, X, MoreVertical, Search, ArrowLeft, Filter } from 'lucide-react';
import { updateWorkspaceMemberRole, removeWorkspaceMember, acceptWorkspaceRequest, rejectWorkspaceRequest } from '../api';

const roles = ["Viewer", "Editor", "Admin"];

// Individual Member Edit Form (opens inside the list modal)
const EditMemberForm = ({ workspaceId, member, onMemberUpdated, onClose, isMobile }) => {
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
        <div className={`${isMobile ? 'w-full' : 'max-w-2xl'} mx-auto p-3 sm:p-4`}>
            {/* Header - Responsive */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-base-300 rounded-lg transition-all duration-200 mr-1"
                        >
                            <ArrowLeft size={18} className="text-base-content/60" />
                        </button>
                    )}
                    <div className={`p-1.5 sm:p-2 bg-gradient-to-br from-primary to-secondary rounded-lg ${isMobile ? 'rounded-lg' : 'rounded-lg'}`}>
                        <Edit className="text-white" size={isMobile ? 16 : 20} />
                    </div>
                    <div>
                        <h2 className={`font-bold text-base-content ${isMobile ? 'text-lg' : 'text-xl'}`}>Edit Member</h2>
                        <p className="text-base-content/60 text-xs">Manage permissions and status</p>
                    </div>
                </div>
                {!isMobile && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-base-300 rounded-lg transition-all duration-200"
                    >
                        <X size={18} className="text-base-content/60" />
                    </button>
                )}
            </div>

            {/* Member Card - Responsive */}
            <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-base-300">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm`}>
                            {member.user.avatar?.url ? (
                                <img
                                    src={member.user.avatar.url}
                                    alt={`${member.user.firstName} ${member.user.lastName}`}
                                    className="w-full h-full rounded-lg sm:rounded-xl object-cover"
                                />
                            ) : (
                                <>
                                    {member.user.firstName[0]}
                                    {member.user.lastName[0]}
                                </>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-base-100 ${statusInfo.bgColor} ${statusInfo.color}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content text-sm truncate">
                            {member.user.firstName} {member.user.lastName}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                            <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                <Mail size={isMobile ? 8 : 10} />
                                <span className="truncate max-w-[120px] sm:max-w-none">{member.user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                <User size={isMobile ? 8 : 10} />
                                <span>@{member.user.username}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} whitespace-nowrap flex-shrink-0`}>
                        {statusInfo.text}
                    </div>
                </div>
            </div>

            {/* Role Management - Responsive */}
            <div className="bg-base-100 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-base-300">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Shield className="text-primary" size={isMobile ? 14 : 16} />
                    <h3 className="font-semibold text-base-content text-sm">Role & Permissions</h3>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-base-content mb-1 sm:mb-2">
                            Select Role
                        </label>
                        <div className="grid gap-1.5 sm:gap-2">
                            {roles.map((role) => (
                                <div
                                    key={role}
                                    className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedRole === role
                                            ? 'border-primary bg-primary/5'
                                            : 'border-base-300 hover:border-base-400 hover:bg-base-200'
                                        }`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedRole === role
                                                    ? 'border-primary bg-primary'
                                                    : 'border-base-400'
                                                }`}>
                                                {selectedRole === role && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-base-content text-sm">{role}</div>
                                                <div className="text-xs text-base-content/60 mt-0.5">
                                                    {getRoleDescription(role)}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedRole === role && (
                                            <CheckCircle className="text-primary flex-shrink-0" size={isMobile ? 14 : 16} />
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
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="text-xs sm:text-sm">Updating...</span>
                            </>
                        ) : (
                            <>
                                <Save size={isMobile ? 12 : 14} />
                                <span className="text-xs sm:text-sm">Update Role</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="space-y-2">
                {/* Pending Request Actions */}
                {member.isRequested && !member.isActive && (
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-2 sm:p-3">
                        <h4 className="font-semibold text-warning-content text-xs mb-1.5 sm:mb-2 flex items-center gap-1">
                            <User size={isMobile ? 10 : 12} />
                            Pending Join Request
                        </h4>
                        <div className="flex gap-1.5 sm:gap-2">
                            <button
                                onClick={handleAcceptRequest}
                                disabled={loading}
                                className="flex-1 py-1.5 px-2 bg-success text-success-content rounded-lg font-medium text-xs hover:bg-success/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                <CheckCircle size={isMobile ? 10 : 12} />
                                Accept
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                disabled={loading}
                                className="flex-1 py-1.5 px-2 bg-error text-error-content rounded-lg font-medium text-xs hover:bg-error/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                <XCircle size={isMobile ? 10 : 12} />
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
                        <Trash2 size={isMobile ? 12 : 14} />
                        <span className="text-xs sm:text-sm">Remove from Workspace</span>
                    </button>
                )}
            </div>

            {/* Status Messages - Responsive */}
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {error && (
                    <div className="p-2 rounded-lg bg-error/10 border border-error/20 text-error-content text-xs flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-error-content rounded-full flex-shrink-0"></div>
                        <div className="flex-1 text-xs">{error}</div>
                    </div>
                )}

                {success && (
                    <div className="p-2 rounded-lg bg-success/10 border border-success/20 text-success-content text-xs flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle size={isMobile ? 12 : 14} className="flex-shrink-0" />
                        <div className="flex-1 text-xs">{success}</div>
                    </div>
                )}
            </div>

            {/* Current Role Info - Responsive */}
            <div className="mt-3 sm:mt-4 p-2 bg-base-200 rounded-lg border border-base-300">
                <div className="text-xs text-base-content/60 text-center">
                    Current: <span className="font-semibold text-base-content">{member.roles[0]}</span>
                </div>
            </div>
        </div>
    );
};

// Mobile Bottom Sheet for Member Edit
const MobileMemberEditSheet = ({ workspaceId, member, onMemberUpdated, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Bottom Sheet */}
            <div 
                className="relative bg-base-100 rounded-t-2xl shadow-2xl w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="flex justify-center p-3">
                    <div className="w-12 h-1 bg-base-300 rounded-full"></div>
                </div>

                {/* Content */}
                <EditMemberForm
                    workspaceId={workspaceId}
                    member={member}
                    onMemberUpdated={onMemberUpdated}
                    onClose={onClose}
                    isMobile={true}
                />
            </div>
        </div>
    );
};

// Main Edit Members List Modal
const EditMembersList = ({ workspaceId, members, onMembersUpdated, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState(members);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'pending', 'inactive'

    // Filter members based on search and status
    useEffect(() => {
        let filtered = members;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(member =>
                member.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(member => {
                if (statusFilter === 'active') return member.isActive;
                if (statusFilter === 'pending') return member.isRequested && !member.isActive;
                if (statusFilter === 'inactive') return !member.isActive && !member.isRequested;
                return true;
            });
        }

        setFilteredMembers(filtered);
    }, [searchQuery, statusFilter, members]);

    const getStatusInfo = (member) => {
        if (member.isRequested && !member.isActive) {
            return { type: 'pending', text: 'Pending', color: 'text-warning' };
        }
        if (member.isActive) {
            return { type: 'active', text: 'Active', color: 'text-success' };
        }
        return { type: 'inactive', text: 'Inactive', color: 'text-error' };
    };

    const isMobile = window.innerWidth < 768;

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-4 lg:p-6">
            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:flex sm:gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={isMobile ? 16 : 20} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-base-300 rounded-lg sm:rounded-xl bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    />
                </div>
                {isMobile ? (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                        <option value="all">All Members</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>
                ) : (
                    <div className="flex gap-1 bg-base-200 border border-base-300 rounded-xl p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'active', label: 'Active' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'inactive', label: 'Inactive' }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    statusFilter === filter.value
                                        ? 'bg-primary text-primary-content shadow-sm'
                                        : 'text-base-content/60 hover:text-base-content hover:bg-base-300'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Members List - Responsive */}
            <div className="bg-base-100 rounded-xl sm:rounded-2xl border border-base-300 overflow-hidden">
                <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                        <div className="divide-y divide-base-300">
                            {filteredMembers.map((member) => {
                                const statusInfo = getStatusInfo(member);
                                return (
                                    <div
                                        key={member.user._id}
                                        className="p-3 sm:p-4 hover:bg-base-200 transition-all duration-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                                                        {member.user.avatar?.url ? (
                                                            <img
                                                                src={member.user.avatar.url}
                                                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                                                className="w-full h-full rounded-lg sm:rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <>
                                                                {member.user.firstName[0]}
                                                                {member.user.lastName[0]}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-base-100 ${
                                                        statusInfo.type === 'active' ? 'bg-success' :
                                                        statusInfo.type === 'pending' ? 'bg-warning' : 'bg-error'
                                                    }`}></div>
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                        <h3 className="font-semibold text-base-content text-sm truncate">
                                                            {member.user.firstName} {member.user.lastName}
                                                        </h3>
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusInfo.color} bg-opacity-10 border ${statusInfo.color.replace('text', 'border')} opacity-70`}>
                                                            {statusInfo.text}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                                        <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                                            <Mail size={isMobile ? 10 : 12} />
                                                            <span className="truncate max-w-[100px] sm:max-w-[140px] md:max-w-none">
                                                                {member.user.email}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-base-content/60 text-xs">
                                                            <User size={isMobile ? 10 : 12} />
                                                            <span>@{member.user.username}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Button */}
                                            <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                                                <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                                    member.roles[0] === 'Admin' ? 'bg-secondary text-secondary-content' :
                                                    member.roles[0] === 'Editor' ? 'bg-primary text-primary-content' :
                                                    'bg-base-300 text-base-content'
                                                }`}>
                                                    {member.roles[0]}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="p-1.5 sm:p-2 rounded-lg bg-base-300 text-base-content/60 hover:bg-primary hover:text-primary-content transition-all duration-200 hover:scale-110 group-hover:bg-primary group-hover:text-primary-content"
                                                    title="Edit member"
                                                >
                                                    <MoreVertical size={isMobile ? 14 : 16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12">
                            <Search size={isMobile ? 32 : 48} className="text-base-content/30 mx-auto mb-2 sm:mb-3" />
                            <p className="text-base-content/70 text-sm sm:text-base">No members found matching your search</p>
                            <p className="text-base-content/50 text-xs sm:text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="mt-3 text-center">
                <p className="text-base-content/60 text-xs sm:text-sm">
                    Showing {filteredMembers.length} of {members.length} members
                </p>
            </div>

            {/* Individual Member Edit Modal/Sheet */}
            {selectedMember && (
                isMobile ? (
                    <MobileMemberEditSheet
                        workspaceId={workspaceId}
                        member={selectedMember}
                        onMemberUpdated={() => {
                            if (onMembersUpdated) onMembersUpdated();
                            setSelectedMember(null);
                        }}
                        onClose={() => setSelectedMember(null)}
                    />
                ) : (
                    <div className="z-50 flex items-center justify-center p-2 sm:p-4">
                        <div className="bg-base-100 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                            <EditMemberForm
                                workspaceId={workspaceId}
                                member={selectedMember}
                                onMemberUpdated={() => {
                                    if (onMembersUpdated) onMembersUpdated();
                                    setSelectedMember(null);
                                }}
                                onClose={() => setSelectedMember(null)}
                                isMobile={false}
                            />
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default EditMembersList;