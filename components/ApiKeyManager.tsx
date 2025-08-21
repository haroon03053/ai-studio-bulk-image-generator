import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ApiKeyManagerProps {
  apiKeys: string[];
  setApiKeys: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, setApiKeys }) => {
  const [newKeys, setNewKeys] = useState('');

  const handleAddKeys = () => {
    const keysToAdd = newKeys
      .split('\n')
      .map(k => k.trim())
      .filter(Boolean); // remove empty lines
    
    if (keysToAdd.length > 0) {
        const uniqueNewKeys = keysToAdd.filter(k => !apiKeys.includes(k));
        setApiKeys(prevKeys => [...prevKeys, ...uniqueNewKeys]);
        setNewKeys('');
    }
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setApiKeys(apiKeys.filter((key) => key !== keyToRemove));
  };

  const maskKey = (key: string) => {
    if (key.length < 8) return '...';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-200">API Key Manager</h2>
      <div className="flex flex-col gap-2 mb-4">
        <textarea
          value={newKeys}
          onChange={(e) => setNewKeys(e.target.value)}
          placeholder="Enter API keys, one per line..."
          rows={4}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddKeys}
          className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center font-semibold"
          aria-label="Add API Keys"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Keys
        </button>
      </div>
      <div className="space-y-2">
        {apiKeys.map((key, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-700 rounded-md p-2"
          >
            <span className="font-mono text-sm text-gray-300">
              Key {index + 1}: {maskKey(key)}
            </span>
            <button
              onClick={() => handleRemoveKey(key)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              aria-label={`Remove key ${index + 1}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        {apiKeys.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No API keys added yet.</p>
        )}
      </div>
    </div>
  );
};