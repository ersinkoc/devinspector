import { EventEmitter } from './event-emitter';
import { CircularStorage, IndexedStorage } from './storage';
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
  'plugin:registered': { name: string; version: string };
  'plugin:unregistered': { name: string };
  'plugin:enabled': { name: string };
  'plugin:disabled': { name: string };
}

export class DevInspector {
  private static instance: DevInspector | null = null;
  private config: Required<DevInspectorConfig>;
  private events: EventEmitter<InspectorEvents>;
  private pluginSystem: PluginSystem;
  private networkStorage: CircularStorage<any>;
  private consoleStorage: CircularStorage<any>;
  private performanceStorage: IndexedStorage<any>;
  private errorStorage: CircularStorage<any>;
  private isVisible: boolean = false;
  private isMinimized: boolean = false;
  private monitors: Map<string, any> = new Map();
  private ui: any = null;
  private initialized: boolean = false;
  private cleanupFunctions: (() => void)[] = [];

  constructor(config: DevInspectorConfig = {}) {
    if (DevInspector.instance) {
      console.warn('DevInspector instance already exists. Returning existing instance.');
      return DevInspector.instance;
    }

    this.config = this.mergeConfig(config);
    this.events = new EventEmitter<InspectorEvents>({ maxListeners: 100 });
    
    this.networkStorage = new CircularStorage({
      maxSize: this.config.maxNetworkEntries,
      onEvict: (entry) => this.events.emit('network:evict', entry)
    });

    this.consoleStorage = new CircularStorage({
      maxSize: this.config.maxConsoleEntries,
      onEvict: (entry) => this.events.emit('console:evict', entry)
    });

    this.performanceStorage = new IndexedStorage({
      maxSize: 1000,
      ttl: 60 * 60 * 1000 // 1 hour
    });

    this.errorStorage = new CircularStorage({
      maxSize: 100,
      onEvict: (entry) => this.events.emit('error:evict', entry)
    });

    this.pluginSystem = new PluginSystem({
      inspector: this,
      storage: {
        network: this.networkStorage,
        console: this.consoleStorage,
        performance: this.performanceStorage,
        error: this.errorStorage
      },
      events: this.events,
      config: this.config
    });

    if (this.config.enabled) {
      this.init();
    }

    DevInspector.instance = this;
  }

  private mergeConfig(config: DevInspectorConfig): Required<DevInspectorConfig> {
    const defaultConfig: Required<DevInspectorConfig> = {
      enabled: typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
      position: 'bottom-right',
      theme: 'auto',
      hotkeys: {
        toggle: 'ctrl+shift+d',
        minimize: 'ctrl+shift+m'
      },
      features: {
        network: true,
        console: true,
        performance: true,
        errors: true,
        state: true,
        dom: true,
        storage: true
      },
      plugins: [],
      maxNetworkEntries: 1000,
      maxConsoleEntries: 500,
      captureStackTraces: true,
      networkFilters: {
        hideAssets: false,
        hideCached: false
      },
      onError: () => {},
      onPerformanceIssue: () => {},
      workerUrl: undefined,
      remoteConfig: null
    };

    return {
      ...defaultConfig,
      ...config,
      hotkeys: { ...defaultConfig.hotkeys, ...config.hotkeys },
      features: { ...defaultConfig.features, ...config.features },
      networkFilters: { ...defaultConfig.networkFilters, ...config.networkFilters }
    };
  }

  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadMonitors();
      await this.loadUI();
      await this.registerPlugins();
      this.setupHotkeys();
      this.setupErrorHandlers();
      
