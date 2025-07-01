import { EventEmitter } from './event-emitter';
import { PluginSystem } from './plugin-system';
export interface DevInspectorConfig {
    enabled?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
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
    plugins?: any[];
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
export interface InspectorEvents {
    'inspector:ready': void;
    'inspector:show': void;
    'inspector:hide': void;
    'inspector:minimize': void;
    'inspector:destroy': void;
    'network:request': any;
    'network:response': any;
    'network:error': any;
    'network:progress': any;
    'network:websocket:connection': any;
    'network:websocket:message': any;
    'network:websocket:status': any;
    'network:websocket:error': any;
    'network:evict': any;
    'console:log': any;
    'console:clear': void;
    'console:execute': string;
    'console:evict': any;
    'performance:metric': any;
    'performance:data': any;
    'performance:metrics': any;
    'performance:longtask': any;
    'performance:navigation': any;
    'performance:mark': any;
    'error:caught': any;
    'error:uncaught': any;
    'error:evict': any;
    'state:change': any;
    'dom:mutation': any;
    'storage:change': any;
    'plugin:registered': {
        name: string;
        version: string;
    };
    'plugin:unregistered': {
        name: string;
    };
    'plugin:enabled': {
        name: string;
    };
    'plugin:disabled': {
        name: string;
    };
}
export declare class DevInspector {
    private static instance;
    private config;
    private events;
    private pluginSystem;
    private networkStorage;
    private consoleStorage;
    private performanceStorage;
    private errorStorage;
    private isVisible;
    private isMinimized;
    private monitors;
    private ui;
    private initialized;
    private cleanupFunctions;
    constructor(config?: DevInspectorConfig);
    private mergeConfig;
    private init;
    private loadMonitors;
    private loadUI;
    private registerPlugins;
    private setupHotkeys;
    private setupErrorHandlers;
    private getKeyCombo;
    show(): void;
    hide(): void;
    minimize(): void;
    toggle(): void;
    destroy(): void;
    track(name: string, data: any): void;
    markStart(name: string): void;
    markEnd(name: string): void;
    use(plugin: any): void;
    export(): any;
    import(data: any): void;
    on<K extends keyof InspectorEvents>(event: K, listener: (data: InspectorEvents[K]) => void): () => void;
    off<K extends keyof InspectorEvents>(event: K, listener?: (data: InspectorEvents[K]) => void): void;
    getEvents(): EventEmitter<InspectorEvents>;
    getStorage(type: 'network' | 'console' | 'performance' | 'error'): any;
    getConfig(): Required<DevInspectorConfig>;
    getPluginSystem(): PluginSystem;
    getMonitor(name: string): any;
    static getInstance(): DevInspector | null;
}
