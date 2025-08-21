export interface AspectRatioOption {
  label: string;
  value: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
}

export interface GeneratedImageGroup {
  prompt: string;
  images: (string | null)[];
  error?: string;
}

export interface GenerationJob {
    prompt: string;
    config: {
        numberOfImages: number;
        aspectRatio: string;
    }
}

export type AppView = 'build' | 'api' | 'history';

export interface RewriteTarget {
  groupIndex: number;
  imageIndex: number;
  prompt: string;
  source: 'current' | 'history';
}
