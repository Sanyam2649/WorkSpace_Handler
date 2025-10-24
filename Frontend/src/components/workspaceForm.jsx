import { useState, useEffect } from 'react';
import { createWorkspace, updateWorkspace } from '../api';
import { X, Loader } from 'lucide-react';

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
    <div className="flex items-center justify-center p-4 z-50 md:p-6">
      <div className="bg-white rounded-xl w-full max-w-md md:max-w-lg mx-auto shadow-xl max-h-[90vh] overflow-hidden">
        {/* Form Content */}
        <div className="overflow-y-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Workspace Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter workspace name"
                required
                disabled={loading}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-vertical text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Optional description"
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Describe the purpose of this workspace (optional)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transform hover:scale-105 active:scale-95 transition-all duration-200 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditMode ? 'Update Workspace' : 'Create Workspace'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceForm;