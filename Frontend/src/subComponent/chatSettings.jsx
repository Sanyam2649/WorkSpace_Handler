import React, { useState, useEffect } from "react";
import { Settings, X, Save, Lock, Edit, Users, Check } from "lucide-react";

const POLICY_OPTIONS = [
  {
    value: "admin-only",
    label: "Admin Only",
    description: "Only workspace admins can send messages",
    icon: Lock
  },
  {
    value: "admin-editor",
    label: "Admins & Editors",
    description: "Admins and editors can send messages",
    icon: Edit
  },
  {
    value: "all",
    label: "All Members",
    description: "All workspace members can send messages",
    icon: Users
  }
];

const ChatSettingsModal = ({ 
  isOpen, 
  onClose, 
  activeChat, 
  onSettingsUpdate,
  currentSettings 
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentSettings?.policy) {
      setSelectedPolicy(currentSettings.policy);
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!activeChat) return;

    setLoading(true);
    try {
      await onSettingsUpdate({
        type: activeChat.type,
        id: activeChat.roomId,
        settings: { policy: selectedPolicy }
      });
      
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to save chat settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Settings size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base-content">Chat Settings</h3>
              <p className="text-sm text-base-content/70">
                Manage conversation permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-300 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-base-content mb-2">
              Message Permissions
            </h4>
            <p className="text-sm text-base-content/70 mb-4">
              Control who can send messages in this {activeChat?.type === 'workspace' ? 'workspace' : 'chat'}
            </p>
          </div>

          <div className="space-y-3">
            {POLICY_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedPolicy === option.value
                      ? "border-primary bg-primary/5"
                      : "border-base-300 hover:border-base-400 hover:bg-base-200/50"
                  }`}
                  onClick={() => setSelectedPolicy(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedPolicy === option.value 
                        ? "bg-primary text-primary-content" 
                        : "bg-base-300 text-base-content"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base-content">
                          {option.label}
                        </span>
                        {selectedPolicy === option.value && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-base-content/70 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-base-300">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-base-300 rounded-xl hover:bg-base-300 transition-colors font-medium text-base-content"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-br from-primary to-secondary text-primary-content rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-content border-t-transparent" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={16} />
                Saved!
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;