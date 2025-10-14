import { useState, useEffect } from 'react';
import { createWorkspace, updateWorkspace } from '../api';

const WorkspaceForm = ({ workspace = null, onSubmitSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when workspace changes
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [workspace]);

  const isEditMode = Boolean(workspace);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // Update existing workspace
        await updateWorkspace(workspace._id, { name, description });
        if (onSubmitSuccess) onSubmitSuccess({ ...workspace, name, description });
      } else {
        // Create new workspace
        const newWorkspace = await createWorkspace({ name, description });
        if (onSubmitSuccess) onSubmitSuccess(newWorkspace);
      }
      // Close form after success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block font-medium mb-1">
          Workspace Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter workspace name"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Optional description"
          rows={4}
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default WorkspaceForm;
