// components/documentForm.jsx
import React, { useState, useEffect } from "react";

export default function DocumentForm({ initialData = {}, onSubmit, onClose }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setTitle(initialData.title || "");
    setContent(initialData.content || "");
    setFiles([]);
  }, [initialData._id]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(
      { title, content },
      files.length > 0 ? files : null
    );
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        {initialData._id ? "Edit Document" : "Create Document"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="title" className="font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Document title"
            required
          />
        </div>
        {/* Content */}
        <div className="flex flex-col">
          <label htmlFor="content" className="font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded p-2 w-full h-20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-y-auto"
            placeholder="Write your document content..."
            required
          />
        </div>
        {/* Files Upload */}
        <div className="flex flex-col">
          <label htmlFor="files" className="font-medium mb-1">
            Attach Files
          </label>
          <input
            type="file"
            id="files"
            multiple
            onChange={handleFileChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {files.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
              {Array.from(files).map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        {/* Submit */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {initialData._id ? "Update Document" : "Create Document"}
          </button>
        </div>
      </form>
    </>
  );
}