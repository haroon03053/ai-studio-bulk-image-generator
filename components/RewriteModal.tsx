import React, { useState, useEffect } from 'react';
import { RewriteIcon } from './icons/RewriteIcon';

interface RewriteModalProps {
  isOpen: boolean;
  originalPrompt: string;
  onClose: () => void;
  onRewrite: (newPrompt: string) => void;
}

export const RewriteModal: React.FC<RewriteModalProps> = ({
  isOpen,
  originalPrompt,
  onClose,
  onRewrite,
}) => {
  const [editedPrompt, setEditedPrompt] = useState(originalPrompt);

  useEffect(() => {
    if (isOpen) {
      setEditedPrompt(originalPrompt);
    }
  }, [isOpen, originalPrompt]);

  const handleRewriteClick = () => {
    if (editedPrompt.trim()) {
      onRewrite(editedPrompt.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewrite-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
            <h2 id="rewrite-modal-title" className="text-2xl font-bold text-gray-100">Rewrite Prompt</h2>
            <p className="text-sm text-gray-400 mt-1">Modify the prompt below to regenerate the image.</p>
        </div>
        <div className="p-6">
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            rows={6}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Prompt editor"
          ></textarea>
        </div>
        <div className="flex justify-end gap-4 p-6 bg-gray-800/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors duration-200 text-white font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRewriteClick}
            className="flex items-center gap-2 py-2 px-5 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 text-white font-semibold"
          >
            <RewriteIcon className="h-5 w-5"/>
            Rewrite & Generate
          </button>
        </div>
      </div>
    </div>
  );
};