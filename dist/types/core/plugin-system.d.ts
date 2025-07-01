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
export declare class PluginSystem {
    private plugins;
    private activePlugins;
    private context;
    private installingPlugins;
    constructor(context: PluginContext);
    register(plugin: Plugin): Promise<void>;
    unregister(pluginName: string): Promise<void>;
    enable(pluginName: string): void;
    disable(pluginName: string): void;
    get(pluginName: string): Plugin | undefined;
    has(pluginName: string): boolean;
    isActive(pluginName: string): boolean;
    getAll(): Plugin[];
    getActive(): Plugin[];
    getMetadata(pluginName: string): PluginMetadata | undefined;
    getAllMetadata(): PluginMetadata[];
}
export declare abstract class BasePlugin implements Plugin {
    abstract name: string;
    abstract version: string;
    description?: string;
    protected context?: PluginContext;
    install(context: PluginContext): Promise<void>;
    uninstall(): Promise<void>;
    enable(): void;
    disable(): void;
    protected abstract onInstall(): void | Promise<void>;
    protected onUninstall(): void | Promise<void>;
    protected onEnable(): void;
    protected onDisable(): void;
    protected get inspector(): any;
    protected get events(): EventEmitter;
    protected get storage(): any;
    protected get config(): any;
}
