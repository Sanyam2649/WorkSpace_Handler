import React, { useState } from 'react';
import { searchMembers, addWorkspaceMember } from '../api';

const roles = ["Viewer", "Editor", "Admin"];

const AddMemberForm = ({ workspaceId, onMemberAdded }) => {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Viewer');
  const [addingIds, setAddingIds] = useState([]);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
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
    setAddingIds(ids => [...ids, user._id]); // show loading for this user
    setAddError('');
    setAddSuccess(false);
    try {
      await addWorkspaceMember(workspaceId, { userId: user._id, role: selectedRole });
      setAddSuccess(true);
      if (onMemberAdded) onMemberAdded(user);
    } catch (err) {
      setAddError(err.message || 'Failed to add member');
    } finally {
      setAddingIds(ids => ids.filter(id => id !== user._id));
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Add Workspace Member</h2>

      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members by name or email"
        />
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={searching}
        >{searching ? "Searching..." : "Search"}</button>
      </form>
      {searchError && <p className="text-red-600 mb-2">{searchError}</p>}

      {/* Role Picker */}
      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="role" className="font-medium">Role:</label>
        <select
          id="role"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {results.map(user => (
              <li key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <span>
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 text-gray-500 text-sm">{user.email}</span>
                </span>
                <button
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                  disabled={addingIds.includes(user._id)}
                  onClick={() => handleAdd(user)}
                >
                  {addingIds.includes(user._id) ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
        ) : searching ? (
          <p className="text-gray-500">Searching...</p>
        ) : (
          <p className="text-gray-400">No results. Try searching above.</p>
        )}
      </div>

      {addError && <p className="text-red-600 mt-2">{addError}</p>}
      {addSuccess && <p className="text-green-600 mt-2">Member added!</p>}
    </>
  );
};

export default AddMemberForm;
