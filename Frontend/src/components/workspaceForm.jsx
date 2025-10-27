import { useState, useEffect } from 'react';
import { createWorkspace, updateWorkspace } from '../api';
import { useToast } from '../context/useToast';
import { X, Loader } from 'lucide-react';

const WorkspaceForm = ({ workspace = null, onSubmitSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // Initialize form when workspace changes
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [workspace]);

  const isEditMode = Boolean(workspace);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      const errorMessage = 'Workspace name is required';
      showToast(errorMessage, 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // Update existing workspace
        await updateWorkspace(workspace._id, { name, description });
        const updatedWorkspace = { ...workspace, name, description };
        if (onSubmitSuccess) onSubmitSuccess(updatedWorkspace);
      } else {
        const newWorkspace = await createWorkspace({ name, description });
        if (onSubmitSuccess) onSubmitSuccess(newWorkspace);
      }
      onClose();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save workspace';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showToast(isEditMode ? 'Edit cancelled' : 'Creation cancelled', 'info');
    onClose();
  };

  const handleNameChange = (value) => {
    setName(value);
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  return (
      <div>
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
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter workspace name"
                required
                disabled={loading}
                maxLength={100}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Required field</span>
                <span>{name.length}/100</span>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-vertical text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Optional description"
                rows={3}
                disabled={loading}
                maxLength={500}
              />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  Describe the purpose of this workspace (optional)
                </p>
                <span className="text-xs text-gray-500">{description.length}/500</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Tips */}
            {!isEditMode && !error && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Workspace Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Choose a clear, descriptive name for your workspace</li>
                  <li>• Add team members after creation to start collaborating</li>
                  <li>• You can always edit these details later</li>
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
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

  );
};

export default WorkspaceForm;