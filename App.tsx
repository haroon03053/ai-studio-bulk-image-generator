import React, { useState, useCallback } from 'react';
import { ApiKeyManager } from './components/ApiKeyManager';
import { PromptInput } from './components/PromptInput';
import { GenerationControls } from './components/GenerationControls';
import { ImageGallery } from './components/ImageGallery';
import { ProgressBar } from './components/ProgressBar';
import { RewriteModal } from './components/RewriteModal';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { Sidebar } from './components/Sidebar';
import type { AspectRatioOption, GeneratedImageGroup, GenerationJob, AppView, RewriteTarget } from './types';
import { ASPECT_RATIOS } from './constants';
import { generateImagesWithKeyRotation } from './services/geminiService';

declare const JSZip: any;
declare const saveAs: any;

export default function App(): React.ReactNode {
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [promptInputText, setPromptInputText] = useState<string>('');
  const [imageCount, setImageCount] = useState<number>(2);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(ASPECT_RATIOS[0]);
  
  const [currentGeneration, setCurrentGeneration] = useState<GeneratedImageGroup[]>([]);
  const [history, setHistory] = useState<GeneratedImageGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [rewriteTarget, setRewriteTarget] = useState<RewriteTarget | null>(null);

  const [activeView, setActiveView] = useState<AppView>('build');

  const handleStartGeneration = useCallback(async () => {
    const prompts = promptInputText.split('\n').map(p => p.trim()).filter(Boolean);
    if (prompts.length === 0 || apiKeys.length === 0) {
      setError("Please add at least one prompt and one API key.");
      return;
    }

    if (currentGeneration.length > 0) {
      setHistory(prev => [...currentGeneration, ...prev]);
    }
    setCurrentGeneration([]);
    setIsLoading(true);
    setError(null);
    setProgress(0);

    const jobs: GenerationJob[] = prompts.map(prompt => ({
      prompt,
      config: {
        numberOfImages: imageCount,
        aspectRatio: aspectRatio.value,
      }
    }));

    let keyIndex = currentKeyIndex;
    let imagesGeneratedWithCurrentKey = 0;
    const IMAGES_PER_KEY_LIMIT = 15;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      if (apiKeys.length > 1 && imagesGeneratedWithCurrentKey + job.config.numberOfImages > IMAGES_PER_KEY_LIMIT) {
        keyIndex = (keyIndex + 1) % apiKeys.length;
        imagesGeneratedWithCurrentKey = 0;
      }

      try {
        const result = await generateImagesWithKeyRotation(job, apiKeys, keyIndex);
        
        const imageGroup: GeneratedImageGroup = {
          prompt: job.prompt,
          images: result.images,
        };
        // Fill with nulls if API returned fewer images than requested
        while (imageGroup.images.length < job.config.numberOfImages) {
          imageGroup.images.push(null);
        }
        setCurrentGeneration(prev => [...prev, imageGroup]);

        keyIndex = result.newKeyIndex;
        imagesGeneratedWithCurrentKey += result.images.length;
        setProgress(((i + 1) / jobs.length) * 100);
      } catch (err) {
        const errorMessage = (err as Error).message;
        console.error(`Error with prompt "${job.prompt}": ${errorMessage}`);
        const failedGroup: GeneratedImageGroup = {
            prompt: job.prompt,
            images: Array(job.config.numberOfImages).fill(null),
            error: `Failed: ${errorMessage}`,
        };
        setCurrentGeneration(prev => [...prev, failedGroup]);
        setProgress(((i + 1) / jobs.length) * 100);
      }
    }
    
    setCurrentKeyIndex(keyIndex);
    setIsLoading(false);
  }, [promptInputText, apiKeys, imageCount, aspectRatio, currentKeyIndex, currentGeneration]);
  
  const handleDownloadAll = useCallback(async () => {
    if (history.length === 0) return;

    const zip = new JSZip();
    
    history.forEach((group, groupIndex) => {
        const folderName = group.prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || `prompt_${groupIndex + 1}`;
        const folder = zip.folder(folderName);
        group.images.forEach((base64Image, imageIndex) => {
            if(base64Image) {
                const base64Data = base64Image.split(',')[1];
                folder?.file(`image_${imageIndex + 1}.jpeg`, base64Data, { base64: true });
            }
        });
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'generated-images.zip');
    } catch(e) {
        setError('Failed to create zip file.');
        console.error(e);
    }
  }, [history]);

  const handleDownloadCurrentGeneration = useCallback(async () => {
    if (currentGeneration.length === 0) return;

    const zip = new JSZip();
    
    currentGeneration.forEach((group, groupIndex) => {
        const folderName = group.prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || `prompt_${groupIndex + 1}`;
        const folder = zip.folder(folderName);
        group.images.forEach((base64Image, imageIndex) => {
            if(base64Image) {
                const base64Data = base64Image.split(',')[1];
                folder?.file(`image_${imageIndex + 1}.jpeg`, base64Data, { base64: true });
            }
        });
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'current-generation.zip');
    } catch(e) {
        setError('Failed to create zip file.');
        console.error(e);
    }
  }, [currentGeneration]);

  const handleOpenRewriteModal = (groupIndex: number, imageIndex: number, source: 'current' | 'history') => {
    const sourceArray = source === 'current' ? currentGeneration : history;
    const prompt = sourceArray[groupIndex]?.prompt;
    if (prompt) {
        setRewriteTarget({ groupIndex, imageIndex, prompt, source });
    }
  };

  const handleRewriteImage = async (newPrompt: string) => {
    if (!rewriteTarget) return;

    const { groupIndex, imageIndex, source } = rewriteTarget;
    const setStateFunction = source === 'current' ? setCurrentGeneration : setHistory;

    setRewriteTarget(null); // Close modal
    setIsLoading(true);
    setError(null);

    try {
      const job: GenerationJob = {
        prompt: newPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio.value
        }
      };

      const result = await generateImagesWithKeyRotation(job, apiKeys, currentKeyIndex);
      if (result.images.length > 0) {
        setStateFunction(prevData => {
          const newData = [...prevData];
          const targetGroup = { ...newData[groupIndex] };
          const targetImages = [...targetGroup.images];
          targetImages[imageIndex] = result.images[0];
          targetGroup.images = targetImages;

          if (targetGroup.error && !targetGroup.images.includes(null)) {
            delete targetGroup.error;
          }
          
          newData[groupIndex] = targetGroup;
          return newData;
        });
        setCurrentKeyIndex(result.newKeyIndex);
      } else {
        throw new Error("Rewrite generation returned no image.");
      }
    } catch (err) {
      setError(`Rewrite failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (history.length > 0 && window.confirm('Are you sure you want to clear the entire generation history? This action cannot be undone.')) {
        setHistory([]);
    }
  };

  const derivedPrompts = promptInputText.split('\n').map(p => p.trim()).filter(Boolean);
  const canStartGeneration = derivedPrompts.length > 0 && apiKeys.length > 0 && !isLoading;
  const hasHistory = history.length > 0;

  const renderContent = () => {
    switch(activeView) {
      case 'api':
        return (
          <div className="max-w-2xl mx-auto">
             <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-100">API Key Manager</h1>
              <p className="mt-2 text-gray-400">Add or remove your Google AI API keys here.</p>
            </header>
            <ApiKeyManager apiKeys={apiKeys} setApiKeys={setApiKeys} />
          </div>
        );

      case 'history':
        return (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <header>
                    <h1 className="text-3xl font-bold text-gray-100">Generation History</h1>
                    <p className="mt-1 text-gray-400">View, rewrite, and download all your past generated images.</p>
                </header>
                {hasHistory && (
                <div className="flex items-center gap-2">
                    <button 
                    onClick={handleDownloadAll}
                    className="flex items-center gap-2 py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white font-medium"
                    >
                    <DownloadIcon className="h-5 w-5" />
                    Download All (.zip)
                    </button>
                    <button 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 py-2 px-4 rounded-md bg-red-800 hover:bg-red-700 transition-colors duration-200 text-white font-medium"
                    >
                    <TrashIcon className="h-5 w-5" />
                    Clear
                    </button>
                </div>
                )}
            </div>
            
            <div className="flex-grow">
              <ImageGallery history={history} isLoading={false} onRewrite={(groupIndex, imageIndex) => handleOpenRewriteModal(groupIndex, imageIndex, 'history')} />
            </div>
          </div>
        );

      case 'build':
      default:
        return (
          <>
            <header className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                Bulk Imagen Generator
              </h1>
              <p className="mt-2 text-lg text-gray-400">Your powerful AI image creation assistant</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <PromptInput 
                  promptInputText={promptInputText}
                  setPromptInputText={setPromptInputText}
                />
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start space-x-3">
                    <InfoIcon className="h-5 w-5 mt-0.5 text-red-400"/>
                    <p className="flex-1">{error}</p>
                    </div>
                )}
              </div>
              <div className="space-y-8">
                <GenerationControls
                  imageCount={imageCount}
                  setImageCount={setImageCount}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                />
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <button
                    onClick={handleStartGeneration}
                    disabled={!canStartGeneration}
                    className="w-full text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none"
                  >
                    {isLoading ? 'Generating...' : `Generate ${derivedPrompts.length * imageCount} Images`}
                  </button>
                   {isLoading && <div className="mt-4"><ProgressBar progress={progress} /></div>}
                </div>
              </div>
            </div>

            {(isLoading || currentGeneration.length > 0) && (
              <div className="mt-12">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-gray-200">
                        {isLoading && currentGeneration.length === 0 ? 'Generating Images...' : 'Current Generation Results'}
                    </h2>
                    {currentGeneration.length > 0 && (
                      <button 
                        onClick={handleDownloadCurrentGeneration}
                        className="flex items-center gap-2 py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white font-medium"
                      >
                        <DownloadIcon className="h-5 w-5" />
                        Download All (.zip)
                      </button>
                    )}
                </div>
                <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                    <ImageGallery 
                        history={currentGeneration} 
                        isLoading={isLoading && currentGeneration.length === 0} 
                        onRewrite={(groupIndex, imageIndex) => handleOpenRewriteModal(groupIndex, imageIndex, 'current')}
                    />
                </div>
              </div>
            )}
          </>
        );
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      {rewriteTarget && (
        <RewriteModal
            isOpen={!!rewriteTarget}
            originalPrompt={rewriteTarget.prompt}
            onClose={() => setRewriteTarget(null)}
            onRewrite={handleRewriteImage}
        />
      )}
    </>
  );
}