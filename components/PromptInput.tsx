import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { InfoIcon } from './icons/InfoIcon';

interface PromptInputProps {
  promptInputText: string;
  setPromptInputText: (text: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ promptInputText, setPromptInputText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInputText(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPromptInputText(text ?? '');
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Prompts</h2>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 text-sm py-2 px-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200 text-indigo-300"
        >
          <UploadIcon className="h-4 w-4" />
          Upload .txt
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt"
          className="hidden"
        />
      </div>
      <textarea
        value={promptInputText}
        onChange={handleTextChange}
        placeholder="Enter your prompts, one per line..."
        rows={8}
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      ></textarea>
      <div className="flex items-start mt-2 text-xs text-gray-500 gap-2">
        <InfoIcon className="h-4 w-4 mt-px flex-shrink-0"/>
        <span>Each line will be treated as a separate prompt for generation.</span>
      </div>
    </div>
  );
};