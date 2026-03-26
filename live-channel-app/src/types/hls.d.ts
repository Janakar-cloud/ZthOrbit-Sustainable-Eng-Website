declare module "hls.js" {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      ERROR: string;
      [key: string]: string;
    };
    constructor(config?: any);
    loadSource(source: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (event: any, data: any) => void): void;
    destroy(): void;
  }
}
