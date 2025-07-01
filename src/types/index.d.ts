declare module '@oxog/devinspector' {
  export interface DevInspectorConfig {
    enabled?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-sidebar' | 'fullwidth';
    theme?: 'dark' | 'light' | 'auto';
    hotkeys?: {
      toggle?: string;
      minimize?: string;
    };
    features?: {
      network?: boolean;
      console?: boolean;
      performance?: boolean;
      errors?: boolean;
      state?: boolean;
      dom?: boolean;
      storage?: boolean;
    };
    plugins?: Plugin[];
    maxNetworkEntries?: number;
    maxConsoleEntries?: number;
    captureStackTraces?: boolean;
    networkFilters?: {
      hideAssets?: boolean;
      hideCached?: boolean;
    };
    onError?: (error: Error) => void;
    onPerformanceIssue?: (issue: any) => void;
    workerUrl?: string;
    remoteConfig?: any;
  }

  export interface Plugin {
    name: string;
    version: string;
    description?: string;
    install(context: PluginContext): void | Promise<void>;
    uninstall?(): void | Promise<void>;
    enable?(): void;
    disable?(): void;
  }

  export interface PluginContext {
    inspector: DevInspector;
    storage: any;
    events: EventEmitter;
    config: any;
  }

  export class EventEmitter<T = any> {
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void;
    once<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void;
    emit<K extends keyof T>(event: K, data: T[K]): boolean;
    off<K extends keyof T>(event: K, listener?: (data: T[K]) => void): void;
    removeAllListeners(event?: keyof T): void;
  }

  export class DevInspector {
    constructor(config?: DevInspectorConfig);
    show(): void;
    hide(): void;
    minimize(): void;
    toggle(): void;
    destroy(): void;
    track(name: string, data: any): void;
    markStart(name: string): void;
    markEnd(name: string): void;
    use(plugin: Plugin): void;
    export(): any;
    import(data: any): void;
    on(event: string, listener: (...args: any[]) => void): () => void;
    off(event: string, listener?: (...args: any[]) => void): void;
    static getInstance(): DevInspector | null;
  }

  const DevInspector: typeof DevInspector;
  export default DevInspector;
}