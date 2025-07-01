# DevInspector 🔍

<p align="center">
  <img src="https://img.shields.io/npm/v/@oxog/devinspector.svg" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@oxog/devinspector.svg" alt="npm downloads" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
  <img src="https://img.shields.io/bundlephobia/minzip/@oxog/devinspector" alt="bundle size" />
</p>

A professional developer inspector tool for real-time debugging of web applications. Zero dependencies, framework-agnostic, and production-ready.

## ✨ Features

- 🌐 **Network Monitoring** - Intercept and analyze all network requests (fetch, XHR, WebSocket)
- 📝 **Console Enhancement** - Enhanced console with search, filtering, and export
- ⚡ **Performance Profiling** - FPS monitoring, memory tracking, and performance metrics
- 🐛 **Error Tracking** - Catch and analyze errors with source maps support
- 🔄 **State Management** - Integrate with Redux, Vuex, MobX, and other state managers
- 🎨 **DOM Analysis** - Inspect DOM mutations and element properties
- 💾 **Storage Inspector** - Monitor localStorage, cookies, and IndexedDB
- 🔌 **Plugin System** - Extend functionality with custom plugins

## 📦 Installation

### NPM
```bash
npm install @oxog/devinspector --save-dev
```

### Yarn
```bash
yarn add @oxog/devinspector -D
```

### CDN
```html
<script src="https://unpkg.com/@oxog/devinspector/dist/devinspector.umd.min.js"></script>
```

## 🚀 Quick Start

### ES Modules
```javascript
import DevInspector from '@oxog/devinspector';

const inspector = new DevInspector({
  enabled: process.env.NODE_ENV !== 'production'
});

// Show the inspector
inspector.show();
```

### CommonJS
```javascript
const DevInspector = require('@oxog/devinspector').default;

const inspector = new DevInspector();
```

### Script Tag
```html
<script src="https://unpkg.com/@oxog/devinspector"></script>
<script>
  const inspector = new DevInspector();
  inspector.show();
</script>
```

## ⚙️ Configuration

```javascript
const inspector = new DevInspector({
  // Enable/disable the inspector
  enabled: true,
  
  // Position on screen
  position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  
  // Theme
  theme: 'auto', // 'dark' | 'light' | 'auto'
  
  // Keyboard shortcuts
  hotkeys: {
    toggle: 'ctrl+shift+d',
    minimize: 'ctrl+shift+m'
  },
  
  // Features to enable
  features: {
    network: true,
    console: true,
    performance: true,
    errors: true,
    state: true,
    dom: true,
    storage: true
  },
  
  // Storage limits
  maxNetworkEntries: 1000,
  maxConsoleEntries: 500,
  
  // Stack traces
  captureStackTraces: true,
  
  // Network filters
  networkFilters: {
    hideAssets: false,
    hideCached: false
  },
  
  // Callbacks
  onError: (error) => console.error(error),
  onPerformanceIssue: (issue) => console.warn(issue)
});
```

## 🔧 API

### Core Methods

```javascript
// Show/hide inspector
inspector.show();
inspector.hide();
inspector.toggle();
inspector.minimize();

// Destroy inspector
inspector.destroy();

// Manual tracking
inspector.track('custom-metric', { value: 123 });
inspector.markStart('operation');
inspector.markEnd('operation');

// Export/import data
const data = inspector.export();
inspector.import(data);
```

### Events

```javascript
// Listen to events
inspector.on('network:request', (request) => {
  console.log('Network request:', request);
});

inspector.on('error:uncaught', (error) => {
  console.log('Uncaught error:', error);
});

// Remove listeners
const unsubscribe = inspector.on('console:log', handler);
unsubscribe(); // or inspector.off('console:log', handler);
```

## 🔌 Plugins

### Using Plugins

```javascript
import { MyPlugin } from './my-plugin';

inspector.use(new MyPlugin());
```

### Creating Plugins

```javascript
import { BasePlugin } from '@oxog/devinspector';

export class MyPlugin extends BasePlugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My custom plugin';
  
  async onInstall() {
    // Setup plugin
    this.events.on('network:request', this.handleRequest.bind(this));
  }
  
  onUninstall() {
    // Cleanup
  }
  
  handleRequest(request) {
    console.log('Plugin handling request:', request);
  }
}
```

## 🎯 Framework Integration

### React
```jsx
import { useEffect } from 'react';
import DevInspector from '@oxog/devinspector';

function App() {
  useEffect(() => {
    const inspector = new DevInspector();
    return () => inspector.destroy();
  }, []);
  
  return <div>Your App</div>;
}
```

### Vue
```javascript
import DevInspector from '@oxog/devinspector';

export default {
  mounted() {
    this.inspector = new DevInspector();
  },
  beforeDestroy() {
    this.inspector.destroy();
  }
}
```

### Angular
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import DevInspector from '@oxog/devinspector';

@Component({...})
export class AppComponent implements OnInit, OnDestroy {
  private inspector: DevInspector;
  
  ngOnInit() {
    this.inspector = new DevInspector();
  }
  
  ngOnDestroy() {
    this.inspector.destroy();
  }
}
```

## 🔒 Security

- All inputs are sanitized to prevent XSS
- Sensitive data can be filtered
- Content Security Policy compliant
- No eval() or Function() usage

## 🌐 Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers supported

## 📈 Performance

- < 1ms overhead for interceptors
- < 16KB initial bundle (gzipped)
- Lazy loading for UI components
- Automatic memory management

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Ersin Koc](https://github.com/ersinkoc)

## 🔗 Links

- [Documentation](https://github.com/ersinkoc/devinspector#readme)
- [NPM Package](https://www.npmjs.com/package/@oxog/devinspector)
- [GitHub Repository](https://github.com/ersinkoc/devinspector)
- [Report Issues](https://github.com/ersinkoc/devinspector/issues)