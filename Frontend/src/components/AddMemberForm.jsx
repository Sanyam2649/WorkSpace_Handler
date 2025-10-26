import React, { useState } from 'react';
import { searchMembers, addWorkspaceMember } from '../api';
import { Plus, X, Search, User, Mail, Loader2 } from 'lucide-react';
import { useToast } from '../context/useToast';

const roles = ["Viewer", "Editor", "Admin"];

const AddMemberForm = ({ workspaceId, onMemberAdded, onClose }) => {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Viewer');
  const [addSuccess, setAddSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      showToast('Please enter a search term', 'warning');
      return;
    }
    
    setSearching(true);
    setSearchError('');
    setResults([]);
    try {
      showToast('Searching for members...', 'info');
      const out = await searchMembers(search);
      setResults(out);
      if (out.length === 0) {
        showToast('No members found with that search term', 'info');
      } else {
        showToast(`Found ${out.length} member(s)`, 'success');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error searching members';
      setSearchError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (user) => {
    setAddSuccess(false);
    try {
      showToast(`Adding ${user.name || user.email} as ${selectedRole}...`, 'info');
      await addWorkspaceMember(workspaceId, { userId: user._id, role: selectedRole });
      setAddSuccess(true);
      showToast(`Successfully added ${user.name || user.email} as ${selectedRole}`, 'success');
      setTimeout(() => {
        if (onMemberAdded) onMemberAdded(user);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      const errorMessage = err.message || 'Failed to add member';
      showToast(errorMessage, 'error');
    } 
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    showToast(`Role set to ${newRole}`, 'info');
  };

  const handleClose = () => {
    showToast('Closing add member form', 'info');
    if (onClose) onClose();
  };

  const handleClearSearch = () => {
    setSearch('');
    setResults([]);
    setSearchError('');
    showToast('Search cleared', 'info');
  };

  return (
    <div className="w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        {/* Search Section */}
        <div className="mb-4 sm:mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-base-300 rounded-lg sm:rounded-xl bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name or email..."
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-info text-info-content font-medium hover:bg-info/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0"
              disabled={searching || !search.trim()}
            >
              {searching ? (
                <>
                  <Loader2 size={16} className="sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching</span>
                </>
              ) : (
                <>
                  <Search size={16} className="sm:w-4 sm:h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
          {searchError && (
            <div className="mt-2 p-2 sm:p-3 rounded-lg bg-error/10 border border-error/20 text-error-content text-sm sm:text-base">
              {searchError}
            </div>
          )}
        </div>

        {/* Role Picker */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-base-200 rounded-lg sm:rounded-xl">
          <label htmlFor="role" className="block text-sm font-medium text-base-content mb-2">
            Assign Role
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              id="role"
              value={selectedRole}
              onChange={handleRoleChange}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-base-300 rounded-lg sm:rounded-xl bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="text-xs sm:text-sm text-base-content/70 text-center sm:text-left mt-1 sm:mt-0">
              Can {selectedRole === 'Admin' ? 'manage everything' : selectedRole === 'Editor' ? 'edit content' : 'view only'}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-medium text-base-content mb-3 flex items-center gap-2">
            <User size={18} className="sm:w-5 sm:h-5" />
            Search Results {results.length > 0 && `(${results.length})`}
          </h3>
          
          {results.length > 0 ? (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
              {results.map(user => (
                <div 
                  key={user._id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-base-200 rounded-lg sm:rounded-xl hover:bg-base-300 transition-all duration-200 border border-transparent hover:border-primary/20 gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || <User size={16} className="sm:w-5 sm:h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-base-content text-sm sm:text-base truncate">
                        {user.name || 'Unnamed User'}
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-base-content/70 truncate">
                        <Mail size={12} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    className="px-3 sm:px-4 py-2 rounded-lg bg-success text-success-content hover:bg-success/90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0"
                    onClick={() => handleAdd(user)}
                  >
                    <Plus size={16} className="sm:w-4 sm:h-4" />
                    <span>Add Member</span>
                  </button>
                </div>
              ))}
            </div>
          ) : searching ? (
            <div className="text-center py-6 sm:py-8 bg-base-200 rounded-lg sm:rounded-xl">
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-base-content/70 text-sm sm:text-base">Searching for members...</p>
            </div>
          ) : search ? (
            <div className="text-center py-6 sm:py-8 bg-base-200 rounded-lg sm:rounded-xl">
              <Search size={32} className="text-base-content/30 mx-auto mb-3" />
              <p className="text-base-content/70 text-sm sm:text-base">No members found</p>
              <p className="text-xs text-base-content/50 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 bg-base-200 rounded-lg sm:rounded-xl">
              <User size={32} className="text-base-content/30 mx-auto mb-3" />
              <p className="text-base-content/70 text-sm sm:text-base">Search for members</p>
              <p className="text-xs text-base-content/50 mt-1">Enter a name or email address above</p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {addSuccess && (
            <div className="p-2 sm:p-3 rounded-lg bg-success/10 border border-success/20 text-success-content flex items-center gap-2 text-sm sm:text-base">
              <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
              Member added successfully! Closing...
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Footer */}
      <div className="sm:hidden pt-4 border-t border-base-300 mt-4">
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 border border-base-300 text-base-content rounded-lg hover:bg-base-200 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AddMemberForm;