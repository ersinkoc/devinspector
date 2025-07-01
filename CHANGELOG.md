# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-07-01

### Added
- **Enhanced Examples**: Completely recreated all framework examples from scratch
- **Responsive Layouts**: Added fullwidth and bottom-sidebar positioning options
- **Layout Controls**: Interactive layout switching in all examples
- **Framework Demos**: Comprehensive React, Vue, Angular, and Vanilla JS demonstrations

### Enhanced
- **Simple Example**: Interactive demo with performance metrics and real-time updates
- **React Example**: Modern hooks, state management, and component lifecycle monitoring  
- **Vue Example**: Composition API, reactivity system, and Vue 3 integration
- **Angular Example**: Service architecture, dependency injection patterns
- **Vanilla JS Example**: Advanced ES6+ features, Canvas API demos, and performance testing

### UI/UX Improvements
- **6 Layout Options**: bottom-right, bottom-sidebar, fullwidth, top-left, top-right, bottom-left
- **Responsive Design**: CSS transitions and viewport-aware positioning
- **Interactive Controls**: Live layout switching with visual feedback
- **Framework-Specific Styling**: Tailored themes for each framework example

### Developer Experience
- **Production Build**: Optimized bundles with proper error handling
- **Code Quality**: All ESLint and TypeScript errors resolved
- **Performance**: Enhanced build system with source maps and minification

## [1.0.0] - 2025-07-01

### Added
- Initial release of DevInspector
- Zero-dependency developer debugging tool
- Framework-agnostic design
- TypeScript support with full type definitions

#### Core Features
- **Event System**: Type-safe event emitter with max listeners and error handling
- **Plugin Architecture**: Extensible plugin system with lifecycle management
- **Storage Management**: Circular and indexed storage with memory-efficient operations
- **Utility Functions**: Comprehensive utilities for debugging and development

#### Network Monitoring
- **Fetch Interceptor**: Complete interception of Fetch API calls
- **XHR Interceptor**: XMLHttpRequest monitoring with progress tracking
- **WebSocket Monitor**: Real-time WebSocket connection and message tracking
- **Beacon Support**: navigator.sendBeacon interception
- **Request Analysis**: Timing, size calculation, cache detection
- **Error Handling**: Network error capture and reporting

#### Console Enhancement
- **Method Interception**: All console methods (log, warn, error, info, debug, trace, table, group, etc.)
- **Stack Trace Capture**: Automatic stack trace generation for errors and warnings
- **Object Formatting**: Pretty printing with circular reference handling
- **Command Execution**: Interactive console with command history
- **Log Filtering**: Advanced filtering by level, content, and source
- **Export Support**: JSON and text export formats

#### Performance Monitoring
- **FPS Monitoring**: Real-time frame rate tracking with dropped frame detection
- **Memory Tracking**: JavaScript heap usage monitoring (Chrome only)
- **Web Vitals**: FCP, LCP, FID, CLS, TTFB, INP metrics collection
- **Long Task Detection**: Tasks >50ms with attribution information
- **Resource Timing**: Automatic resource performance analysis
- **Custom Metrics**: Manual performance marking and measuring

#### Error Tracking
- **Global Error Handling**: Uncaught exceptions and promise rejections
- **Error Grouping**: Intelligent error clustering by similarity
- **Stack Enhancement**: Source map support for production debugging
- **Ignore Patterns**: Configurable error filtering
- **Error Analytics**: Statistics and frequency analysis

#### User Interface
- **Floating Widget**: Draggable, dockable widget with error notifications
- **Main Panel**: Resizable, draggable inspector panel
- **Tabbed Interface**: Network, Console, Performance, and Errors tabs
- **Dark/Light Themes**: Automatic theme detection and manual override
- **Responsive Design**: Mobile-friendly interface
- **Keyboard Shortcuts**: Customizable hotkeys (Ctrl+Shift+D to toggle)

#### Build System
- **Multiple Formats**: ESM, CommonJS, and UMD builds
- **TypeScript Compilation**: Full type definitions included
- **Source Maps**: Available for all builds
- **Bundle Optimization**: Minified versions with size limits
- **Tree Shaking**: Dead code elimination support

#### Developer Experience
- **Zero Configuration**: Works out of the box
- **Production Detection**: Automatically disabled in production
- **Framework Integration**: Examples for React, Vue, Angular
- **CDN Support**: Available via jsDelivr and unpkg
- **Comprehensive Examples**: Multiple usage scenarios

### Technical Specifications
- **Bundle Size**: <16KB initial bundle (gzipped)
- **Performance**: <1ms overhead for network interception
- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+
- **Memory Management**: Automatic cleanup and circular buffers
- **Security**: XSS prevention, CSP compliance, input sanitization

### Documentation
- Complete API documentation
- Plugin development guide
- Framework integration examples
- Performance optimization tips
- Troubleshooting guide

### Testing
- Unit tests for core functionality
- Integration tests for interceptors
- End-to-end tests with Playwright
- Cross-browser testing
- Performance benchmarks

---

## Future Releases

### Planned Features
- State management integration (Redux, Vuex, MobX)
- DOM mutation monitoring
- Storage inspection (localStorage, IndexedDB, cookies)
- Session recording
- Heat map generation
- A/B test detection
- Custom chart rendering
- Remote configuration
- Team collaboration features
- AI-powered insights

---

For upgrade instructions and breaking changes, see the [Migration Guide](docs/MIGRATION.md).