import React, { useState } from 'react';
import { searchMembers, addWorkspaceMember } from '../api';
import { Plus,  X, Search, User, Mail } from 'lucide-react';

const roles = ["Viewer", "Editor", "Admin"];

const AddMemberForm = ({ workspaceId, onMemberAdded, onClose }) => {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Viewer');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setSearching(true);
    setSearchError('');
    setResults([]);
    try {
      const out = await searchMembers(search);
      setResults(out);
    } catch (err) {
      setSearchError(err.message || 'Error searching members');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (user) => {
    setAddError('');
    setAddSuccess(false);
    try {
      await addWorkspaceMember(workspaceId, { userId: user._id, role: selectedRole });
      setAddSuccess(true);
      setTimeout(() => {
        if (onMemberAdded) onMemberAdded(user);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setAddError(err.message || 'Failed to add member');
    } 
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-start items-center pb-2">
          <h2 className="text-2xl font-semibold text-base-content">Add Team Member</h2>
      </div>
      <div>
        {/* Search Section */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={20} />
              <input
                className="w-full pl-10 pr-4 py-3 border border-base-300 rounded-xl bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email address..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-info text-info-content font-medium hover:bg-info/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={searching || !search.trim()}
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-info-content/30 border-t-info-content rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </form>
          {searchError && (
            <div className="mt-3 p-3 rounded-lg bg-error/10 border border-error/20 text-error-content">
              {searchError}
            </div>
          )}
        </div>

        {/* Role Picker */}
        <div className="mb-6 p-4 bg-base-200 rounded-xl">
          <label htmlFor="role" className="block text-sm font-medium text-base-content mb-2">
            Assign Role
          </label>
          <div className="flex items-center gap-3">
            <select
              id="role"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="flex-1 px-4 py-3 border border-base-300 rounded-xl bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="text-sm text-base-content/70">
              Can {selectedRole === 'Admin' ? 'manage everything' : selectedRole === 'Editor' ? 'edit content' : 'view only'}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-base-content mb-3">
            Search Results {results.length > 0 && `(${results.length})`}
          </h3>
          
          {results.length > 0 ? (
            <div className="space-y-2 overflow-y-auto">
              {results.map(user => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{user.name}</div>
                      <div className="flex items-center gap-1 text-sm text-base-content/70">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg bg-success text-success-content hover:bg-success/90 active:scale-95 transition-all duration-200 flex items-center gap-2 font-medium"
                    onClick={() => handleAdd(user)}
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              ))}
            </div>
          ) : searching ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-base-content/70">Searching for members...</p>
            </div>
          ) : search ? (
            <div className="text-center py-8 bg-base-200 rounded-xl">
              <Search size={48} className="text-base-content/30 mx-auto mb-3" />
              <p className="text-base-content/70">No members found. Try a different search term.</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-base-200 rounded-xl">
              <User size={48} className="text-base-content/30 mx-auto mb-3" />
              <p className="text-base-content/70">Search for members by name or email address</p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {addError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error-content flex items-center gap-2">
              <div className="w-2 h-2 bg-error-content rounded-full"></div>
              {addError}
            </div>
          )}
          {addSuccess && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success-content flex items-center gap-2">
              <div className="w-2 h-2 bg-success-content rounded-full"></div>
              Member added successfully! Closing...
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddMemberForm;