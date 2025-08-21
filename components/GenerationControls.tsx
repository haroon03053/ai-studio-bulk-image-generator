import React from 'react';
import type { AspectRatioOption } from '../types';
import { ASPECT_RATIOS } from '../constants';

interface GenerationControlsProps {
  imageCount: number;
  setImageCount: (count: number) => void;
  aspectRatio: AspectRatioOption;
  setAspectRatio: (ratio: AspectRatioOption) => void;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  imageCount,
  setImageCount,
  aspectRatio,
  setAspectRatio,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-200">Generation Settings</h2>
      
      <div>
        <label htmlFor="imageCount" className="block text-sm font-medium text-gray-300 mb-2">
          Images per Prompt: <span className="font-bold text-indigo-400">{imageCount}</span>
        </label>
        <input
          id="imageCount"
          type="range"
          min="1"
          max="4"
          value={imageCount}
          onChange={(e) => setImageCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio)}
              className={`text-sm text-center py-2 px-2 rounded-md transition-colors duration-200 ${
                aspectRatio.value === ratio.value
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
