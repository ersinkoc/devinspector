# DevInspector API Documentation

## Table of Contents
- [Installation](#installation)
- [Core API](#core-api)
- [Configuration](#configuration)
- [Events](#events)
- [Storage](#storage)
- [Plugins](#plugins)
- [Utilities](#utilities)

## Installation

### NPM
```bash
npm install @oxog/devinspector --save-dev
```

### CDN
```html
<script src="https://unpkg.com/@oxog/devinspector/dist/devinspector.umd.min.js"></script>
```

## Core API

### DevInspector Constructor

```typescript
new DevInspector(config?: DevInspectorConfig)
```

Creates a new DevInspector instance with optional configuration.

**Parameters:**
- `config` (optional): Configuration object

**Example:**
```javascript
import DevInspector from '@oxog/devinspector';

const inspector = new DevInspector({
  enabled: process.env.NODE_ENV !== 'production',
  theme: 'dark',
  features: {
    network: true,
    console: true,
    performance: true
  }
});
```

### Instance Methods

#### `show(): void`
Shows the inspector panel.

```javascript
inspector.show();
```

#### `hide(): void`
Hides the inspector panel.

```javascript
inspector.hide();
```

#### `toggle(): void`
Toggles the inspector panel visibility.

```javascript
inspector.toggle();
```

#### `minimize(): void`
Minimizes the inspector to floating widget mode.

```javascript
inspector.minimize();
```

#### `destroy(): void`
Destroys the inspector instance and cleans up all resources.

```javascript
inspector.destroy();
```

#### `track(name: string, data: any): void`
Tracks a custom metric or event.

```javascript
inspector.track('user-action', {
  action: 'button-click',
  element: 'signup-button',
  timestamp: Date.now()
});
```

#### `markStart(name: string): void`
Starts a performance measurement.

```javascript
inspector.markStart('api-call');
```

#### `markEnd(name: string): void`
Ends a performance measurement.

```javascript
inspector.markEnd('api-call');
```

#### `use(plugin: Plugin): void`
Registers a plugin with the inspector.

```javascript
import { MyPlugin } from './my-plugin';
inspector.use(new MyPlugin());
```

#### `export(): any`
Exports all collected data.

```javascript
const data = inspector.export();
console.log(data);
```

#### `import(data: any): void`
Imports previously exported data.

```javascript
inspector.import(previousData);
```

#### `on(event: string, listener: Function): () => void`
Adds an event listener. Returns an unsubscribe function.

```javascript
const unsubscribe = inspector.on('network:request', (request) => {
  console.log('Network request:', request);
});

// Later...
unsubscribe();
```

#### `off(event: string, listener?: Function): void`
Removes event listener(s).

```javascript
inspector.off('network:request', myListener);
// or remove all listeners for event
inspector.off('network:request');
```

### Static Methods

#### `DevInspector.getInstance(): DevInspector | null`
Returns the current inspector instance (singleton pattern).

```javascript
const inspector = DevInspector.getInstance();
if (inspector) {
  inspector.show();
}
```

## Configuration

### DevInspectorConfig Interface

```typescript
interface DevInspectorConfig {
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
```

### Configuration Options

#### `enabled: boolean`
- **Default:** `process.env.NODE_ENV !== 'production'`
- **Description:** Whether the inspector is enabled

#### `position: string`
- **Default:** `'bottom-right'`
- **Options:** `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`
- **Description:** Initial position of the inspector

#### `theme: string`
- **Default:** `'auto'`
- **Options:** `'dark'`, `'light'`, `'auto'`
- **Description:** UI theme

#### `hotkeys: object`
- **Default:** `{ toggle: 'ctrl+shift+d', minimize: 'ctrl+shift+m' }`
- **Description:** Keyboard shortcuts

#### `features: object`
- **Default:** All features enabled
- **Description:** Which monitoring features to enable

#### `maxNetworkEntries: number`
- **Default:** `1000`
- **Description:** Maximum number of network entries to store

#### `maxConsoleEntries: number`
- **Default:** `500`
- **Description:** Maximum number of console entries to store

#### `captureStackTraces: boolean`
- **Default:** `true`
- **Description:** Whether to capture stack traces for errors

#### `networkFilters: object`
- **Default:** `{ hideAssets: false, hideCached: false }`
- **Description:** Network request filtering options

#### `onError: Function`
- **Default:** `() => {}`
- **Description:** Error callback function

#### `onPerformanceIssue: Function`
- **Default:** `() => {}`
- **Description:** Performance issue callback

## Events

### Event Types

#### Network Events
- `network:request` - New network request
- `network:response` - Network response received
- `network:error` - Network error occurred
- `network:websocket:connection` - WebSocket connection
- `network:websocket:message` - WebSocket message
- `network:websocket:error` - WebSocket error

#### Console Events
- `console:log` - Console message logged
- `console:clear` - Console cleared

#### Performance Events
- `performance:data` - Performance data update
- `performance:metrics` - Core Web Vitals update
- `performance:longtask` - Long task detected
- `performance:mark` - Performance mark recorded

#### Error Events
- `error:caught` - Error caught by inspector
- `error:uncaught` - Uncaught error detected

#### Inspector Events
- `inspector:ready` - Inspector initialized
- `inspector:show` - Inspector shown
- `inspector:hide` - Inspector hidden
- `inspector:minimize` - Inspector minimized
- `inspector:destroy` - Inspector destroyed

### Event Listener Examples

```javascript
// Network monitoring
inspector.on('network:request', (request) => {
  if (request.url.includes('/api/')) {
    console.log('API request:', request.method, request.url);
  }
});

inspector.on('network:response', (response) => {
  if (response.duration > 1000) {
    console.warn('Slow response:', response.duration + 'ms');
  }
});

// Error tracking
inspector.on('error:uncaught', (error) => {
  // Send to external logging service
  logToService(error);
});

// Performance monitoring
inspector.on('performance:longtask', (task) => {
  if (task.duration > 100) {
    console.warn('Long task detected:', task.duration + 'ms');
  }
});
```

## Storage

### Storage Types

DevInspector uses different storage mechanisms for different data types:

- **Network Data**: Circular buffer (FIFO)
- **Console Data**: Circular buffer (FIFO)
- **Performance Data**: Indexed storage with TTL
- **Error Data**: Circular buffer (FIFO)

### Accessing Storage

```javascript
// Get storage instances
const networkStorage = inspector.getStorage('network');
const consoleStorage = inspector.getStorage('console');
const performanceStorage = inspector.getStorage('performance');
const errorStorage = inspector.getStorage('error');

// Get all entries
const networkEntries = networkStorage.getAll();
const consoleEntries = consoleStorage.getAll();

// Get specific entry
const entry = networkStorage.get('entry-id');

// Check storage size
const size = networkStorage.getSize();

// Clear storage
networkStorage.clear();
```

## Plugins

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  version: string;
  description?: string;
  install(context: PluginContext): void | Promise<void>;
  uninstall?(): void | Promise<void>;
  enable?(): void;
  disable?(): void;
}
```

### Plugin Context

```typescript
interface PluginContext {
  inspector: DevInspector;
  storage: {
    network: Storage;
    console: Storage;
    performance: Storage;
    error: Storage;
  };
  events: EventEmitter;
  config: DevInspectorConfig;
}
```

### Creating a Plugin

```typescript
import { BasePlugin } from '@oxog/devinspector';

export class MyPlugin extends BasePlugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My custom plugin';

  async onInstall() {
    // Plugin initialization
    this.events.on('network:request', this.handleRequest.bind(this));
  }

  onUninstall() {
    // Cleanup
  }

  onEnable() {
    // Enable functionality
  }

  onDisable() {
    // Disable functionality
  }

  private handleRequest(request: any) {
    // Handle network request
    console.log('Plugin handling request:', request);
  }
}

// Usage
inspector.use(new MyPlugin());
```

### Plugin Management

```javascript
// Get plugin system
const pluginSystem = inspector.getPluginSystem();

// List all plugins
const plugins = pluginSystem.getAll();

// Get active plugins
const activePlugins = pluginSystem.getActive();

// Enable/disable plugin
pluginSystem.enable('my-plugin');
pluginSystem.disable('my-plugin');

// Unregister plugin
pluginSystem.unregister('my-plugin');
```

## Utilities

### Available Utilities

```typescript
// Imported from '@oxog/devinspector'
import {
  debounce,
  throttle,
  deepClone,
  formatBytes,
  formatDuration,
  generateId,
  safeStringify,
  getStackTrace,
  parseStackFrame,
  memoize
} from '@oxog/devinspector';
```

### Utility Functions

#### `debounce<T>(func: T, wait: number, options?): T`
Debounces a function call.

```javascript
const debouncedFn = debounce(() => {
  console.log('Called after delay');
}, 300);
```

#### `throttle<T>(func: T, wait: number, options?): T`
Throttles a function call.

```javascript
const throttledFn = throttle(() => {
  console.log('Called at most once per interval');
}, 1000);
```

#### `formatBytes(bytes: number, precision?: number): string`
Formats bytes into human-readable string.

```javascript
formatBytes(1024); // "1 KB"
formatBytes(1048576); // "1 MB"
```

#### `formatDuration(ms: number): string`
Formats milliseconds into human-readable duration.

```javascript
formatDuration(1500); // "1.5s"
formatDuration(65000); // "1m 5s"
```

#### `safeStringify(obj: any, indent?: number): string`
Safely stringifies objects with circular references.

```javascript
const obj = { name: 'test' };
obj.self = obj; // circular reference

const str = safeStringify(obj, 2);
// Safe JSON string with [Circular] markers
```

---

For more examples and advanced usage, see the [examples](../examples/) directory.