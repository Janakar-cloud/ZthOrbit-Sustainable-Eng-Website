declare module "hls.js" {
  export interface HlsConfig {
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    [key: string]: unknown;
  }
  export interface HlsErrorData {
    fatal: boolean;
    type: string;
    details: string;
    [key: string]: unknown;
  }
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      ERROR: string;
      [key: string]: string;
    };
    constructor(config?: HlsConfig);
    loadSource(source: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (event: string, data: HlsErrorData) => void): void;
    destroy(): void;
  }
}
