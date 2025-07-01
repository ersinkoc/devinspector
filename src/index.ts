/**
 * DevInspector - Professional Developer Debugging Tool
 * @version 1.1.0
 * @description Zero-dependency framework-agnostic debugging tool with beautiful modern UI
 */

// Enhanced UI version (new default)
export { EnhancedDevInspector as DevInspector } from './enhanced-simple';
export { EnhancedDevInspector } from './enhanced-simple';

// Original version (legacy support)
export { DevInspector as OriginalDevInspector } from './core/inspector';
export type { DevInspectorConfig } from './core/inspector';
export { EventEmitter } from './core/event-emitter';
export type { Plugin, PluginContext } from './core/plugin-system';
export { BasePlugin } from './core/plugin-system';
export { CircularStorage, IndexedStorage } from './core/storage';

// Simple version
export { SimpleDevInspector } from './simple-inspector';

// Export types
export type { NetworkRequest, NetworkResponse, NetworkError } from './monitors/network/fetch-interceptor';
export type { ConsoleEntry, ConsoleLevel } from './monitors/console/console-interceptor';
export type { WebSocketConnection, WebSocketMessage } from './monitors/network/websocket-monitor';

// Default export for convenience (enhanced version)
import { EnhancedDevInspector } from './enhanced-simple';
export default EnhancedDevInspector;