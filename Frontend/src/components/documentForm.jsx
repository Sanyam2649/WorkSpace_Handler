
import React, { useState, useEffect } from "react";
import { FileText, X, Upload, Save, Edit3 } from "lucide-react";

export default function DocumentForm({ initialData = {}, onSubmit, onClose }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialData.title || "");
    setContent(initialData.content || "");
    setFiles([]);
  }, [initialData._id]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const removeFile = (index) => {
    const newFiles = Array.from(files).filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(
        { title, content },
        files.length > 0 ? files : null
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!initialData._id;

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Title Field */}
        <div className="space-y-2 md:space-y-3">
          <label htmlFor="title" className="block text-sm font-semibold text-base-content">
            Document Title
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-base-100 border-2 border-base-300 rounded-lg md:rounded-xl text-base-content placeholder-base-content/50 focus:border-primary focus:ring-2 md:focus:ring-4 focus:ring-primary/15 transition-all duration-200 text-sm md:text-base"
              placeholder="Enter a descriptive title..."
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Content Field */}
        <div className="space-y-2 md:space-y-3">
          <label htmlFor="content" className="block text-sm font-semibold text-base-content">
            Document Content
          </label>
          <div className="relative">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-base-100 border-2 border-base-300 rounded-lg md:rounded-xl text-base-content placeholder-base-content/50 focus:border-primary focus:ring-2 md:focus:ring-4 focus:ring-primary/15 transition-all duration-200 resize-vertical min-h-28 md:min-h-32 text-sm md:text-base"
              placeholder="Write your document content here..."
              required
              disabled={isSubmitting}
              rows={4}
            />
            <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs text-base-content/40">
              {content.length} characters
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2 md:space-y-3">
          <label htmlFor="files" className="block text-sm font-semibold text-base-content">
            Attach Files
          </label>
          <div className="border-2 border-dashed border-base-300 rounded-lg md:rounded-xl p-4 md:p-6 transition-all duration-200 hover:border-primary/50 hover:bg-base-200/50">
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <label htmlFor="files" className="cursor-pointer block text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent to-info/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Upload className="text-accent" size={18} md:size={24} />
              </div>
              <p className="text-base-content font-medium mb-1 text-sm md:text-base">
                Click to upload files
              </p>
              <p className="text-base-content/60 text-xs md:text-sm">
                Supports multiple files • Max 10MB each
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <p className="text-sm font-medium text-base-content">
                Selected files ({files.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(files).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 md:p-3 bg-base-200 border border-base-300 rounded-lg group hover:bg-base-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <FileText size={14} md:size={16} className="text-base-content/60 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-base-content truncate flex-1">
                        {file.name}
                      </span>
                      <span className="text-xs text-base-content/40 flex-shrink-0 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-error/20 rounded transition-colors duration-200 flex-shrink-0 ml-2"
                      disabled={isSubmitting}
                    >
                      <X size={12} md:size={14} className="text-error" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t-2 border-base-300">
          <button
            type="button"
            onClick={onClose}
            className="px-4 md:px-6 py-2 md:py-3 bg-base-200 text-base-content border-2 border-base-300 rounded-lg md:rounded-xl hover:bg-base-300 hover:border-base-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base order-2 sm:order-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg md:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2 mb-2 sm:mb-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                <span>{isEditMode ? "Updating..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <Save size={16} md:size={18} />
                <span>{isEditMode ? "Update" : "Create"} Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}