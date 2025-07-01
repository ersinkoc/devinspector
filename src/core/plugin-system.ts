import { EventEmitter } from './event-emitter';

export interface PluginContext {
  inspector: any;
  storage: any;
  events: EventEmitter<any>;
  config: any;
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

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  dependencies?: Record<string, string>;
}

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private context: PluginContext;
  private installingPlugins: Set<string> = new Set();

  constructor(context: PluginContext) {
    this.context = context;
  }

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    if (this.installingPlugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is currently being installed`);
    }

    this.installingPlugins.add(plugin.name);

    try {
      await plugin.install(this.context);
      this.plugins.set(plugin.name, plugin);
      this.activePlugins.add(plugin.name);

      if (plugin.enable) {
        plugin.enable();
      }

      this.context.events.emit('plugin:registered', {
        name: plugin.name,
        version: plugin.version
      });
    } catch (error) {
      this.installingPlugins.delete(plugin.name);
      throw new Error(`Failed to install plugin "${plugin.name}": ${error}`);
    }

    this.installingPlugins.delete(plugin.name);
  }

  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    if (plugin.disable) {
      plugin.disable();
    }

    if (plugin.uninstall) {
      await plugin.uninstall();
    }

    this.plugins.delete(pluginName);
    this.activePlugins.delete(pluginName);

    this.context.events.emit('plugin:unregistered', {
      name: pluginName
    });
  }

  enable(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    if (this.activePlugins.has(pluginName)) {
      return;
    }

    if (plugin.enable) {
      plugin.enable();
    }

    this.activePlugins.add(pluginName);

    this.context.events.emit('plugin:enabled', {
      name: pluginName
    });
  }

  disable(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    if (!this.activePlugins.has(pluginName)) {
      return;
    }

    if (plugin.disable) {
      plugin.disable();
    }

    this.activePlugins.delete(pluginName);

    this.context.events.emit('plugin:disabled', {
      name: pluginName
    });
  }

  get(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  has(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  isActive(pluginName: string): boolean {
    return this.activePlugins.has(pluginName);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getActive(): Plugin[] {
    return Array.from(this.activePlugins).map(name => this.plugins.get(name)!);
  }

  getMetadata(pluginName: string): PluginMetadata | undefined {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return undefined;
    }

    return {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description
    };
  }

  getAllMetadata(): PluginMetadata[] {
    return this.getAll().map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description
    }));
  }
}

export abstract class BasePlugin implements Plugin {
  abstract name: string;
  abstract version: string;
  description?: string;
  protected context?: PluginContext;

  async install(context: PluginContext): Promise<void> {
    this.context = context;
    await this.onInstall();
  }

  async uninstall(): Promise<void> {
    await this.onUninstall();
    this.context = undefined;
  }

  enable(): void {
    this.onEnable();
  }

  disable(): void {
    this.onDisable();
  }

  protected abstract onInstall(): void | Promise<void>;
  protected onUninstall(): void | Promise<void> {}
  protected onEnable(): void {}
  protected onDisable(): void {}

  protected get inspector(): any {
    return this.context?.inspector;
  }

  protected get events(): EventEmitter {
    if (!this.context?.events) {
      throw new Error('Events not available - plugin not installed');
    }
    return this.context.events;
  }

  protected get storage(): any {
    return this.context?.storage;
  }

  protected get config(): any {
    return this.context?.config;
  }
}