import { GoogleGenAI } from "@google/genai";
import type { GenerationJob } from '../types';

export async function generateImagesWithKeyRotation(
  job: GenerationJob,
  apiKeys: string[],
  startingKeyIndex: number
): Promise<{ images: string[], newKeyIndex: number }> {
  
  let currentKeyIndex = startingKeyIndex;

  while (currentKeyIndex < apiKeys.length) {
    const apiKey = apiKeys[currentKeyIndex];
    if (!apiKey) {
        currentKeyIndex++;
        continue;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: job.prompt,
          config: {
              numberOfImages: job.config.numberOfImages,
              outputMimeType: 'image/jpeg',
              aspectRatio: job.config.aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
          },
      });

      const base64Images = response.generatedImages.map(
        (img) => `data:image/jpeg;base64,${img.image.imageBytes}`
      );

      return { images: base64Images, newKeyIndex: currentKeyIndex };
    
    } catch (error) {
      console.warn(`API key at index ${currentKeyIndex} failed. Trying next key. Error:`, error);
      currentKeyIndex++;
    }
  }

  throw new Error("All API keys are exhausted or invalid.");
}
