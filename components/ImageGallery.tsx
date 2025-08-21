import React from 'react';
import type { GeneratedImageGroup } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { RewriteIcon } from './icons/RewriteIcon';
import { ErrorIcon } from './icons/ErrorIcon';

interface ImageGalleryProps {
  history: GeneratedImageGroup[];
  isLoading: boolean;
  onRewrite: (groupIndex: number, imageIndex: number) => void;
}

const downloadImage = (base64Image: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const ImageCard: React.FC<{ 
    base64Image: string | null; 
    prompt: string; 
    index: number;
    onRewrite: () => void;
}> = ({ base64Image, prompt, index, onRewrite }) => {
    const filename = `${prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_${index + 1}.jpeg`;

    if (!base64Image) {
        return (
            <div className="group relative aspect-square overflow-hidden rounded-lg bg-gray-700/50 border-2 border-dashed border-red-500/50 shadow-md flex flex-col items-center justify-center text-center p-2">
                <ErrorIcon className="h-8 w-8 text-red-400 mb-2"/>
                <p className="text-xs font-semibold text-red-300 mb-2">Generation Failed</p>
                <button 
                    onClick={onRewrite}
                    className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 text-white"
                >
                    <RewriteIcon className="h-4 w-4"/>
                    Rewrite
                </button>
            </div>
        );
    }
    
    return (
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-gray-700 shadow-md">
            <img src={base64Image} alt={prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-2">
                 <button 
                    onClick={() => downloadImage(base64Image, filename)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30"
                    aria-label="Download Image"
                 >
                    <DownloadIcon className="h-6 w-6"/>
                 </button>
                 <button 
                    onClick={onRewrite}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30"
                    aria-label="Rewrite Image"
                 >
                    <RewriteIcon className="h-6 w-6"/>
                 </button>
            </div>
        </div>
    );
};


export const ImageGallery: React.FC<ImageGalleryProps> = ({ history, isLoading, onRewrite }) => {
  if (isLoading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">Generating images, please wait...</p>
      </div>
    );
  }

  if (!isLoading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-lg">Your generation history is empty.</p>
        <p className="text-sm">Go to the 'Build' tab to generate some images.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-y-auto h-full pr-2">
      {history.map((group, groupIndex) => (
        <div key={`${group.prompt}-${groupIndex}`}>
            <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 px-1 truncate" title={group.prompt}>
                    {group.prompt}
                </h3>
                {group.error && <p className="text-xs text-red-400 mb-4 px-1 truncate" title={group.error}>{group.error}</p>}
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {group.images.map((img, index) => (
              <ImageCard 
                key={index} 
                base64Image={img} 
                prompt={group.prompt} 
                index={index} 
                onRewrite={() => onRewrite(groupIndex, index)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};