      this.initialized = true;
      this.events.emit('inspector:ready');
    } catch (error) {
      console.error('Failed to initialize DevInspector:', error);
      this.config.onError(error as Error);
    }
  }

  private async loadMonitors(): Promise<void> {
    const features = this.config.features;
    
    if (features.network) {
      const { NetworkMonitor } = await import('../monitors/network/network-monitor');
      const monitor = new NetworkMonitor(this);
      this.monitors.set('network', monitor);
      monitor.start();
    }

    if (features.console) {
      const { ConsoleMonitor } = await import('../monitors/console/console-monitor');
      const monitor = new ConsoleMonitor(this);
      this.monitors.set('console', monitor);
      monitor.start();
    }

    if (features.performance) {
      const { PerformanceMonitor } = await import('../monitors/performance/performance-monitor');
      const monitor = new PerformanceMonitor(this);
      this.monitors.set('performance', monitor);
      monitor.start();
    }

    if (features.errors) {
      const { ErrorMonitor } = await import('../monitors/error/error-monitor');
      const monitor = new ErrorMonitor(this);
      this.monitors.set('error', monitor);
      monitor.start();
    }

    if (features.state) {
      const { StateMonitor } = await import('../monitors/state/state-monitor');
      const monitor = new StateMonitor(this);
      this.monitors.set('state', monitor);
      monitor.start();
    }

    if (features.dom) {
      const { DOMMonitor } = await import('../monitors/dom/dom-monitor');
      const monitor = new DOMMonitor(this);
      this.monitors.set('dom', monitor);
      monitor.start();
    }

    if (features.storage) {
      const { StorageMonitor } = await import('../monitors/storage/storage-monitor');
      const monitor = new StorageMonitor(this);
      this.monitors.set('storage', monitor);
      monitor.start();
    }
  }

  private async loadUI(): Promise<void> {
    const { DevInspectorUI } = await import('../ui/inspector-ui');
    this.ui = new DevInspectorUI(this);
    await this.ui.init();
  }

  private async registerPlugins(): Promise<void> {
    for (const plugin of this.config.plugins) {
      try {
        await this.pluginSystem.register(plugin);
      } catch (error) {
        console.error(`Failed to register plugin:`, error);
      }
    }
  }

  private setupHotkeys(): void {
    const handleKeydown = (event: KeyboardEvent) => {
      const { hotkeys } = this.config;
      const combo = this.getKeyCombo(event);

      if (combo === hotkeys.toggle) {
        event.preventDefault();
        this.toggle();
      } else if (combo === hotkeys.minimize) {
        event.preventDefault();
        this.minimize();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    this.cleanupFunctions.push(() => document.removeEventListener('keydown', handleKeydown));
  }

  private setupErrorHandlers(): void {
    if (!this.config.features.errors) return;

    const handleError = (event: ErrorEvent) => {
      this.events.emit('error:uncaught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: Date.now()
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      this.events.emit('error:uncaught', {
        message: 'Unhandled promise rejection',
        reason: event.reason,
        promise: event.promise,
        timestamp: Date.now()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    this.cleanupFunctions.push(() => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    });
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  show(): void {
    if (!this.initialized) {
      this.init().then(() => this.show());
      return;
    }

    this.isVisible = true;
    this.isMinimized = false;
    this.ui?.show();
    this.events.emit('inspector:show');
  }

  hide(): void {
    this.isVisible = false;
    this.ui?.hide();
    this.events.emit('inspector:hide');
  }

  minimize(): void {
    this.isMinimized = true;
    this.ui?.minimize();
    this.events.emit('inspector:minimize');
  }

  toggle(): void {
    if (this.isVisible && !this.isMinimized) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy(): void {
    this.monitors.forEach(monitor => monitor.stop?.());
    this.monitors.clear();

    this.ui?.destroy();
    this.ui = null;

    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];

    this.events.emit('inspector:destroy');
    this.events.removeAllListeners();

    DevInspector.instance = null;
  }

  track(name: string, data: any): void {
    this.events.emit('performance:metric', {
      name,
      data,
      timestamp: Date.now()
    });
  }

  markStart(name: string): void {
    performance.mark(`devinspector-${name}-start`);
  }

  markEnd(name: string): void {
    performance.mark(`devinspector-${name}-end`);
    try {
      performance.measure(
        `devinspector-${name}`,
        `devinspector-${name}-start`,
        `devinspector-${name}-end`
      );
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  use(plugin: any): void {
    this.pluginSystem.register(plugin);
  }

  export(): any {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      config: this.config,
      data: {
        network: this.networkStorage.getAll(),
        console: this.consoleStorage.getAll(),
        performance: this.performanceStorage.getAllValues(),
        errors: this.errorStorage.getAll()
      }
    };
  }

  import(data: any): void {
    // Implementation for importing data
    console.log('Import functionality not yet implemented', data);
  }

  on<K extends keyof InspectorEvents>(
    event: K,
    listener: (data: InspectorEvents[K]) => void
  ): () => void {
    return this.events.on(event, listener);
  }

  off<K extends keyof InspectorEvents>(
    event: K,
    listener?: (data: InspectorEvents[K]) => void
  ): void {
    this.events.off(event, listener);
  }

  getEvents(): EventEmitter<InspectorEvents> {
    return this.events;
  }

  getStorage(type: 'network' | 'console' | 'performance' | 'error'): any {
    switch (type) {
      case 'network': return this.networkStorage;
      case 'console': return this.consoleStorage;
      case 'performance': return this.performanceStorage;
      case 'error': return this.errorStorage;
    }
  }

  getConfig(): Required<DevInspectorConfig> {
    return this.config;
  }

  getPluginSystem(): PluginSystem {
    return this.pluginSystem;
  }

  getMonitor(name: string): any {
    return this.monitors.get(name);
  }

  static getInstance(): DevInspector | null {
    return DevInspector.instance;
  }
}