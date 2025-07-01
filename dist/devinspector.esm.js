/**
 * @oxog/devinspector v1.2.0
 * (c) 2025 Ersin Koc <ersinkoc@gmail.com>
 * Released under the MIT License
 */
/**
 * Enhanced DevInspector - Beautiful Modern UI (Simplified for Build)
 * @version 1.1.0
 */
class EnhancedDevInspector {
    constructor() {
        this.data = {
            network: [],
            console: [],
            performance: { fps: 0, memory: null },
            errors: []
        };
        this.isRecording = true;
        this.widget = null;
        this.panel = null;
        this.isVisible = false;
        this.isMinimized = false;
        this.activeTab = 'network';
        this.selectedRequest = null;
        this.init();
    }
    init() {
        this.createFloatingButton();
        this.createMainPanel();
        this.setupInterceptors();
        this.setupEventListeners();
    }
    createFloatingButton() {
        this.widget = document.createElement('div');
        this.widget.innerHTML = '🔍';
        this.widget.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      color: white;
      font-size: 24px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    `;
        this.widget.addEventListener('click', () => this.toggle());
        this.widget.addEventListener('mouseenter', () => {
            this.widget.style.transform = 'scale(1.1)';
        });
        this.widget.addEventListener('mouseleave', () => {
            this.widget.style.transform = 'scale(1)';
        });
        document.body.appendChild(this.widget);
    }
    createMainPanel() {
        this.panel = document.createElement('div');
        this.panel.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 480px;
      height: 650px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      display: none;
      flex-direction: column;
      z-index: 999998;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #e4e4e7;
      overflow: hidden;
    `;
        this.renderPanel();
        document.body.appendChild(this.panel);
    }
    renderPanel() {
        if (!this.panel)
            return;
        this.panel.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
        border-bottom: 1px solid #333;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 8px;
            height: 8px;
            background: ${this.isRecording ? '#ef4444' : '#6b7280'};
            border-radius: 50%;
          "></div>
          <span style="font-weight: 600; font-size: 14px;">DevInspector v1.1.0</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="minimize-btn" style="
            padding: 6px; background: none; border: none; color: #9ca3af; cursor: pointer;
            border-radius: 4px;
          ">−</button>
          <button class="close-btn" style="
            padding: 6px; background: none; border: none; color: #9ca3af; cursor: pointer;
            border-radius: 4px;
          ">×</button>
        </div>
      </div>

      ${!this.isMinimized ? `
        <div style="display: flex; background: #262626; border-bottom: 1px solid #333;">
          ${this.renderTabs()}
        </div>
        <div style="flex: 1; overflow: hidden;">
          ${this.renderTabContent()}
        </div>
      ` : ''}
    `;
        this.attachEventListeners();
    }
    renderTabs() {
        const tabs = [
            { id: 'network', label: 'Network', count: this.data.network.length },
            { id: 'console', label: 'Console', count: this.data.console.length },
            { id: 'performance', label: 'Performance' },
            { id: 'errors', label: 'Errors', count: this.data.errors.length }
        ];
        return tabs.map(tab => `
      <button data-tab="${tab.id}" style="
        padding: 12px 16px;
        background: ${this.activeTab === tab.id ? '#1a1a1a' : 'transparent'};
        border: none;
        color: ${this.activeTab === tab.id ? '#3b82f6' : '#9ca3af'};
        cursor: pointer;
        border-bottom: 2px solid ${this.activeTab === tab.id ? '#3b82f6' : 'transparent'};
      ">
        ${tab.label}
        ${tab.count !== undefined ? `<span style="
          background: #374151; color: white; padding: 2px 6px; border-radius: 10px; 
          font-size: 11px; margin-left: 6px;
        ">${tab.count}</span>` : ''}
      </button>
    `).join('');
    }
    renderTabContent() {
        switch (this.activeTab) {
            case 'network': return this.renderNetworkTab();
            case 'console': return this.renderConsoleTab();
            case 'performance': return this.renderPerformanceTab();
            case 'errors': return this.renderErrorsTab();
            default: return '';
        }
    }
    renderNetworkTab() {
        return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="padding: 12px; border-bottom: 1px solid #333; background: #1e1e1e;">
          <button class="clear-network" style="
            padding: 6px 12px; background: #374151; border: none; color: white;
            cursor: pointer; border-radius: 6px; margin-right: 8px;
          ">Clear</button>
          <button class="toggle-recording" style="
            padding: 6px 12px; border: none; color: white; cursor: pointer; border-radius: 6px;
            background: ${this.isRecording ? '#ef4444' : '#22c55e'};
          ">${this.isRecording ? 'Pause' : 'Resume'}</button>
          <span style="float: right; color: #6b7280; font-size: 12px; line-height: 32px;">
            ${this.data.network.length} requests
          </span>
        </div>
        <div style="flex: 1; overflow-y: auto;">
          ${this.data.network.length === 0 ? `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #6b7280;">
              No network activity
            </div>
          ` : this.data.network.map(req => this.renderNetworkRequest(req)).join('')}
        </div>
        ${this.selectedRequest ? this.renderRequestDetails() : ''}
      </div>
    `;
    }
    renderNetworkRequest(req) {
        var _a;
        const statusColor = this.getStatusColor(req.status);
        const methodColor = this.getMethodColor(req.method);
        return `
      <div class="network-request" data-id="${req.id}" style="
        padding: 12px 16px; border-bottom: 1px solid #2a2a2a; cursor: pointer;
        ${((_a = this.selectedRequest) === null || _a === void 0 ? void 0 : _a.id) === req.id ? 'background: #1e3a8a;' : ''}
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; gap: 8px;">
            <span style="
              background: ${methodColor}; color: white; padding: 2px 6px; border-radius: 4px;
              font-size: 11px; font-weight: 600;
            ">${req.method}</span>
            <span style="color: ${statusColor}; font-weight: 600;">${req.status}</span>
            <span style="color: #6b7280;">${req.duration || '-'}ms</span>
          </div>
          <span style="color: #6b7280; font-size: 11px;">
            ${req.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div style="color: #d1d5db; font-size: 12px; word-break: break-all;">
          ${req.url}
        </div>
      </div>
    `;
    }
    renderConsoleTab() {
        return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="padding: 12px; border-bottom: 1px solid #333; background: #1e1e1e;">
          <button class="clear-console" style="
            padding: 6px 12px; background: #374151; border: none; color: white;
            cursor: pointer; border-radius: 6px;
          ">Clear</button>
          <span style="float: right; color: #6b7280; font-size: 12px; line-height: 32px;">
            ${this.data.console.length} logs
          </span>
        </div>
        <div style="flex: 1; overflow-y: auto; font-family: monospace;">
          ${this.data.console.length === 0 ? `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #6b7280;">
              No console logs
            </div>
          ` : this.data.console.map(log => `
            <div style="padding: 8px 16px; border-bottom: 1px solid #2a2a2a; font-size: 12px;">
              <span style="color: ${this.getConsoleLevelColor(log.level)}; text-transform: uppercase; font-weight: 600;">
                [${log.level}]
              </span>
              <span style="color: #6b7280; margin: 0 8px;">${log.timestamp.toLocaleTimeString()}</span>
              <span style="color: ${this.getConsoleLevelColor(log.level)};">${log.message}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }
    renderPerformanceTab() {
        return `
      <div style="padding: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            border-radius: 12px; padding: 20px; text-align: center;
          ">
            <div style="font-size: 32px; font-weight: 700; color: #60a5fa;">${this.data.performance.fps}</div>
            <div style="font-size: 12px; color: #bfdbfe; margin-top: 4px;">FPS</div>
          </div>
          <div style="
            background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
            border-radius: 12px; padding: 20px; text-align: center;
          ">
            <div style="font-size: 32px; font-weight: 700; color: #4ade80;">
              ${this.data.performance.memory ? this.data.performance.memory.used + ' MB' : 'N/A'}
            </div>
            <div style="font-size: 12px; color: #bbf7d0; margin-top: 4px;">Memory</div>
          </div>
        </div>
        <div style="background: #262626; border-radius: 12px; padding: 20px;">
          <h4 style="margin: 0 0 16px 0;">Performance Metrics</h4>
          <div style="color: #9ca3af;">
            Performance monitoring active...
          </div>
        </div>
      </div>
    `;
    }
    renderErrorsTab() {
        return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="padding: 12px; border-bottom: 1px solid #333; background: #1e1e1e;">
          <button class="clear-errors" style="
            padding: 6px 12px; background: #374151; border: none; color: white;
            cursor: pointer; border-radius: 6px;
          ">Clear</button>
          <span style="float: right; color: #6b7280; font-size: 12px; line-height: 32px;">
            ${this.data.errors.length} errors
          </span>
        </div>
        <div style="flex: 1; overflow-y: auto;">
          ${this.data.errors.length === 0 ? `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #6b7280;">
              No errors recorded
            </div>
          ` : this.data.errors.map(error => `
            <div style="padding: 16px; border-bottom: 1px solid #2a2a2a;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #ef4444; font-weight: 600;">${error.type}</span>
                <span style="color: #6b7280; font-size: 11px;">${error.timestamp.toLocaleTimeString()}</span>
              </div>
              <div style="color: #fca5a5; margin-bottom: 8px;">${error.message}</div>
              ${error.stack ? `<pre style="
                background: #0f0f0f; padding: 8px; border-radius: 4px; font-size: 11px;
                color: #9ca3af; overflow-x: auto; white-space: pre-wrap;
              ">${error.stack}</pre>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }
    renderRequestDetails() {
        if (!this.selectedRequest)
            return '';
        return `
      <div style="border-top: 1px solid #333; height: 200px; overflow-y: auto; background: #1e1e1e;">
        <div style="padding: 12px; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
          <h4 style="margin: 0;">Request Details</h4>
          <button class="close-details" style="background: none; border: none; color: #6b7280; cursor: pointer;">×</button>
        </div>
        <div style="padding: 16px; font-size: 12px;">
          <div style="margin-bottom: 12px;">
            <strong>URL:</strong> ${this.selectedRequest.url}
          </div>
          <div style="margin-bottom: 12px;">
            <strong>Method:</strong> ${this.selectedRequest.method}
          </div>
          <div style="margin-bottom: 12px;">
            <strong>Status:</strong> ${this.selectedRequest.status}
          </div>
          <div>
            <strong>Duration:</strong> ${this.selectedRequest.duration || '-'}ms
          </div>
        </div>
      </div>
    `;
    }
    getStatusColor(status) {
        if (status === 'error' || status === 'pending')
            return '#6b7280';
        const statusNum = typeof status === 'string' ? parseInt(status) : status;
        if (statusNum >= 200 && statusNum < 300)
            return '#22c55e';
        if (statusNum >= 300 && statusNum < 400)
            return '#f59e0b';
        if (statusNum >= 400)
            return '#ef4444';
        return '#6b7280';
    }
    getMethodColor(method) {
        const colors = {
            GET: '#22c55e',
            POST: '#3b82f6',
            PUT: '#f59e0b',
            DELETE: '#ef4444',
            PATCH: '#8b5cf6'
        };
        return colors[method] || '#6b7280';
    }
    getConsoleLevelColor(level) {
        const colors = {
            log: '#d1d5db',
            info: '#60a5fa',
            warn: '#fbbf24',
            error: '#f87171',
            debug: '#a78bfa'
        };
        return colors[level] || '#d1d5db';
    }
    attachEventListeners() {
        var _a, _b, _c, _d, _e;
        if (!this.panel)
            return;
        // Header buttons
        const minimizeBtn = this.panel.querySelector('.minimize-btn');
        const closeBtn = this.panel.querySelector('.close-btn');
        minimizeBtn === null || minimizeBtn === void 0 ? void 0 : minimizeBtn.addEventListener('click', () => this.minimize());
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener('click', () => this.hide());
        // Tab buttons
        this.panel.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeTab = e.target.getAttribute('data-tab');
                this.renderPanel();
            });
        });
        // Action buttons
        (_a = this.panel.querySelector('.clear-network')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.clear('network'));
        (_b = this.panel.querySelector('.toggle-recording')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.toggleRecording());
        (_c = this.panel.querySelector('.clear-console')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.clear('console'));
        (_d = this.panel.querySelector('.clear-errors')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.clear('errors'));
        (_e = this.panel.querySelector('.close-details')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.selectedRequest = null;
            this.renderPanel();
        });
        // Network request selection
        this.panel.querySelectorAll('.network-request').forEach(req => {
            req.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.selectedRequest = this.data.network.find(r => r.id === id) || null;
                this.renderPanel();
            });
        });
    }
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    setupInterceptors() {
        this.interceptFetch();
        this.interceptXHR();
        this.interceptConsole();
        this.interceptErrors();
        this.setupPerformanceMonitoring();
    }
    interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            if (!this.isRecording)
                return originalFetch(input, init);
            const requestId = Math.random().toString(36).substr(2, 9);
            const startTime = performance.now();
            const url = typeof input === 'string' ? input : input.toString();
            const options = init || {};
            const request = {
                id: requestId,
                url: url,
                method: options.method || 'GET',
                status: 'pending',
                timestamp: new Date()
            };
            this.data.network.unshift(request);
            this.renderPanel();
            try {
                const response = await originalFetch(input, init);
                const endTime = performance.now();
                const index = this.data.network.findIndex(r => r.id === requestId);
                if (index !== -1) {
                    this.data.network[index] = {
                        ...request,
                        status: response.status,
                        duration: Math.round(endTime - startTime)
                    };
                    this.renderPanel();
                }
                return response;
            }
            catch (error) {
                const endTime = performance.now();
                const index = this.data.network.findIndex(r => r.id === requestId);
                if (index !== -1) {
                    this.data.network[index] = {
                        ...request,
                        status: 'error',
                        error: error.message,
                        duration: Math.round(endTime - startTime)
                    };
                    this.renderPanel();
                }
                throw error;
            }
        };
    }
    interceptXHR() {
        const originalXHR = window.XMLHttpRequest;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        window.XMLHttpRequest = function () {
            const xhr = new originalXHR();
            const requestId = Math.random().toString(36).substr(2, 9);
            let startTime;
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            xhr.open = function (method, url, ...args) {
                if (self.isRecording) {
                    const request = {
                        id: requestId,
                        url,
                        method,
                        status: 'pending',
                        timestamp: new Date()
                    };
                    self.data.network.unshift(request);
                    self.renderPanel();
                }
                return originalOpen.apply(this, [method, url, ...args]);
            };
            xhr.send = function (...args) {
                if (self.isRecording) {
                    startTime = performance.now();
                    xhr.addEventListener('loadend', () => {
                        const endTime = performance.now();
                        const index = self.data.network.findIndex(r => r.id === requestId);
                        if (index !== -1) {
                            self.data.network[index] = {
                                ...self.data.network[index],
                                status: xhr.status,
                                duration: Math.round(endTime - startTime)
                            };
                            self.renderPanel();
                        }
                    });
                }
                return originalSend.apply(this, args);
            };
            return xhr;
        };
    }
    interceptConsole() {
        const levels = ['log', 'warn', 'error', 'info', 'debug'];
        levels.forEach(level => {
            const original = console[level];
            console[level] = (...args) => {
                if (this.isRecording) {
                    const log = {
                        id: Math.random().toString(36).substr(2, 9),
                        level,
                        message: args.map(arg => {
                            if (typeof arg === 'object') {
                                try {
                                    return JSON.stringify(arg, null, 2);
                                }
                                catch (_a) {
                                    return String(arg);
                                }
                            }
                            return String(arg);
                        }).join(' '),
                        timestamp: new Date()
                    };
                    this.data.console.unshift(log);
                    if (this.data.console.length > 500) {
                        this.data.console = this.data.console.slice(0, 500);
                    }
                    this.renderPanel();
                }
                original.apply(console, args);
            };
        });
    }
    interceptErrors() {
        window.addEventListener('error', (event) => {
            var _a;
            if (!this.isRecording)
                return;
            const error = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'JavaScript Error',
                message: event.message,
                timestamp: new Date(),
                stack: (_a = event.error) === null || _a === void 0 ? void 0 : _a.stack
            };
            this.data.errors.unshift(error);
            this.renderPanel();
        });
        window.addEventListener('unhandledrejection', (event) => {
            var _a;
            if (!this.isRecording)
                return;
            const error = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'Promise Rejection',
                message: ((_a = event.reason) === null || _a === void 0 ? void 0 : _a.message) || String(event.reason),
                timestamp: new Date()
            };
            this.data.errors.unshift(error);
            this.renderPanel();
        });
    }
    setupPerformanceMonitoring() {
        let lastTime = performance.now();
        let frames = 0;
        const measurePerformance = () => {
            frames++;
            const currentTime = performance.now();
            if (currentTime >= lastTime + 1000) {
                this.data.performance.fps = Math.round(frames * 1000 / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                if (performance.memory) {
                    const memory = performance.memory;
                    this.data.performance.memory = {
                        used: Math.round(memory.usedJSHeapSize / 1048576),
                        total: Math.round(memory.totalJSHeapSize / 1048576),
                        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
                    };
                }
                if (this.isVisible && this.activeTab === 'performance') {
                    this.renderPanel();
                }
            }
            requestAnimationFrame(measurePerformance);
        };
        measurePerformance();
    }
    show() {
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.isVisible = true;
            if (this.widget)
                this.widget.style.display = 'none';
        }
    }
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
            this.isVisible = false;
            if (this.widget)
                this.widget.style.display = 'flex';
        }
    }
    toggle() {
        this.isVisible ? this.hide() : this.show();
    }
    minimize() {
        this.isMinimized = !this.isMinimized;
        if (this.panel) {
            this.panel.style.height = this.isMinimized ? '60px' : '650px';
            this.renderPanel();
        }
    }
    clear(type) {
        if (type === 'network') {
            this.data.network = [];
            this.selectedRequest = null;
        }
        else if (type === 'console') {
            this.data.console = [];
        }
        else if (type === 'errors') {
            this.data.errors = [];
        }
        this.renderPanel();
    }
    toggleRecording() {
        this.isRecording = !this.isRecording;
        this.renderPanel();
    }
    destroy() {
        if (this.widget && this.widget.parentNode) {
            this.widget.parentNode.removeChild(this.widget);
        }
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}
// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.EnhancedDevInspector = EnhancedDevInspector;
}

class EventEmitter {
    constructor(options = {}) {
        var _a, _b;
        this.events = new Map();
        this.maxListeners = (_a = options.maxListeners) !== null && _a !== void 0 ? _a : 10;
        this.captureRejections = (_b = options.captureRejections) !== null && _b !== void 0 ? _b : false;
    }
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        const listeners = this.events.get(event);
        if (listeners.size >= this.maxListeners) {
            console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.size} ${String(event)} listeners added.`);
        }
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.events.delete(event);
            }
        };
    }
    once(event, listener) {
        const wrappedListener = (data) => {
            unsubscribe();
            listener(data);
        };
        const unsubscribe = this.on(event, wrappedListener);
        return unsubscribe;
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners || listeners.size === 0) {
            return false;
        }
        const data = args[0];
        listeners.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                if (this.captureRejections) {
                    // Use type assertion for recursive error emit
                    this.emit('error', error);
                }
                else {
                    console.error(`Error in event listener for "${String(event)}":`, error);
                }
            }
        });
        return true;
    }
    off(event, listener) {
        if (!listener) {
            this.events.delete(event);
            return;
        }
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.events.delete(event);
            }
        }
    }
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
    }
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.size : 0;
    }
    eventNames() {
        return Array.from(this.events.keys());
    }
    setMaxListeners(n) {
        this.maxListeners = n;
    }
    getMaxListeners() {
        return this.maxListeners;
    }
}

class CircularStorage {
    constructor(options) {
        this.head = 0;
        this.tail = 0;
        this.size = 0;
        this.idCounter = 0;
        this.maxSize = options.maxSize;
        this.ttl = options.ttl;
        this.onEvict = options.onEvict;
        this.buffer = new Array(this.maxSize);
    }
    push(data) {
        const id = `${Date.now()}-${++this.idCounter}`;
        const entry = {
            id,
            timestamp: Date.now(),
            data
        };
        if (this.size === this.maxSize) {
            const evictedEntry = this.buffer[this.tail];
            if (evictedEntry && this.onEvict) {
                this.onEvict(evictedEntry);
            }
            this.tail = (this.tail + 1) % this.maxSize;
        }
        else {
            this.size++;
        }
        this.buffer[this.head] = entry;
        this.head = (this.head + 1) % this.maxSize;
        return id;
    }
    get(id) {
        const entry = this.findEntry(id);
        if (entry && !this.isExpired(entry)) {
            return entry.data;
        }
        return undefined;
    }
    getAll() {
        return this.getAllEntries().map(entry => entry.data);
    }
    getAllEntries() {
        const entries = [];
        const now = Date.now();
        for (let i = 0; i < this.size; i++) {
            const index = (this.tail + i) % this.maxSize;
            const entry = this.buffer[index];
            if (entry && !this.isExpired(entry, now)) {
                entries.push(entry);
            }
        }
        return entries;
    }
    find(predicate) {
        const entries = this.getAllEntries();
        for (const entry of entries) {
            if (predicate(entry.data)) {
                return entry.data;
            }
        }
        return undefined;
    }
    filter(predicate) {
        return this.getAllEntries()
            .filter(entry => predicate(entry.data))
            .map(entry => entry.data);
    }
    clear() {
        this.buffer = new Array(this.maxSize);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }
    getSize() {
        return this.size;
    }
    isFull() {
        return this.size === this.maxSize;
    }
    findEntry(id) {
        for (let i = 0; i < this.size; i++) {
            const index = (this.tail + i) % this.maxSize;
            const entry = this.buffer[index];
            if (entry && entry.id === id) {
                return entry;
            }
        }
        return undefined;
    }
    isExpired(entry, now = Date.now()) {
        if (!this.ttl)
            return false;
        return now - entry.timestamp > this.ttl;
    }
    removeExpired() {
        if (!this.ttl)
            return 0;
        const now = Date.now();
        let removedCount = 0;
        const validEntries = [];
        for (let i = 0; i < this.size; i++) {
            const index = (this.tail + i) % this.maxSize;
            const entry = this.buffer[index];
            if (entry && !this.isExpired(entry, now)) {
                validEntries.push(entry);
            }
            else if (entry && this.onEvict) {
                this.onEvict(entry);
                removedCount++;
            }
        }
        this.buffer = new Array(this.maxSize);
        this.size = validEntries.length;
        this.tail = 0;
        this.head = this.size;
        validEntries.forEach((entry, i) => {
            this.buffer[i] = entry;
        });
        return removedCount;
    }
}
class IndexedStorage {
    constructor(options) {
        this.storage = new Map();
        this.accessOrder = [];
        this.maxSize = options.maxSize;
        this.ttl = options.ttl;
        this.onEvict = options.onEvict;
    }
    set(key, data) {
        const entry = {
            id: key,
            timestamp: Date.now(),
            data
        };
        if (this.storage.has(key)) {
            this.accessOrder = this.accessOrder.filter(k => k !== key);
        }
        else if (this.storage.size >= this.maxSize) {
            const evictKey = this.accessOrder.shift();
            if (evictKey) {
                const evictedEntry = this.storage.get(evictKey);
                if (evictedEntry && this.onEvict) {
                    this.onEvict(evictedEntry);
                }
                this.storage.delete(evictKey);
            }
        }
        this.storage.set(key, entry);
        this.accessOrder.push(key);
    }
    get(key) {
        const entry = this.storage.get(key);
        if (entry && !this.isExpired(entry)) {
            this.updateAccessOrder(key);
            return entry.data;
        }
        else if (entry) {
            this.delete(key);
        }
        return undefined;
    }
    has(key) {
        const entry = this.storage.get(key);
        if (entry && !this.isExpired(entry)) {
            return true;
        }
        else if (entry) {
            this.delete(key);
        }
        return false;
    }
    delete(key) {
        const entry = this.storage.get(key);
        if (entry) {
            if (this.onEvict) {
                this.onEvict(entry);
            }
            this.storage.delete(key);
            this.accessOrder = this.accessOrder.filter(k => k !== key);
            return true;
        }
        return false;
    }
    clear() {
        if (this.onEvict) {
            this.storage.forEach(entry => this.onEvict(entry));
        }
        this.storage.clear();
        this.accessOrder = [];
    }
    getSize() {
        return this.storage.size;
    }
    getAllKeys() {
        return Array.from(this.storage.keys());
    }
    getAllValues() {
        return Array.from(this.storage.values())
            .filter(entry => !this.isExpired(entry))
            .map(entry => entry.data);
    }
    updateAccessOrder(key) {
        this.accessOrder = this.accessOrder.filter(k => k !== key);
        this.accessOrder.push(key);
    }
    isExpired(entry) {
        if (!this.ttl)
            return false;
        return Date.now() - entry.timestamp > this.ttl;
    }
    removeExpired() {
        let removedCount = 0;
        const expiredKeys = [];
        this.storage.forEach((entry, key) => {
            if (this.isExpired(entry)) {
                expiredKeys.push(key);
            }
        });
        expiredKeys.forEach(key => {
            if (this.delete(key)) {
                removedCount++;
            }
        });
        return removedCount;
    }
}

class PluginSystem {
    constructor(context) {
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.installingPlugins = new Set();
        this.context = context;
    }
    async register(plugin) {
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
        }
        catch (error) {
            this.installingPlugins.delete(plugin.name);
            throw new Error(`Failed to install plugin "${plugin.name}": ${error}`);
        }
        this.installingPlugins.delete(plugin.name);
    }
    async unregister(pluginName) {
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
    enable(pluginName) {
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
    disable(pluginName) {
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
    get(pluginName) {
        return this.plugins.get(pluginName);
    }
    has(pluginName) {
        return this.plugins.has(pluginName);
    }
    isActive(pluginName) {
        return this.activePlugins.has(pluginName);
    }
    getAll() {
        return Array.from(this.plugins.values());
    }
    getActive() {
        return Array.from(this.activePlugins).map(name => this.plugins.get(name));
    }
    getMetadata(pluginName) {
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
    getAllMetadata() {
        return this.getAll().map(plugin => ({
            name: plugin.name,
            version: plugin.version,
            description: plugin.description
        }));
    }
}
class BasePlugin {
    async install(context) {
        this.context = context;
        await this.onInstall();
    }
    async uninstall() {
        await this.onUninstall();
        this.context = undefined;
    }
    enable() {
        this.onEnable();
    }
    disable() {
        this.onDisable();
    }
    onUninstall() { }
    onEnable() { }
    onDisable() { }
    get inspector() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.inspector;
    }
    get events() {
        var _a;
        if (!((_a = this.context) === null || _a === void 0 ? void 0 : _a.events)) {
            throw new Error('Events not available - plugin not installed');
        }
        return this.context.events;
    }
    get storage() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.storage;
    }
    get config() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.config;
    }
}

class DevInspector {
    constructor(config = {}) {
        this.isVisible = false;
        this.isMinimized = false;
        this.monitors = new Map();
        this.ui = null;
        this.initialized = false;
        this.cleanupFunctions = [];
        if (DevInspector.instance) {
            console.warn('DevInspector instance already exists. Returning existing instance.');
            return DevInspector.instance;
        }
        this.config = this.mergeConfig(config);
        this.events = new EventEmitter({ maxListeners: 100 });
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
    mergeConfig(config) {
        var _a;
        const defaultConfig = {
            enabled: typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) !== 'production',
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
            onError: () => { },
            onPerformanceIssue: () => { },
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
    async init() {
        if (this.initialized)
            return;
        try {
            await this.loadMonitors();
            await this.loadUI();
            await this.registerPlugins();
            this.setupHotkeys();
            this.setupErrorHandlers();
            this.initialized = true;
            this.events.emit('inspector:ready');
        }
        catch (error) {
            console.error('Failed to initialize DevInspector:', error);
            this.config.onError(error);
        }
    }
    async loadMonitors() {
        const features = this.config.features;
        if (features.network) {
            const { NetworkMonitor } = await Promise.resolve().then(function () { return networkMonitor; });
            const monitor = new NetworkMonitor(this);
            this.monitors.set('network', monitor);
            monitor.start();
        }
        if (features.console) {
            const { ConsoleMonitor } = await Promise.resolve().then(function () { return consoleMonitor; });
            const monitor = new ConsoleMonitor(this);
            this.monitors.set('console', monitor);
            monitor.start();
        }
        if (features.performance) {
            const { PerformanceMonitor } = await Promise.resolve().then(function () { return performanceMonitor; });
            const monitor = new PerformanceMonitor(this);
            this.monitors.set('performance', monitor);
            monitor.start();
        }
        if (features.errors) {
            const { ErrorMonitor } = await Promise.resolve().then(function () { return errorMonitor; });
            const monitor = new ErrorMonitor(this);
            this.monitors.set('error', monitor);
            monitor.start();
        }
        if (features.state) {
            const { StateMonitor } = await Promise.resolve().then(function () { return stateMonitor; });
            const monitor = new StateMonitor(this);
            this.monitors.set('state', monitor);
            monitor.start();
        }
        if (features.dom) {
            const { DOMMonitor } = await Promise.resolve().then(function () { return domMonitor; });
            const monitor = new DOMMonitor(this);
            this.monitors.set('dom', monitor);
            monitor.start();
        }
        if (features.storage) {
            const { StorageMonitor } = await Promise.resolve().then(function () { return storageMonitor; });
            const monitor = new StorageMonitor(this);
            this.monitors.set('storage', monitor);
            monitor.start();
        }
    }
    async loadUI() {
        const { DevInspectorUI } = await Promise.resolve().then(function () { return inspectorUi; });
        this.ui = new DevInspectorUI(this);
        await this.ui.init();
    }
    async registerPlugins() {
        for (const plugin of this.config.plugins) {
            try {
                await this.pluginSystem.register(plugin);
            }
            catch (error) {
                console.error(`Failed to register plugin:`, error);
            }
        }
    }
    setupHotkeys() {
        const handleKeydown = (event) => {
            const { hotkeys } = this.config;
            const combo = this.getKeyCombo(event);
            if (combo === hotkeys.toggle) {
                event.preventDefault();
                this.toggle();
            }
            else if (combo === hotkeys.minimize) {
                event.preventDefault();
                this.minimize();
            }
        };
        document.addEventListener('keydown', handleKeydown);
        this.cleanupFunctions.push(() => document.removeEventListener('keydown', handleKeydown));
    }
    setupErrorHandlers() {
        if (!this.config.features.errors)
            return;
        const handleError = (event) => {
            this.events.emit('error:uncaught', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: Date.now()
            });
        };
        const handleRejection = (event) => {
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
    getKeyCombo(event) {
        const parts = [];
        if (event.ctrlKey)
            parts.push('ctrl');
        if (event.altKey)
            parts.push('alt');
        if (event.shiftKey)
            parts.push('shift');
        if (event.metaKey)
            parts.push('meta');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }
    show() {
        var _a;
        if (!this.initialized) {
            this.init().then(() => this.show());
            return;
        }
        this.isVisible = true;
        this.isMinimized = false;
        (_a = this.ui) === null || _a === void 0 ? void 0 : _a.show();
        this.events.emit('inspector:show');
    }
    hide() {
        var _a;
        this.isVisible = false;
        (_a = this.ui) === null || _a === void 0 ? void 0 : _a.hide();
        this.events.emit('inspector:hide');
    }
    minimize() {
        var _a;
        this.isMinimized = true;
        (_a = this.ui) === null || _a === void 0 ? void 0 : _a.minimize();
        this.events.emit('inspector:minimize');
    }
    toggle() {
        if (this.isVisible && !this.isMinimized) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    destroy() {
        var _a;
        this.monitors.forEach(monitor => { var _a; return (_a = monitor.stop) === null || _a === void 0 ? void 0 : _a.call(monitor); });
        this.monitors.clear();
        (_a = this.ui) === null || _a === void 0 ? void 0 : _a.destroy();
        this.ui = null;
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
        this.events.emit('inspector:destroy');
        this.events.removeAllListeners();
        DevInspector.instance = null;
    }
    track(name, data) {
        this.events.emit('performance:metric', {
            name,
            data,
            timestamp: Date.now()
        });
    }
    markStart(name) {
        performance.mark(`devinspector-${name}-start`);
    }
    markEnd(name) {
        performance.mark(`devinspector-${name}-end`);
        try {
            performance.measure(`devinspector-${name}`, `devinspector-${name}-start`, `devinspector-${name}-end`);
        }
        catch (error) {
            console.warn(`Failed to measure ${name}:`, error);
        }
    }
    use(plugin) {
        this.pluginSystem.register(plugin);
    }
    export() {
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
    import(data) {
        // Implementation for importing data
        console.log('Import functionality not yet implemented', data);
    }
    on(event, listener) {
        return this.events.on(event, listener);
    }
    off(event, listener) {
        this.events.off(event, listener);
    }
    getEvents() {
        return this.events;
    }
    getStorage(type) {
        switch (type) {
            case 'network': return this.networkStorage;
            case 'console': return this.consoleStorage;
            case 'performance': return this.performanceStorage;
            case 'error': return this.errorStorage;
        }
    }
    getConfig() {
        return this.config;
    }
    getPluginSystem() {
        return this.pluginSystem;
    }
    getMonitor(name) {
        return this.monitors.get(name);
    }
    static getInstance() {
        return DevInspector.instance;
    }
}
DevInspector.instance = null;

class SimpleDevInspector {
    constructor(config = {}) {
        this.widget = null;
        this.panel = null;
        this.isVisible = false;
        this.config = {
            enabled: true,
            position: 'bottom-right',
            theme: 'dark',
            ...config
        };
        if (this.config.enabled) {
            this.init();
        }
    }
    init() {
        this.createWidget();
        this.createPanel();
        this.setupEventListeners();
    }
    createWidget() {
        this.widget = document.createElement('div');
        this.widget.style.cssText = `
      position: fixed;
      ${this.config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
      ${this.config.position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
      ${this.config.position === 'top-right' ? 'top: 20px; right: 20px;' : ''}
      ${this.config.position === 'top-left' ? 'top: 20px; left: 20px;' : ''}
      width: 60px;
      height: 60px;
      background: #007acc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: transform 0.3s ease;
      color: white;
    `;
        this.widget.innerHTML = '🔍';
        this.widget.title = 'DevInspector - Click to toggle';
        document.body.appendChild(this.widget);
    }
    createPanel() {
        var _a, _b;
        this.panel = document.createElement('div');
        const bgColor = this.config.theme === 'dark' ? '#1e1e1e' : '#ffffff';
        const textColor = this.config.theme === 'dark' ? '#cccccc' : '#333333';
        const borderColor = this.config.theme === 'dark' ? '#3e3e42' : '#ddd';
        this.panel.style.cssText = `
      position: fixed;
      ${((_a = this.config.position) === null || _a === void 0 ? void 0 : _a.includes('bottom')) ? 'bottom: 100px;' : 'top: 100px;'}
      ${((_b = this.config.position) === null || _b === void 0 ? void 0 : _b.includes('right')) ? 'right: 20px;' : 'left: 20px;'}
      width: 500px;
      height: 400px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 8px;
      color: ${textColor};
      font-family: Monaco, monospace;
      font-size: 12px;
      display: none;
      flex-direction: column;
      z-index: 999998;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
        this.panel.innerHTML = `
      <div style="padding: 10px; background: ${this.config.theme === 'dark' ? '#2d2d30' : '#f5f5f5'}; border-bottom: 1px solid ${borderColor}; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">DevInspector v1.0.0</span>
        <button onclick="this.closest('.devinspector-panel').style.display='none'" style="background: #f44336; border: none; color: white; width: 20px; height: 20px; border-radius: 3px; cursor: pointer;">×</button>
      </div>
      <div style="display: flex; background: ${this.config.theme === 'dark' ? '#2d2d30' : '#f5f5f5'}; border-bottom: 1px solid ${borderColor};">
        <button style="padding: 8px 16px; background: #007acc; border: none; color: white; cursor: pointer;">Network</button>
        <button style="padding: 8px 16px; background: none; border: none; color: ${textColor}; cursor: pointer;">Console</button>
        <button style="padding: 8px 16px; background: none; border: none; color: ${textColor}; cursor: pointer;">Performance</button>
        <button style="padding: 8px 16px; background: none; border: none; color: ${textColor}; cursor: pointer;">Errors</button>
      </div>
      <div style="flex: 1; padding: 15px; overflow: auto;">
        <div style="text-align: center; margin-top: 50px; color: #666;">
          <h3 style="color: #007acc; margin-bottom: 20px;">🎉 DevInspector v1.0.0 - Production Ready!</h3>
          <p>Welcome to the professional developer debugging tool!</p>
          <br>
          <div style="text-align: left; max-width: 400px; margin: 0 auto;">
            <h4 style="color: #007acc;">✅ Features Implemented:</h4>
            <ul style="list-style: none; padding: 0;">
              <li>🌐 Network monitoring (fetch, XHR, WebSocket)</li>
              <li>📝 Console enhancement with filtering</li>
              <li>⚡ Performance monitoring (FPS, memory, metrics)</li>
              <li>🐛 Error tracking with grouping</li>
              <li>🎨 Professional UI with themes</li>
              <li>🔌 Plugin architecture</li>
              <li>📦 Zero dependencies</li>
              <li>🚀 Production ready builds</li>
            </ul>
            <br>
            <p style="font-size: 11px; opacity: 0.8;">
              This is the production-ready DevInspector tool!<br>
              Framework-agnostic • TypeScript • Zero dependencies
            </p>
          </div>
        </div>
      </div>
    `;
        this.panel.className = 'devinspector-panel';
        document.body.appendChild(this.panel);
    }
    setupEventListeners() {
        if (this.widget) {
            this.widget.addEventListener('click', () => this.toggle());
        }
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    show() {
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.isVisible = true;
        }
    }
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
            this.isVisible = false;
        }
    }
    toggle() {
        this.isVisible ? this.hide() : this.show();
    }
    destroy() {
        if (this.widget && this.widget.parentNode) {
            this.widget.parentNode.removeChild(this.widget);
        }
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
    // Tracking methods for demonstration
    track(name, data) {
        console.log(`[DevInspector] Tracking: ${name}`, data);
    }
    markStart(name) {
        performance.mark(`devinspector-${name}-start`);
    }
    markEnd(name) {
        performance.mark(`devinspector-${name}-end`);
        try {
            performance.measure(`devinspector-${name}`, `devinspector-${name}-start`, `devinspector-${name}-end`);
        }
        catch (error) {
            console.warn(`Failed to measure ${name}:`, error);
        }
    }
}

/**
 * DevInspector - Professional Developer Debugging Tool
 * @version 1.1.0
 * @description Zero-dependency framework-agnostic debugging tool with beautiful modern UI
 */
// Enhanced UI version (new default)

function throttle(func, wait, options = {}) {
    let timeout = null;
    let lastCallTime = 0;
    let lastThis;
    let lastArgs = null;
    let result;
    const { leading = true, trailing = true } = options;
    const invokeFunc = () => {
        const args = lastArgs;
        const thisArg = lastThis;
        lastArgs = lastThis = null;
        result = func.apply(thisArg, args);
        return result;
    };
    return function throttled(...args) {
        const now = Date.now();
        const remaining = wait - (now - lastCallTime);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        lastThis = this;
        lastArgs = args;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            if (leading) {
                result = invokeFunc();
            }
        }
        else if (!timeout && trailing) {
            timeout = setTimeout(() => {
                lastCallTime = Date.now();
                timeout = null;
                if (trailing && lastArgs) {
                    invokeFunc();
                }
            }, remaining);
        }
        return result;
    };
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function safeStringify(obj, indent) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack
            };
        }
        return value;
    }, indent);
}
function getStackTrace(error) {
    const stack = (new Error()).stack || '';
    return stack
        .split('\n')
        .slice(1)
        .map(line => line.trim())
        .filter(line => line.startsWith('at '));
}
function parseStackFrame(frame) {
    const match = frame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
    if (!match) {
        return null;
    }
    const [, functionName, fileName, lineNumber, columnNumber] = match;
    return {
        functionName: functionName || '<anonymous>',
        fileName: fileName || '<unknown>',
        lineNumber: parseInt(lineNumber || '0', 10),
        columnNumber: parseInt(columnNumber || '0', 10)
    };
}

class FetchInterceptor {
    constructor(handlers = {}) {
        this.requestMap = new Map();
        this.originalFetch = window.fetch;
        this.handlers = handlers;
    }
    install() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        window.fetch = async function (input, init) {
            var _a, _b, _c, _d, _e, _f;
            const id = generateId();
            const startTime = performance.now();
            let url;
            let method;
            let headers = {};
            let body;
            if (input instanceof Request) {
                url = input.url;
                method = input.method;
                input.headers.forEach((value, key) => {
                    headers[key] = value;
                });
                body = await self.extractBody(input);
            }
            else {
                url = input.toString();
                method = (init === null || init === void 0 ? void 0 : init.method) || 'GET';
                if (init === null || init === void 0 ? void 0 : init.headers) {
                    if (init.headers instanceof Headers) {
                        init.headers.forEach((value, key) => {
                            headers[key] = value;
                        });
                    }
                    else if (Array.isArray(init.headers)) {
                        init.headers.forEach(([key, value]) => {
                            headers[key] = value;
                        });
                    }
                    else {
                        headers = init.headers;
                    }
                }
                body = init === null || init === void 0 ? void 0 : init.body;
            }
            const request = {
                id,
                method,
                url,
                headers,
                body: self.sanitizeBody(body),
                timestamp: Date.now(),
                type: 'fetch'
            };
            self.requestMap.set(id, request);
            (_b = (_a = self.handlers).onRequest) === null || _b === void 0 ? void 0 : _b.call(_a, request);
            try {
                const response = await self.originalFetch.apply(window, [input, init]);
                const duration = performance.now() - startTime;
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                const clonedResponse = response.clone();
                const responseBody = await self.extractResponseBody(clonedResponse);
                const size = self.calculateSize(responseBody, responseHeaders);
                const networkResponse = {
                    id,
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    body: responseBody,
                    size,
                    duration,
                    timestamp: Date.now(),
                    fromCache: self.isFromCache(response, duration)
                };
                (_d = (_c = self.handlers).onResponse) === null || _d === void 0 ? void 0 : _d.call(_c, networkResponse);
                self.requestMap.delete(id);
                return response;
            }
            catch (error) {
                const networkError = {
                    id,
                    message: error.message || 'Network request failed',
                    stack: error.stack,
                    timestamp: Date.now()
                };
                (_f = (_e = self.handlers).onError) === null || _f === void 0 ? void 0 : _f.call(_e, networkError);
                self.requestMap.delete(id);
                throw error;
            }
        };
    }
    uninstall() {
        window.fetch = this.originalFetch;
        this.requestMap.clear();
    }
    async extractBody(request) {
        try {
            const contentType = request.headers.get('content-type') || '';
            if (request.bodyUsed) {
                return '[Body already read]';
            }
            const cloned = request.clone();
            if (contentType.includes('application/json')) {
                return await cloned.json();
            }
            else if (contentType.includes('text/')) {
                return await cloned.text();
            }
            else if (contentType.includes('application/x-www-form-urlencoded')) {
                return await cloned.text();
            }
            else if (contentType.includes('multipart/form-data')) {
                return '[FormData]';
            }
            return '[Binary data]';
        }
        catch (error) {
            return '[Unable to read body]';
        }
    }
    async extractResponseBody(response) {
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            else if (contentType.includes('text/')) {
                return await response.text();
            }
            else if (contentType.includes('image/')) {
                return '[Image data]';
            }
            else if (contentType.includes('video/')) {
                return '[Video data]';
            }
            else if (contentType.includes('audio/')) {
                return '[Audio data]';
            }
            const blob = await response.blob();
            return `[Binary data: ${blob.size} bytes]`;
        }
        catch (error) {
            return '[Unable to read response]';
        }
    }
    sanitizeBody(body) {
        if (!body)
            return undefined;
        if (typeof body === 'string') {
            return body.length > 10000 ? body.substring(0, 10000) + '...' : body;
        }
        if (body instanceof FormData) {
            const entries = {};
            body.forEach((value, key) => {
                if (value instanceof File) {
                    entries[key] = `[File: ${value.name}, ${value.size} bytes]`;
                }
                else {
                    entries[key] = value;
                }
            });
            return { type: 'FormData', entries };
        }
        if (body instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${body.byteLength} bytes]`;
        }
        if (body instanceof Blob) {
            return `[Blob: ${body.size} bytes, type: ${body.type}]`;
        }
        if (body instanceof URLSearchParams) {
            return body.toString();
        }
        return body;
    }
    calculateSize(body, headers) {
        const contentLength = headers['content-length'];
        if (contentLength) {
            return parseInt(contentLength, 10);
        }
        if (typeof body === 'string') {
            return new Blob([body]).size;
        }
        if (body && typeof body === 'object') {
            try {
                return new Blob([JSON.stringify(body)]).size;
            }
            catch (_a) {
                return 0;
            }
        }
        return 0;
    }
    isFromCache(response, duration) {
        // Heuristic: very fast responses (< 5ms) are likely from cache
        if (duration < 5)
            return true;
        // Check cache headers
        const cacheControl = response.headers.get('cache-control');
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');
        return !!(cacheControl || etag || lastModified);
    }
}

class XHRInterceptor {
    constructor(handlers = {}) {
        this.handlers = handlers;
        this.originalOpen = XMLHttpRequest.prototype.open;
        this.originalSend = XMLHttpRequest.prototype.send;
        this.originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    }
    install() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        XMLHttpRequest.prototype.open = function (method, url, async = true, username, password) {
            this._devinspectorId = generateId();
            this._devinspectorMethod = method;
            this._devinspectorUrl = url.toString();
            this._devinspectorRequestHeaders = {};
            return self.originalOpen.apply(this, [method, url, async, username, password]);
        };
        XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
            if (this._devinspectorRequestHeaders) {
                this._devinspectorRequestHeaders[name] = value;
            }
            return self.originalSetRequestHeader.apply(this, [name, value]);
        };
        XMLHttpRequest.prototype.send = function (body) {
            var _a, _b;
            this._devinspectorStartTime = performance.now();
            this._devinspectorRequestBody = self.sanitizeBody(body);
            const request = {
                id: this._devinspectorId,
                method: this._devinspectorMethod,
                url: this._devinspectorUrl,
                headers: this._devinspectorRequestHeaders || {},
                body: this._devinspectorRequestBody,
                timestamp: Date.now(),
                type: 'xhr'
            };
            (_b = (_a = self.handlers).onRequest) === null || _b === void 0 ? void 0 : _b.call(_a, request);
            // Track upload progress
            if (this.upload && self.handlers.onProgress) {
                this.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        self.handlers.onProgress({
                            id: this._devinspectorId,
                            loaded: event.loaded,
                            total: event.total
                        });
                    }
                });
            }
            // Track download progress
            if (self.handlers.onProgress) {
                this.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        self.handlers.onProgress({
                            id: this._devinspectorId,
                            loaded: event.loaded,
                            total: event.total
                        });
                    }
                });
            }
            // Handle load event
            this.addEventListener('load', function () {
                var _a, _b;
                const duration = performance.now() - this._devinspectorStartTime;
                const responseHeaders = self.parseResponseHeaders(this.getAllResponseHeaders());
                const responseBody = self.extractResponseBody(this);
                const size = self.calculateSize(responseBody, responseHeaders);
                const response = {
                    id: this._devinspectorId,
                    status: this.status,
                    statusText: this.statusText,
                    headers: responseHeaders,
                    body: responseBody,
                    size,
                    duration,
                    timestamp: Date.now(),
                    fromCache: duration < 5
                };
                (_b = (_a = self.handlers).onResponse) === null || _b === void 0 ? void 0 : _b.call(_a, response);
            });
            // Handle error event
            this.addEventListener('error', function () {
                var _a, _b;
                const error = {
                    id: this._devinspectorId,
                    message: 'Network request failed',
                    timestamp: Date.now()
                };
                (_b = (_a = self.handlers).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
            });
            // Handle timeout event
            this.addEventListener('timeout', function () {
                var _a, _b;
                const error = {
                    id: this._devinspectorId,
                    message: `Request timeout after ${this.timeout}ms`,
                    timestamp: Date.now()
                };
                (_b = (_a = self.handlers).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
            });
            // Handle abort event
            this.addEventListener('abort', function () {
                var _a, _b;
                const error = {
                    id: this._devinspectorId,
                    message: 'Request aborted',
                    timestamp: Date.now()
                };
                (_b = (_a = self.handlers).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
            });
            return self.originalSend.apply(this, [body]);
        };
    }
    uninstall() {
        XMLHttpRequest.prototype.open = this.originalOpen;
        XMLHttpRequest.prototype.send = this.originalSend;
        XMLHttpRequest.prototype.setRequestHeader = this.originalSetRequestHeader;
    }
    sanitizeBody(body) {
        if (!body)
            return undefined;
        if (typeof body === 'string') {
            return body.length > 10000 ? body.substring(0, 10000) + '...' : body;
        }
        if (body instanceof FormData) {
            const entries = {};
            body.forEach((value, key) => {
                if (value instanceof File) {
                    entries[key] = `[File: ${value.name}, ${value.size} bytes]`;
                }
                else {
                    entries[key] = value;
                }
            });
            return { type: 'FormData', entries };
        }
        if (body instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${body.byteLength} bytes]`;
        }
        if (body instanceof Blob) {
            return `[Blob: ${body.size} bytes, type: ${body.type}]`;
        }
        if (body instanceof Document) {
            return '[Document]';
        }
        return body;
    }
    parseResponseHeaders(headersString) {
        const headers = {};
        if (!headersString)
            return headers;
        const lines = headersString.trim().split(/[\r\n]+/);
        lines.forEach(line => {
            const parts = line.split(': ');
            const key = parts.shift();
            if (key) {
                headers[key] = parts.join(': ');
            }
        });
        return headers;
    }
    extractResponseBody(xhr) {
        try {
            const contentType = xhr.getResponseHeader('content-type') || '';
            if (xhr.responseType === 'json' && xhr.response) {
                return xhr.response;
            }
            if (xhr.responseType === 'arraybuffer') {
                return `[ArrayBuffer: ${xhr.response.byteLength} bytes]`;
            }
            if (xhr.responseType === 'blob') {
                return `[Blob: ${xhr.response.size} bytes, type: ${xhr.response.type}]`;
            }
            if (xhr.responseType === 'document') {
                return '[Document]';
            }
            if (xhr.responseText) {
                if (contentType.includes('application/json')) {
                    try {
                        return JSON.parse(xhr.responseText);
                    }
                    catch (_a) {
                        return xhr.responseText;
                    }
                }
                return xhr.responseText.length > 10000
                    ? xhr.responseText.substring(0, 10000) + '...'
                    : xhr.responseText;
            }
            return null;
        }
        catch (error) {
            return '[Unable to read response]';
        }
    }
    calculateSize(body, headers) {
        const contentLength = headers['content-length'];
        if (contentLength) {
            return parseInt(contentLength, 10);
        }
        if (typeof body === 'string') {
            return new Blob([body]).size;
        }
        if (body && typeof body === 'object') {
            try {
                return new Blob([JSON.stringify(body)]).size;
            }
            catch (_a) {
                return 0;
            }
        }
        return 0;
    }
}

class WebSocketMonitor {
    constructor(handlers = {}) {
        this.connections = new Map();
        this.originalWebSocket = window.WebSocket;
        this.handlers = handlers;
    }
    install() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const OriginalWebSocket = this.originalWebSocket;
        window.WebSocket = function (url, protocols) {
            var _a, _b;
            const ws = new OriginalWebSocket(url, protocols);
            const connectionId = generateId();
            ws._devinspectorId = connectionId;
            ws._devinspectorUrl = url.toString();
            ws._devinspectorProtocols = protocols;
            const connection = {
                id: connectionId,
                url: url.toString(),
                protocols,
                timestamp: Date.now(),
                readyState: ws.readyState,
                status: 'connecting'
            };
            self.connections.set(connectionId, connection);
            (_b = (_a = self.handlers).onConnection) === null || _b === void 0 ? void 0 : _b.call(_a, connection);
            // Monitor open event
            ws.addEventListener('open', function () {
                var _a, _b;
                const conn = self.connections.get(connectionId);
                if (conn) {
                    conn.status = 'open';
                    conn.readyState = this.readyState;
                    (_b = (_a = self.handlers).onStatusChange) === null || _b === void 0 ? void 0 : _b.call(_a, {
                        connectionId,
                        status: 'open'
                    });
                }
            });
            // Monitor close event
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.addEventListener('close', function (event) {
                var _a, _b;
                const conn = self.connections.get(connectionId);
                if (conn) {
                    conn.status = 'closed';
                    conn.readyState = this.readyState;
                    (_b = (_a = self.handlers).onStatusChange) === null || _b === void 0 ? void 0 : _b.call(_a, {
                        connectionId,
                        status: 'closed'
                    });
                }
                self.connections.delete(connectionId);
            });
            // Monitor error event
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.addEventListener('error', function (event) {
                var _a, _b;
                const error = {
                    id: generateId(),
                    connectionId,
                    message: 'WebSocket error occurred',
                    timestamp: Date.now()
                };
                (_b = (_a = self.handlers).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
            });
            // Monitor incoming messages
            ws.addEventListener('message', function (event) {
                var _a, _b;
                const message = {
                    id: generateId(),
                    connectionId,
                    type: 'received',
                    data: self.parseMessageData(event.data),
                    timestamp: Date.now(),
                    size: self.calculateMessageSize(event.data)
                };
                (_b = (_a = self.handlers).onMessage) === null || _b === void 0 ? void 0 : _b.call(_a, message);
            });
            // Intercept send method
            const originalSend = ws.send.bind(ws);
            ws.send = function (data) {
                var _a, _b;
                const message = {
                    id: generateId(),
                    connectionId,
                    type: 'sent',
                    data: self.parseMessageData(data),
                    timestamp: Date.now(),
                    size: self.calculateMessageSize(data)
                };
                (_b = (_a = self.handlers).onMessage) === null || _b === void 0 ? void 0 : _b.call(_a, message);
                return originalSend(data);
            };
            // Intercept close method
            const originalClose = ws.close.bind(ws);
            ws.close = function (code, reason) {
                var _a, _b;
                const conn = self.connections.get(connectionId);
                if (conn) {
                    conn.status = 'closing';
                    conn.readyState = this.readyState;
                    (_b = (_a = self.handlers).onStatusChange) === null || _b === void 0 ? void 0 : _b.call(_a, {
                        connectionId,
                        status: 'closing'
                    });
                }
                return originalClose(code, reason);
            };
            return ws;
        };
        // Copy static properties
        Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
        Object.setPrototypeOf(window.WebSocket.prototype, OriginalWebSocket.prototype);
        // Copy constants
        window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
        window.WebSocket.OPEN = OriginalWebSocket.OPEN;
        window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
        window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    }
    uninstall() {
        window.WebSocket = this.originalWebSocket;
        this.connections.clear();
    }
    parseMessageData(data) {
        if (typeof data === 'string') {
            // Try to parse JSON
            try {
                return JSON.parse(data);
            }
            catch (_a) {
                // Return string as-is, but truncate if too long
                return data.length > 10000 ? data.substring(0, 10000) + '...' : data;
            }
        }
        if (data instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${data.byteLength} bytes]`;
        }
        if (data instanceof Blob) {
            return `[Blob: ${data.size} bytes, type: ${data.type}]`;
        }
        if (ArrayBuffer.isView(data)) {
            return `[ArrayBufferView: ${data.byteLength} bytes]`;
        }
        return data;
    }
    calculateMessageSize(data) {
        if (typeof data === 'string') {
            return new Blob([data]).size;
        }
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        if (data instanceof Blob) {
            return data.size;
        }
        if (ArrayBuffer.isView(data)) {
            return data.byteLength;
        }
        return 0;
    }
    getActiveConnections() {
        return Array.from(this.connections.values());
    }
    getConnection(id) {
        return this.connections.get(id);
    }
}

class NetworkMonitor {
    constructor(inspector) {
        this.entries = new Map();
        this.isActive = false;
        this.inspector = inspector;
        this.fetchInterceptor = new FetchInterceptor({
            onRequest: this.handleRequest.bind(this, 'fetch'),
            onResponse: this.handleResponse.bind(this),
            onError: this.handleError.bind(this)
        });
        this.xhrInterceptor = new XHRInterceptor({
            onRequest: this.handleRequest.bind(this, 'xhr'),
            onResponse: this.handleResponse.bind(this),
            onError: this.handleError.bind(this),
            onProgress: this.handleProgress.bind(this)
        });
        this.websocketMonitor = new WebSocketMonitor({
            onConnection: this.handleWebSocketConnection.bind(this),
            onMessage: this.handleWebSocketMessage.bind(this),
            onStatusChange: this.handleWebSocketStatusChange.bind(this),
            onError: this.handleWebSocketError.bind(this)
        });
    }
    start() {
        if (this.isActive)
            return;
        this.fetchInterceptor.install();
        this.xhrInterceptor.install();
        this.websocketMonitor.install();
        this.installBeaconInterceptor();
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        this.fetchInterceptor.uninstall();
        this.xhrInterceptor.uninstall();
        this.websocketMonitor.uninstall();
        this.uninstallBeaconInterceptor();
        this.isActive = false;
    }
    handleRequest(type, request) {
        const entry = {
            id: request.id,
            type,
            request,
            timestamp: request.timestamp
        };
        this.entries.set(request.id, entry);
        const storage = this.inspector.getStorage('network');
        storage.push(entry);
        this.inspector.getEvents().emit('network:request', {
            ...request,
            type
        });
    }
    handleResponse(response) {
        var _a, _b, _c, _d;
        const entry = this.entries.get(response.id);
        if (!entry)
            return;
        entry.response = response;
        entry.duration = response.duration;
        entry.status = response.status;
        entry.size = response.size;
        const storage = this.inspector.getStorage('network');
        storage.push(entry);
        this.inspector.getEvents().emit('network:response', response);
        // Check for performance issues
        if (response.duration > 3000) {
            (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                type: 'slow-network',
                message: `Slow network request: ${(_c = entry.request) === null || _c === void 0 ? void 0 : _c.url}`,
                duration: response.duration,
                url: (_d = entry.request) === null || _d === void 0 ? void 0 : _d.url
            });
        }
    }
    handleError(error) {
        const entry = this.entries.get(error.id);
        if (!entry)
            return;
        entry.error = error;
        const storage = this.inspector.getStorage('network');
        storage.push(entry);
        this.inspector.getEvents().emit('network:error', error);
    }
    handleProgress(progress) {
        this.inspector.getEvents().emit('network:progress', progress);
    }
    handleWebSocketConnection(connection) {
        const entry = {
            id: connection.id,
            type: 'websocket',
            websocket: {
                connection,
                messages: [],
                errors: []
            },
            timestamp: connection.timestamp
        };
        this.entries.set(connection.id, entry);
        const storage = this.inspector.getStorage('network');
        storage.push(entry);
        this.inspector.getEvents().emit('network:websocket:connection', connection);
    }
    handleWebSocketMessage(message) {
        const entry = this.entries.get(message.connectionId);
        if (!entry || !entry.websocket)
            return;
        entry.websocket.messages.push(message);
        this.inspector.getEvents().emit('network:websocket:message', message);
    }
    handleWebSocketStatusChange(status) {
        var _a;
        const entry = this.entries.get(status.connectionId);
        if (!entry || !((_a = entry.websocket) === null || _a === void 0 ? void 0 : _a.connection))
            return;
        entry.websocket.connection.status = status.status;
        this.inspector.getEvents().emit('network:websocket:status', status);
    }
    handleWebSocketError(error) {
        const entry = this.entries.get(error.connectionId);
        if (!entry || !entry.websocket)
            return;
        entry.websocket.errors.push(error);
        this.inspector.getEvents().emit('network:websocket:error', error);
    }
    installBeaconInterceptor() {
        if (!navigator.sendBeacon)
            return;
        const originalSendBeacon = navigator.sendBeacon.bind(navigator);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        navigator.sendBeacon = function (url, data) {
            const id = self.generateId();
            const request = {
                id,
                method: 'POST',
                url,
                headers: {},
                body: self.sanitizeBeaconData(data),
                timestamp: Date.now(),
                type: 'beacon'
            };
            self.handleRequest('beacon', request);
            const result = originalSendBeacon(url, data);
            // Simulate response for beacon (we don't get actual response)
            setTimeout(() => {
                const response = {
                    id,
                    status: result ? 204 : 0,
                    statusText: result ? 'No Content' : 'Failed',
                    headers: {},
                    size: 0,
                    duration: 0,
                    timestamp: Date.now()
                };
                self.handleResponse(response);
            }, 0);
            return result;
        };
        this.beaconInterceptor = originalSendBeacon;
    }
    uninstallBeaconInterceptor() {
        if (this.beaconInterceptor && navigator.sendBeacon) {
            navigator.sendBeacon = this.beaconInterceptor;
        }
    }
    sanitizeBeaconData(data) {
        if (!data)
            return undefined;
        if (typeof data === 'string') {
            return data.length > 1000 ? data.substring(0, 1000) + '...' : data;
        }
        if (data instanceof FormData) {
            const entries = {};
            data.forEach((value, key) => {
                entries[key] = value instanceof File
                    ? `[File: ${value.name}]`
                    : value;
            });
            return { type: 'FormData', entries };
        }
        if (data instanceof Blob) {
            return `[Blob: ${data.size} bytes]`;
        }
        if (data instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${data.byteLength} bytes]`;
        }
        return data;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    getEntries() {
        return Array.from(this.entries.values());
    }
    clearEntries() {
        this.entries.clear();
    }
    getEntry(id) {
        return this.entries.get(id);
    }
    filterEntries(predicate) {
        return Array.from(this.entries.values()).filter(predicate);
    }
}

var networkMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NetworkMonitor: NetworkMonitor
});

class ConsoleInterceptor {
    constructor(handlers = {}, captureStackTraces = true) {
        this.originalMethods = new Map();
        this.groupLevel = 0;
        this.counters = new Map();
        this.timers = new Map();
        this.handlers = handlers;
        this.captureStackTraces = captureStackTraces;
    }
    install() {
        const methods = [
            'log', 'info', 'warn', 'error', 'debug', 'trace', 'table',
            'group', 'groupCollapsed', 'groupEnd', 'clear',
            'count', 'countReset', 'time', 'timeEnd', 'timeLog',
            'assert', 'dir', 'dirxml', 'profile', 'profileEnd'
        ];
        methods.forEach(method => {
            this.originalMethods.set(method, console[method]);
            this.interceptMethod(method);
        });
    }
    uninstall() {
        this.originalMethods.forEach((original, method) => {
            console[method] = original;
        });
        this.originalMethods.clear();
        this.counters.clear();
        this.timers.clear();
        this.groupLevel = 0;
    }
    interceptMethod(method) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const original = this.originalMethods.get(method);
        console[method] = function (...args) {
            var _a, _b, _c, _d;
            // Call original method first
            original.apply(console, args);
            // Handle special methods
            switch (method) {
                case 'clear':
                    (_b = (_a = self.handlers).onClear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return;
                case 'group':
                case 'groupCollapsed':
                    self.groupLevel++;
                    break;
                case 'groupEnd':
                    self.groupLevel = Math.max(0, self.groupLevel - 1);
                    break;
                case 'count':
                    self.handleCount(args[0]);
                    return;
                case 'countReset':
                    self.counters.delete(args[0] || 'default');
                    return;
                case 'time':
                    self.timers.set(args[0] || 'default', performance.now());
                    return;
                case 'timeEnd':
                    self.handleTimeEnd(args[0], 'timeEnd');
                    return;
                case 'timeLog':
                    self.handleTimeEnd(args[0], 'timeLog');
                    break;
                case 'assert':
                    if (args[0])
                        return; // Don't log if assertion passes
                    args = args.slice(1); // Remove condition
                    break;
            }
            // Create log entry
            const entry = {
                id: generateId(),
                level: method,
                args: args,
                formattedArgs: self.formatArgs(args),
                timestamp: Date.now(),
                groupLevel: self.groupLevel
            };
            // Capture stack trace if enabled
            if (self.captureStackTraces && (method === 'error' || method === 'warn' || method === 'trace')) {
                const stack = getStackTrace();
                entry.stack = stack.slice(1); // Remove this interceptor from stack
                entry.source = self.extractSourceFromStack(stack[1]);
            }
            (_d = (_c = self.handlers).onLog) === null || _d === void 0 ? void 0 : _d.call(_c, entry);
        };
    }
    handleCount(label) {
        var _a, _b;
        const key = label || 'default';
        const count = (this.counters.get(key) || 0) + 1;
        this.counters.set(key, count);
        const entry = {
            id: generateId(),
            level: 'log',
            args: [`${key}: ${count}`],
            formattedArgs: [`${key}: ${count}`],
            timestamp: Date.now(),
            groupLevel: this.groupLevel
        };
        (_b = (_a = this.handlers).onLog) === null || _b === void 0 ? void 0 : _b.call(_a, entry);
    }
    handleTimeEnd(label, method) {
        var _a, _b, _c, _d;
        const key = label || 'default';
        const startTime = this.timers.get(key);
        if (startTime === undefined) {
            const entry = {
                id: generateId(),
                level: 'warn',
                args: [`Timer '${key}' does not exist`],
                formattedArgs: [`Timer '${key}' does not exist`],
                timestamp: Date.now(),
                groupLevel: this.groupLevel
            };
            (_b = (_a = this.handlers).onLog) === null || _b === void 0 ? void 0 : _b.call(_a, entry);
            return;
        }
        const duration = performance.now() - startTime;
        if (method === 'timeEnd') {
            this.timers.delete(key);
        }
        const entry = {
            id: generateId(),
            level: 'log',
            args: [`${key}: ${duration.toFixed(3)}ms`],
            formattedArgs: [`${key}: ${duration.toFixed(3)}ms`],
            timestamp: Date.now(),
            groupLevel: this.groupLevel
        };
        (_d = (_c = this.handlers).onLog) === null || _d === void 0 ? void 0 : _d.call(_c, entry);
    }
    formatArgs(args) {
        return args.map(arg => this.formatValue(arg));
    }
    formatValue(value) {
        if (value === null)
            return 'null';
        if (value === undefined)
            return 'undefined';
        const type = typeof value;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return value;
        }
        if (value instanceof Error) {
            return {
                type: 'error',
                name: value.name,
                message: value.message,
                stack: value.stack
            };
        }
        if (value instanceof Date) {
            return {
                type: 'date',
                value: value.toISOString()
            };
        }
        if (value instanceof RegExp) {
            return {
                type: 'regexp',
                value: value.toString()
            };
        }
        if (typeof value === 'function') {
            return {
                type: 'function',
                name: value.name || '<anonymous>',
                value: value.toString().substring(0, 100)
            };
        }
        if (Array.isArray(value)) {
            return {
                type: 'array',
                length: value.length,
                value: value.slice(0, 100).map(v => this.formatValue(v))
            };
        }
        if (type === 'object') {
            try {
                // Check for circular references
                const stringified = safeStringify(value, 2);
                return {
                    type: 'object',
                    value: JSON.parse(stringified)
                };
            }
            catch (error) {
                return {
                    type: 'object',
                    value: '[Complex Object]'
                };
            }
        }
        return String(value);
    }
    extractSourceFromStack(stackFrame) {
        if (!stackFrame)
            return undefined;
        // Match patterns like "at functionName (file:line:column)" or "at file:line:column"
        const match = stackFrame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
        if (!match)
            return undefined;
        const [, , file, line, column] = match;
        return {
            file: file.replace(/^.*\//, ''), // Get just filename
            line: parseInt(line, 10),
            column: parseInt(column, 10)
        };
    }
}

class LogFormatter {
    formatArgs(args) {
        return args.map(arg => this.formatValue(arg));
    }
    formatArgsAsText(args) {
        return args.map(arg => this.formatValueAsText(arg)).join(' ');
    }
    formatValue(value) {
        var _a;
        if (value === null)
            return 'null';
        if (value === undefined)
            return 'undefined';
        const type = typeof value;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return value;
        }
        if (value instanceof Error) {
            return {
                type: 'error',
                name: value.name,
                message: value.message,
                stack: value.stack
            };
        }
        if (value instanceof Date) {
            return {
                type: 'date',
                value: value.toISOString()
            };
        }
        if (value instanceof RegExp) {
            return {
                type: 'regexp',
                value: value.toString()
            };
        }
        if (value instanceof Set) {
            return {
                type: 'set',
                size: value.size,
                values: Array.from(value).slice(0, 100)
            };
        }
        if (value instanceof Map) {
            return {
                type: 'map',
                size: value.size,
                entries: Array.from(value.entries()).slice(0, 100)
            };
        }
        if (value instanceof WeakSet || value instanceof WeakMap) {
            return {
                type: value instanceof WeakSet ? 'weakset' : 'weakmap',
                value: '[WeakCollection]'
            };
        }
        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
            return {
                type: 'arraybuffer',
                byteLength: value.byteLength
            };
        }
        if (typeof value === 'function') {
            return {
                type: 'function',
                name: value.name || '<anonymous>',
                value: value.toString().substring(0, 100)
            };
        }
        if (Array.isArray(value)) {
            return {
                type: 'array',
                length: value.length,
                value: value.slice(0, 100).map(v => this.formatValue(v))
            };
        }
        if (type === 'object') {
            // Check if it's a formatted object from interceptor
            if (value.type && typeof value.value !== 'undefined') {
                return value;
            }
            try {
                const proto = Object.getPrototypeOf(value);
                const constructorName = ((_a = proto === null || proto === void 0 ? void 0 : proto.constructor) === null || _a === void 0 ? void 0 : _a.name) || 'Object';
                const entries = Object.entries(value).slice(0, 100);
                const formatted = {
                    type: 'object',
                    constructor: constructorName,
                    value: {}
                };
                for (const [key, val] of entries) {
                    formatted.value[key] = this.formatValue(val);
                }
                if (Object.keys(value).length > 100) {
                    formatted.truncated = true;
                    formatted.totalKeys = Object.keys(value).length;
                }
                return formatted;
            }
            catch (error) {
                return {
                    type: 'object',
                    value: '[Complex Object]'
                };
            }
        }
        return String(value);
    }
    formatValueAsText(value) {
        if (value === null)
            return 'null';
        if (value === undefined)
            return 'undefined';
        const type = typeof value;
        if (type === 'string')
            return `"${value}"`;
        if (type === 'number' || type === 'boolean')
            return String(value);
        if (value.type) {
            switch (value.type) {
                case 'error':
                    return `${value.name}: ${value.message}`;
                case 'date':
                    return value.value;
                case 'regexp':
                    return value.value;
                case 'function':
                    return `[Function: ${value.name}]`;
                case 'array':
                    return `Array(${value.length})`;
                case 'object':
                    return value.constructor ? `${value.constructor} {...}` : 'Object {...}';
                case 'set':
                    return `Set(${value.size})`;
                case 'map':
                    return `Map(${value.size})`;
                default:
                    return JSON.stringify(value.value);
            }
        }
        return JSON.stringify(value);
    }
    formatStackTrace(stack) {
        return stack.map((frame, index) => {
            // Remove leading "at " if present
            const cleanFrame = frame.replace(/^\s*at\s+/, '');
            // Add indentation
            return '  '.repeat(index) + cleanFrame;
        }).join('\n');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    highlightSyntax(code, language = 'javascript') {
        // Simple syntax highlighting for console display
        // In a real implementation, you might use a proper syntax highlighter
        const keywords = [
            'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while',
            'return', 'new', 'this', 'typeof', 'instanceof', 'try', 'catch', 'finally',
            'throw', 'async', 'await', 'import', 'export', 'default'
        ];
        let highlighted = code;
        // Highlight strings
        highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
        // Highlight numbers
        highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        // Highlight comments
        highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
        highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
        return highlighted;
    }
}

class ConsoleMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.inspector = inspector;
        this.formatter = new LogFormatter();
        this.interceptor = new ConsoleInterceptor({
            onLog: this.handleLog.bind(this),
            onClear: this.handleClear.bind(this)
        }, inspector.getConfig().captureStackTraces);
    }
    start() {
        if (this.isActive)
            return;
        this.interceptor.install();
        this.setupCommandExecution();
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        this.interceptor.uninstall();
        this.isActive = false;
    }
    handleLog(entry) {
        const storage = this.inspector.getStorage('console');
        storage.push(entry);
        this.inspector.getEvents().emit('console:log', entry);
        // Check for errors
        if (entry.level === 'error') {
            this.inspector.getEvents().emit('error:caught', {
                message: this.formatter.formatArgs(entry.args),
                stack: entry.stack,
                timestamp: entry.timestamp,
                source: 'console'
            });
        }
    }
    handleClear() {
        const storage = this.inspector.getStorage('console');
        storage.clear();
        this.inspector.getEvents().emit('console:clear');
    }
    setupCommandExecution() {
        // This would be called by the UI to execute commands
        this.inspector.on('console:execute', (command) => {
            this.executeCommand(command);
        });
    }
    executeCommand(command) {
        var _a;
        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        // Log the command
        const commandEntry = {
            id: `cmd-${Date.now()}`,
            level: 'log',
            args: [`> ${command}`],
            formattedArgs: [`> ${command}`],
            timestamp: Date.now(),
            groupLevel: 0
        };
        this.handleLog(commandEntry);
        // Execute the command
        try {
            // Create a function to evaluate the command in global scope
            const result = (0, eval)(command);
            if (result !== undefined) {
                const resultEntry = {
                    id: `result-${Date.now()}`,
                    level: 'log',
                    args: [result],
                    formattedArgs: this.formatter.formatArgs([result]),
                    timestamp: Date.now(),
                    groupLevel: 0
                };
                this.handleLog(resultEntry);
            }
        }
        catch (error) {
            const errorEntry = {
                id: `error-${Date.now()}`,
                level: 'error',
                args: [error],
                formattedArgs: this.formatter.formatArgs([error]),
                timestamp: Date.now(),
                groupLevel: 0,
                stack: (_a = error.stack) === null || _a === void 0 ? void 0 : _a.split('\n')
            };
            this.handleLog(errorEntry);
        }
    }
    getHistory() {
        return [...this.commandHistory];
    }
    navigateHistory(direction) {
        if (this.commandHistory.length === 0)
            return undefined;
        if (direction === 'up') {
            this.historyIndex = Math.max(0, this.historyIndex - 1);
        }
        else {
            this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
        }
        return this.commandHistory[this.historyIndex];
    }
    filterLogs(filter) {
        const storage = this.inspector.getStorage('console');
        const logs = storage.getAll();
        return logs.filter(log => {
            var _a;
            // Filter by level
            if (filter.levels && filter.levels.length > 0) {
                if (!filter.levels.includes(log.level)) {
                    return false;
                }
            }
            // Filter by search
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                const argsString = JSON.stringify(log.formattedArgs).toLowerCase();
                if (!argsString.includes(searchLower)) {
                    return false;
                }
            }
            // Filter by source
            if (filter.source && ((_a = log.source) === null || _a === void 0 ? void 0 : _a.file)) {
                if (!log.source.file.includes(filter.source)) {
                    return false;
                }
            }
            return true;
        });
    }
    exportLogs(format = 'json') {
        const logs = this.inspector.getStorage('console').getAll();
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        }
        // Text format
        return logs.map(log => {
            const timestamp = new Date(log.timestamp).toISOString();
            const level = log.level.toUpperCase().padEnd(5);
            const args = this.formatter.formatArgsAsText(log.formattedArgs);
            const source = log.source ? ` [${log.source.file}:${log.source.line}]` : '';
            return `[${timestamp}] ${level} ${args}${source}`;
        }).join('\n');
    }
}

var consoleMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ConsoleMonitor: ConsoleMonitor
});

class FPSMonitor {
    constructor(callback, updateInterval = 1000) {
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.frameTimeSum = 0;
        this.droppedFrames = 0;
        this.animationId = null;
        this.lastUpdateTime = 0;
        this.tick = () => {
            if (!this.isRunning)
                return;
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            // Track frame time
            this.frameTimeSum += deltaTime;
            this.frameCount++;
            // Detect dropped frames (> 16.67ms indicates < 60fps)
            if (deltaTime > 16.67) {
                this.droppedFrames++;
            }
            // Update FPS calculation
            const timeSinceUpdate = currentTime - this.lastUpdateTime;
            if (timeSinceUpdate >= this.updateInterval) {
                this.fps = (this.frameCount * 1000) / timeSinceUpdate;
                const avgFrameTime = this.frameTimeSum / this.frameCount;
                this.callback({
                    fps: Math.round(this.fps),
                    timestamp: Date.now(),
                    frameTime: avgFrameTime,
                    droppedFrames: this.droppedFrames
                });
                // Reset counters
                this.frameCount = 0;
                this.frameTimeSum = 0;
                this.droppedFrames = 0;
                this.lastUpdateTime = currentTime;
            }
            this.lastTime = currentTime;
            this.animationId = requestAnimationFrame(this.tick);
        };
        this.callback = callback;
        this.updateInterval = updateInterval;
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastUpdateTime = this.lastTime;
        this.frameCount = 0;
        this.frameTimeSum = 0;
        this.droppedFrames = 0;
        this.tick();
    }
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    getCurrentFPS() {
        return Math.round(this.fps);
    }
}

class MemoryMonitor {
    constructor(callback, updateInterval = 1000) {
        this.intervalId = null;
        this.callback = callback;
        this.updateInterval = updateInterval;
        this.isSupported = this.checkSupport();
    }
    checkSupport() {
        return 'memory' in performance && performance.memory !== undefined;
    }
    start() {
        if (!this.isSupported) {
            console.warn('Performance.memory is not supported in this browser');
            return;
        }
        if (this.intervalId !== null)
            return;
        // Initial reading
        this.measure();
        // Set up interval
        this.intervalId = window.setInterval(() => {
            this.measure();
        }, this.updateInterval);
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    measure() {
        if (!performance.memory)
            return;
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const percentUsed = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        const data = {
            usedJSHeapSize,
            totalJSHeapSize,
            jsHeapSizeLimit,
            timestamp: Date.now(),
            percentUsed
        };
        this.callback(data);
    }
    getCurrentMemory() {
        if (!this.isSupported || !performance.memory)
            return null;
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        return {
            usedJSHeapSize,
            totalJSHeapSize,
            jsHeapSizeLimit,
            timestamp: Date.now(),
            percentUsed: (usedJSHeapSize / jsHeapSizeLimit) * 100
        };
    }
    isMemorySupported() {
        return this.isSupported;
    }
}

class MetricsCollector {
    constructor(callback) {
        this.metrics = {};
        this.observer = null;
        this.fidObserver = null;
        this.clsValue = 0;
        this.clsEntries = [];
        this.sessionValue = 0;
        this.sessionEntries = [];
        this.callback = callback;
    }
    start() {
        this.observePaintMetrics();
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.observeINP();
        this.measureNavigationTiming();
    }
    stop() {
        var _a, _b;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        (_b = this.fidObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
        this.observer = null;
        this.fidObserver = null;
    }
    observePaintMetrics() {
        try {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = Math.round(entry.startTime);
                        this.reportMetrics();
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
        }
        catch (e) {
            console.warn('Paint metrics not supported');
        }
    }
    observeLCP() {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.LCP = Math.round(lastEntry.startTime);
                this.reportMetrics();
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
        catch (e) {
            console.warn('LCP not supported');
        }
    }
    observeFID() {
        try {
            this.fidObserver = new PerformanceObserver((list) => {
                var _a;
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-input') {
                        const fidEntry = entry;
                        this.metrics.FID = Math.round(fidEntry.processingStart - fidEntry.startTime);
                        this.reportMetrics();
                        (_a = this.fidObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
                    }
                }
            });
            this.fidObserver.observe({ entryTypes: ['first-input'] });
        }
        catch (e) {
            console.warn('FID not supported');
        }
    }
    observeCLS() {
        try {
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const layoutShiftEntry = entry;
                    if (!layoutShiftEntry.hadRecentInput) {
                        this.clsValue += layoutShiftEntry.value;
                        this.clsEntries.push(entry);
                    }
                }
                this.metrics.CLS = Math.round(this.clsValue * 1000) / 1000;
                this.reportMetrics();
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
        catch (e) {
            console.warn('CLS not supported');
        }
    }
    observeINP() {
        try {
            let maxINP = 0;
            const inpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'event') {
                        const eventEntry = entry;
                        const inp = eventEntry.duration;
                        if (inp > maxINP) {
                            maxINP = inp;
                            this.metrics.INP = Math.round(maxINP);
                            this.reportMetrics();
                        }
                    }
                }
            });
            inpObserver.observe({ entryTypes: ['event'] });
        }
        catch (e) {
            console.warn('INP not supported');
        }
    }
    measureNavigationTiming() {
        if (!performance.timing)
            return;
        const timing = performance.timing;
        const navigationStart = timing.navigationStart;
        // Calculate TTFB
        this.metrics.TTFB = Math.round(timing.responseStart - navigationStart);
        // Calculate other timings
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            connectTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseStart - timing.requestStart,
            responseTime: timing.responseEnd - timing.responseStart,
            domProcessingTime: timing.domComplete - timing.domLoading,
            domContentLoadedTime: timing.domContentLoadedEventEnd - navigationStart,
            loadTime: timing.loadEventEnd - navigationStart,
            totalTime: timing.loadEventEnd - navigationStart
        });
        this.reportMetrics();
    }
    reportMetrics() {
        this.callback({ ...this.metrics });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    markStart(name) {
        performance.mark(`${name}-start`);
    }
    markEnd(name) {
        performance.mark(`${name}-end`);
        try {
            performance.measure(name, `${name}-start`, `${name}-end`);
            const measures = performance.getEntriesByName(name, 'measure');
            if (measures.length > 0) {
                const measure = measures[measures.length - 1];
                return measure.duration;
            }
        }
        catch (e) {
            console.warn(`Failed to measure ${name}`);
        }
    }
    clearMarks(name) {
        if (name) {
            performance.clearMarks(`${name}-start`);
            performance.clearMarks(`${name}-end`);
            performance.clearMeasures(name);
        }
        else {
            performance.clearMarks();
            performance.clearMeasures();
        }
    }
}

class LongTaskDetector {
    constructor(callback, threshold = 50) {
        this.observer = null;
        this.idCounter = 0;
        this.callback = callback;
        this.threshold = threshold;
    }
    start() {
        if (this.observer)
            return;
        try {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration >= this.threshold) {
                        this.handleLongTask(entry);
                    }
                }
            });
            this.observer.observe({ entryTypes: ['longtask'] });
        }
        catch (e) {
            console.warn('Long Task API not supported');
            this.fallbackDetection();
        }
    }
    stop() {
        var _a;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.observer = null;
    }
    handleLongTask(entry) {
        const longTaskEntry = entry; // PerformanceLongTaskTiming
        const task = {
            id: `longtask-${++this.idCounter}`,
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            timestamp: Date.now(),
            attribution: longTaskEntry.attribution ?
                longTaskEntry.attribution.map((attr) => ({
                    name: attr.name,
                    containerType: attr.containerType,
                    containerSrc: attr.containerSrc,
                    containerId: attr.containerId,
                    containerName: attr.containerName
                })) : []
        };
        this.callback(task);
    }
    fallbackDetection() {
        // Fallback detection using requestAnimationFrame
        let lastTime = performance.now();
        const check = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            if (deltaTime > this.threshold) {
                const task = {
                    id: `longtask-fallback-${++this.idCounter}`,
                    duration: Math.round(deltaTime),
                    startTime: Math.round(lastTime),
                    timestamp: Date.now(),
                    attribution: [{
                            name: 'unknown',
                            containerType: 'window'
                        }]
                };
                this.callback(task);
            }
            lastTime = currentTime;
            if (this.observer === null) {
                requestAnimationFrame(check);
            }
        };
        requestAnimationFrame(check);
    }
}

class PerformanceMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.performanceData = { timestamp: Date.now() };
        this.inspector = inspector;
        // Initialize monitors with callbacks
        this.fpsMonitor = new FPSMonitor(this.handleFPSData.bind(this));
        this.memoryMonitor = new MemoryMonitor(this.handleMemoryData.bind(this));
        this.metricsCollector = new MetricsCollector(this.handleMetrics.bind(this));
        this.longTaskDetector = new LongTaskDetector(this.handleLongTask.bind(this));
        // Throttle the performance data emission
        this.emitPerformanceData = throttle(this.emitPerformanceData.bind(this), 100);
    }
    start() {
        if (this.isActive)
            return;
        this.fpsMonitor.start();
        this.memoryMonitor.start();
        this.metricsCollector.start();
        this.longTaskDetector.start();
        this.setupPerformanceObservers();
        this.monitorResourceTiming();
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        this.fpsMonitor.stop();
        this.memoryMonitor.stop();
        this.metricsCollector.stop();
        this.longTaskDetector.stop();
        this.isActive = false;
    }
    handleFPSData(data) {
        var _a, _b;
        this.performanceData.fps = data;
        const storage = this.inspector.getStorage('performance');
        storage.set('fps', data);
        // Check for performance issues
        if (data.fps < 30) {
            (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                type: 'low-fps',
                message: `Low FPS detected: ${data.fps}`,
                fps: data.fps,
                droppedFrames: data.droppedFrames
            });
        }
        this.emitPerformanceData();
    }
    handleMemoryData(data) {
        var _a, _b;
        this.performanceData.memory = data;
        const storage = this.inspector.getStorage('performance');
        storage.set('memory', data);
        // Check for memory issues
        if (data.percentUsed > 90) {
            (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                type: 'high-memory',
                message: `High memory usage: ${data.percentUsed.toFixed(1)}%`,
                percentUsed: data.percentUsed,
                usedBytes: data.usedJSHeapSize
            });
        }
        this.emitPerformanceData();
    }
    handleMetrics(metrics) {
        var _a, _b, _c, _d, _e, _f;
        this.performanceData.metrics = metrics;
        const storage = this.inspector.getStorage('performance');
        storage.set('metrics', metrics);
        // Check for poor metrics
        if (metrics.LCP && metrics.LCP > 2500) {
            (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                type: 'poor-lcp',
                message: `Poor LCP: ${metrics.LCP}ms`,
                value: metrics.LCP
            });
        }
        if (metrics.FID && metrics.FID > 100) {
            (_d = (_c = this.inspector.getConfig()).onPerformanceIssue) === null || _d === void 0 ? void 0 : _d.call(_c, {
                type: 'poor-fid',
                message: `Poor FID: ${metrics.FID}ms`,
                value: metrics.FID
            });
        }
        if (metrics.CLS && metrics.CLS > 0.1) {
            (_f = (_e = this.inspector.getConfig()).onPerformanceIssue) === null || _f === void 0 ? void 0 : _f.call(_e, {
                type: 'poor-cls',
                message: `Poor CLS: ${metrics.CLS}`,
                value: metrics.CLS
            });
        }
        this.inspector.getEvents().emit('performance:metrics', metrics);
    }
    handleLongTask(task) {
        var _a, _b;
        const storage = this.inspector.getStorage('performance');
        const longTasks = storage.get('longTasks') || [];
        longTasks.push(task);
        // Keep only last 100 long tasks
        if (longTasks.length > 100) {
            longTasks.shift();
        }
        storage.set('longTasks', longTasks);
        this.inspector.getEvents().emit('performance:longtask', task);
        // Report significant long tasks
        if (task.duration > 200) {
            (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                type: 'long-task',
                message: `Long task detected: ${task.duration}ms`,
                duration: task.duration,
                attribution: task.attribution
            });
        }
    }
    emitPerformanceData() {
        this.performanceData.timestamp = Date.now();
        this.inspector.getEvents().emit('performance:data', this.performanceData);
    }
    setupPerformanceObservers() {
        // Observe navigation timing
        if ('PerformanceObserver' in window) {
            try {
                const navObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.inspector.getEvents().emit('performance:navigation', {
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                });
                navObserver.observe({ entryTypes: ['navigation'] });
            }
            catch (e) {
                console.warn('Navigation timing observation not supported');
            }
        }
    }
    monitorResourceTiming() {
        if (!('PerformanceObserver' in window))
            return;
        try {
            const resourceObserver = new PerformanceObserver((list) => {
                var _a, _b;
                for (const entry of list.getEntries()) {
                    const resourceEntry = entry;
                    // Check for slow resources
                    if (resourceEntry.duration > 1000) {
                        (_b = (_a = this.inspector.getConfig()).onPerformanceIssue) === null || _b === void 0 ? void 0 : _b.call(_a, {
                            type: 'slow-resource',
                            message: `Slow resource: ${resourceEntry.name}`,
                            duration: resourceEntry.duration,
                            url: resourceEntry.name
                        });
                    }
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
        catch (e) {
            console.warn('Resource timing observation not supported');
        }
    }
    // Public API for manual performance tracking
    markStart(name) {
        this.metricsCollector.markStart(name);
    }
    markEnd(name) {
        const duration = this.metricsCollector.markEnd(name);
        if (duration !== undefined) {
            this.inspector.getEvents().emit('performance:mark', {
                name,
                duration,
                timestamp: Date.now()
            });
        }
    }
    getSnapshot() {
        return {
            fps: this.performanceData.fps,
            memory: this.memoryMonitor.getCurrentMemory() || undefined,
            metrics: this.metricsCollector.getMetrics(),
            longTasks: this.inspector.getStorage('performance').get('longTasks') || [],
            timestamp: Date.now()
        };
    }
}

var performanceMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    PerformanceMonitor: PerformanceMonitor
});

class ErrorTracker {
    constructor(callback) {
        this.groups = new Map();
        this.seenErrors = new WeakSet();
        this.ignorePatterns = [];
        this.callback = callback;
        this.setupDefaultIgnorePatterns();
    }
    setupDefaultIgnorePatterns() {
        this.ignorePatterns = [
            /ResizeObserver loop limit exceeded/,
            /ResizeObserver loop completed with undelivered notifications/,
            /Non-Error promise rejection captured/,
            /Network request failed/,
            /Failed to fetch/,
            /Load failed/,
            /Script error/
        ];
    }
    addIgnorePattern(pattern) {
        this.ignorePatterns.push(pattern);
    }
    trackError(error, type = 'error') {
        // Avoid tracking the same error multiple times
        if (error instanceof Error && this.seenErrors.has(error)) {
            return;
        }
        const errorInfo = this.createErrorInfo(error, type);
        // Check if error should be ignored
        if (this.shouldIgnoreError(errorInfo)) {
            return;
        }
        // Mark error as seen
        if (error instanceof Error) {
            this.seenErrors.add(error);
        }
        // Group similar errors
        const group = this.groupError(errorInfo);
        errorInfo.groupId = group.id;
        this.callback(errorInfo);
    }
    createErrorInfo(error, type) {
        let message = '';
        let stack = [];
        let source;
        let lineno;
        let colno;
        let errorObject;
        if (error instanceof Error) {
            message = error.message || error.toString();
            stack = error.stack ? error.stack.split('\n').map(line => line.trim()) : [];
            errorObject = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }
        else if ('message' in error && error instanceof ErrorEvent) {
            message = error.message;
            source = error.filename;
            lineno = error.lineno;
            colno = error.colno;
            if (error.error) {
                stack = error.error.stack ? error.error.stack.split('\n').map(line => line.trim()) : [];
                errorObject = error.error;
            }
        }
        else if ('reason' in error && error instanceof PromiseRejectionEvent) {
            const reason = error.reason;
            if (reason instanceof Error) {
                message = reason.message || reason.toString();
                stack = reason.stack ? reason.stack.split('\n').map(line => line.trim()) : [];
                errorObject = reason;
            }
            else {
                message = String(reason);
                errorObject = reason;
            }
        }
        // Parse stack frames
        const stackFrames = stack
            .map(frame => parseStackFrame(frame))
            .filter(frame => frame !== null);
        const errorInfo = {
            id: generateId(),
            type,
            message,
            stack,
            stackFrames,
            source,
            lineno,
            colno,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errorObject,
            count: 1
        };
        return errorInfo;
    }
    shouldIgnoreError(errorInfo) {
        var _a;
        // Check ignore patterns
        for (const pattern of this.ignorePatterns) {
            if (pattern.test(errorInfo.message)) {
                return true;
            }
        }
        // Ignore cross-origin script errors without useful information
        if (errorInfo.message === 'Script error.' && !((_a = errorInfo.stack) === null || _a === void 0 ? void 0 : _a.length)) {
            return true;
        }
        // Ignore errors from browser extensions
        if (errorInfo.source && (errorInfo.source.includes('extension://') ||
            errorInfo.source.includes('chrome-extension://') ||
            errorInfo.source.includes('moz-extension://'))) {
            return true;
        }
        return false;
    }
    groupError(errorInfo) {
        const fingerprint = this.generateFingerprint(errorInfo);
        let group = this.groups.get(fingerprint);
        if (!group) {
            group = {
                id: generateId(),
                fingerprint,
                message: errorInfo.message,
                count: 0,
                firstSeen: errorInfo.timestamp,
                lastSeen: errorInfo.timestamp,
                errors: []
            };
            this.groups.set(fingerprint, group);
        }
        group.count++;
        group.lastSeen = errorInfo.timestamp;
        group.errors.push(errorInfo);
        // Keep only last 10 errors in each group
        if (group.errors.length > 10) {
            group.errors.shift();
        }
        return group;
    }
    generateFingerprint(errorInfo) {
        // Create a fingerprint based on error characteristics
        const parts = [
            errorInfo.type,
            this.normalizeMessage(errorInfo.message)
        ];
        // Add top stack frame if available
        if (errorInfo.stackFrames && errorInfo.stackFrames.length > 0) {
            const topFrame = errorInfo.stackFrames[0];
            if (topFrame.fileName) {
                parts.push(topFrame.fileName);
                if (topFrame.functionName) {
                    parts.push(topFrame.functionName);
                }
            }
        }
        else if (errorInfo.source) {
            parts.push(errorInfo.source);
        }
        return parts.join('|');
    }
    normalizeMessage(message) {
        // Remove dynamic parts from error messages for better grouping
        return message
            // Remove URLs
            .replace(/https?:\/\/[^\s]+/g, '<URL>')
            // Remove numbers
            .replace(/\b\d+\b/g, '<NUM>')
            // Remove UUIDs
            .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
            // Remove quotes content
            .replace(/"[^"]*"/g, '"<STRING>"')
            .replace(/'[^']*'/g, "'<STRING>'")
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }
    getGroups() {
        return Array.from(this.groups.values())
            .sort((a, b) => b.lastSeen - a.lastSeen);
    }
    getGroup(groupId) {
        for (const group of this.groups.values()) {
            if (group.id === groupId) {
                return group;
            }
        }
        return undefined;
    }
    clearGroups() {
        this.groups.clear();
    }
    getErrorStats() {
        let totalErrors = 0;
        const errorsByType = {};
        const recentErrors = [];
        for (const group of this.groups.values()) {
            totalErrors += group.count;
            for (const error of group.errors) {
                errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
                recentErrors.push(error);
            }
        }
        // Sort by timestamp and take last 10
        recentErrors.sort((a, b) => b.timestamp - a.timestamp);
        return {
            totalErrors,
            totalGroups: this.groups.size,
            errorsByType,
            recentErrors: recentErrors.slice(0, 10)
        };
    }
}

class SourceMapSupport {
    constructor() {
        this.cache = {};
        this.enabled = true;
        this.sourceMapUrlRegex = /\/\/# sourceMappingURL=(.+)$/;
        this.checkSupport();
    }
    checkSupport() {
        // Check if we can fetch source maps
        this.enabled = typeof fetch !== 'undefined' && 'URL' in window;
        return this.enabled;
    }
    async enhanceStackTrace(stack) {
        if (!this.enabled)
            return stack;
        const enhancedStack = [];
        for (const frame of stack) {
            const enhanced = await this.enhanceStackFrame(frame);
            enhancedStack.push(enhanced);
        }
        return enhancedStack;
    }
    async enhanceStackFrame(frame) {
        // Parse the stack frame
        const match = frame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
        if (!match)
            return frame;
        const [, functionName, fileUrl, line, column] = match;
        const lineNumber = parseInt(line, 10);
        const columnNumber = parseInt(column, 10);
        try {
            // Check if this is a local file or has source map
            const sourceMapUrl = await this.findSourceMapUrl(fileUrl);
            if (!sourceMapUrl)
                return frame;
            // Load and parse source map
            const sourceMap = await this.loadSourceMap(fileUrl, sourceMapUrl);
            if (!sourceMap)
                return frame;
            // Get original position
            const originalPosition = this.getOriginalPosition(sourceMap, lineNumber, columnNumber);
            if (originalPosition) {
                const functionPart = functionName ? `${functionName} ` : '';
                return `at ${functionPart}(${originalPosition.source}:${originalPosition.line}:${originalPosition.column})`;
            }
        }
        catch (error) {
            // Failed to enhance, return original frame
            console.debug('Failed to enhance stack frame:', error);
        }
        return frame;
    }
    async findSourceMapUrl(fileUrl) {
        // Check cache first
        if (this.cache[fileUrl]) {
            return this.cache[fileUrl].sourceMapUrl;
        }
        try {
            // For inline source maps or data URLs, skip
            if (fileUrl.startsWith('data:') || fileUrl.includes('blob:')) {
                return null;
            }
            // Try to fetch the file to look for source map comment
            const response = await fetch(fileUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });
            if (!response.ok)
                return null;
            const text = await response.text();
            const lastLines = text.split('\n').slice(-5).join('\n');
            const match = lastLines.match(this.sourceMapUrlRegex);
            if (!match)
                return null;
            const sourceMapUrl = match[1];
            // Handle relative URLs
            if (sourceMapUrl.startsWith('data:')) {
                return sourceMapUrl;
            }
            const absoluteUrl = new URL(sourceMapUrl, fileUrl).href;
            return absoluteUrl;
        }
        catch (error) {
            return null;
        }
    }
    async loadSourceMap(fileUrl, sourceMapUrl) {
        var _a;
        // Check cache
        if ((_a = this.cache[fileUrl]) === null || _a === void 0 ? void 0 : _a.sourceMap) {
            return this.cache[fileUrl].sourceMap;
        }
        try {
            let sourceMapData;
            if (sourceMapUrl.startsWith('data:')) {
                // Inline source map
                const base64 = sourceMapUrl.split(',')[1];
                sourceMapData = atob(base64);
            }
            else {
                // External source map
                const response = await fetch(sourceMapUrl, {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'omit'
                });
                if (!response.ok)
                    return null;
                sourceMapData = await response.text();
            }
            const sourceMap = JSON.parse(sourceMapData);
            // Cache it
            this.cache[fileUrl] = {
                sourceMapUrl,
                sourceMap
            };
            return sourceMap;
        }
        catch (error) {
            return null;
        }
    }
    getOriginalPosition(sourceMap, line, column) {
        // This is a simplified source map lookup
        // In a real implementation, you'd use a proper source map library
        var _a;
        if (!sourceMap.mappings || !sourceMap.sources) {
            return null;
        }
        // For now, return a simple mapping
        // Real implementation would decode VLQ mappings
        return {
            source: sourceMap.sources[0] || 'unknown',
            line: line,
            column: column,
            name: (_a = sourceMap.names) === null || _a === void 0 ? void 0 : _a[0]
        };
    }
    clearCache() {
        this.cache = {};
    }
    setEnabled(enabled) {
        this.enabled = enabled && this.checkSupport();
    }
    isEnabled() {
        return this.enabled;
    }
}

class ErrorMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.originalHandlers = {
            error: null,
            unhandledrejection: null
        };
        this.handleErrorEvent = (event) => {
            this.errorTracker.trackError(event, 'error');
        };
        this.handleRejectionEvent = (event) => {
            this.errorTracker.trackError(event, 'unhandledRejection');
        };
        this.inspector = inspector;
        this.errorTracker = new ErrorTracker(this.handleError.bind(this));
        this.sourceMapSupport = new SourceMapSupport();
    }
    start() {
        if (this.isActive)
            return;
        this.installErrorHandlers();
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        this.uninstallErrorHandlers();
        this.isActive = false;
    }
    installErrorHandlers() {
        // Save original handlers
        this.originalHandlers.error = window.onerror;
        this.originalHandlers.unhandledrejection = window.onunhandledrejection;
        // Install error handler
        window.onerror = (message, source, lineno, colno, error) => {
            const errorEvent = new ErrorEvent('error', {
                message: String(message),
                filename: source,
                lineno,
                colno,
                error
            });
            this.errorTracker.trackError(errorEvent, 'error');
            // Call original handler if exists
            if (this.originalHandlers.error) {
                return this.originalHandlers.error(message, source, lineno, colno, error);
            }
            return true; // Prevent default browser error handling
        };
        // Install unhandled rejection handler
        window.onunhandledrejection = (event) => {
            this.errorTracker.trackError(event, 'unhandledRejection');
            // Call original handler if exists
            if (this.originalHandlers.unhandledrejection) {
                return this.originalHandlers.unhandledrejection(event);
            }
            return true; // Prevent default browser error handling
        };
        // Also use addEventListener for better coverage
        window.addEventListener('error', this.handleErrorEvent);
        window.addEventListener('unhandledrejection', this.handleRejectionEvent);
    }
    uninstallErrorHandlers() {
        // Restore original handlers
        window.onerror = this.originalHandlers.error;
        window.onunhandledrejection = this.originalHandlers.unhandledrejection;
        // Remove event listeners
        window.removeEventListener('error', this.handleErrorEvent);
        window.removeEventListener('unhandledrejection', this.handleRejectionEvent);
    }
    async handleError(errorInfo) {
        var _a, _b;
        // Enhance stack trace with source maps if available
        if (errorInfo.stack && this.sourceMapSupport.isEnabled()) {
            try {
                errorInfo.stack = await this.sourceMapSupport.enhanceStackTrace(errorInfo.stack);
            }
            catch (error) {
                console.debug('Failed to enhance stack trace:', error);
            }
        }
        // Store in circular buffer
        const storage = this.inspector.getStorage('error');
        storage.push(errorInfo);
        // Emit events
        this.inspector.getEvents().emit(errorInfo.type === 'unhandledRejection' ? 'error:uncaught' : 'error:caught', errorInfo);
        // Call error callback
        (_b = (_a = this.inspector.getConfig()).onError) === null || _b === void 0 ? void 0 : _b.call(_a, new Error(errorInfo.message));
        // Log to console in development
        if (this.inspector.getConfig().enabled) {
            console.error('[DevInspector] Error captured:', errorInfo);
        }
    }
    // Public API
    trackError(error) {
        this.errorTracker.trackError(error);
    }
    getErrorGroups() {
        return this.errorTracker.getGroups();
    }
    getErrorStats() {
        return this.errorTracker.getErrorStats();
    }
    clearErrors() {
        this.errorTracker.clearGroups();
        const storage = this.inspector.getStorage('error');
        storage.clear();
    }
    addIgnorePattern(pattern) {
        this.errorTracker.addIgnorePattern(pattern);
    }
    enableSourceMaps(enabled) {
        this.sourceMapSupport.setEnabled(enabled);
    }
}

var errorMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ErrorMonitor: ErrorMonitor
});

class StateMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.inspector = inspector;
    }
    start() {
        if (this.isActive)
            return;
        // TODO: Implement state monitoring
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        // TODO: Implement cleanup
        this.isActive = false;
    }
}

var stateMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    StateMonitor: StateMonitor
});

class DOMMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.inspector = inspector;
    }
    start() {
        if (this.isActive)
            return;
        // TODO: Implement DOM monitoring
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        // TODO: Implement cleanup
        this.isActive = false;
    }
}

var domMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DOMMonitor: DOMMonitor
});

class StorageMonitor {
    constructor(inspector) {
        this.isActive = false;
        this.inspector = inspector;
    }
    start() {
        if (this.isActive)
            return;
        // TODO: Implement storage monitoring
        this.isActive = true;
    }
    stop() {
        if (!this.isActive)
            return;
        // TODO: Implement cleanup
        this.isActive = false;
    }
}

var storageMonitor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    StorageMonitor: StorageMonitor
});

class FloatingWidget {
    constructor(inspector) {
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.errorCount = 0;
        this.inspector = inspector;
        this.element = this.createElement();
        this.setupEventListeners();
        this.updatePosition();
    }
    createElement() {
        const widget = document.createElement('div');
        widget.className = 'devinspector-floating-widget';
        widget.innerHTML = '🔍';
        widget.title = 'DevInspector - Click to toggle, drag to move';
        return widget;
    }
    setupEventListeners() {
        // Click to toggle
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.element.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.inspector.toggle();
            }
        });
        // Drag functionality
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        // Error tracking
        this.inspector.on('error:caught', () => {
            this.errorCount++;
            this.updateAppearance();
        });
        this.inspector.on('error:uncaught', () => {
            this.errorCount++;
            this.updateAppearance();
        });
        // Clear error count when inspector is opened
        this.inspector.on('inspector:show', () => {
            this.errorCount = 0;
            this.updateAppearance();
        });
    }
    handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.element.style.cursor = 'grabbing';
        this.element.style.zIndex = '1000000';
    }
    handleMouseMove(e) {
        if (!this.isDragging)
            return;
        e.preventDefault();
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        // Keep widget within viewport
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;
        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));
        this.element.style.left = `${clampedX}px`;
        this.element.style.top = `${clampedY}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    }
    handleMouseUp() {
        if (!this.isDragging)
            return;
        this.isDragging = false;
        this.element.style.cursor = 'pointer';
        this.element.style.zIndex = '999998';
        // Snap to nearest edge
        this.snapToEdge();
    }
    snapToEdge() {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        // Determine which edge is closest
        const distances = {
            left: centerX,
            right: windowWidth - centerX,
            top: centerY,
            bottom: windowHeight - centerY
        };
        const closestEdge = Object.keys(distances).reduce((a, b) => distances[a] < distances[b] ? a : b);
        // Animate to edge
        const margin = 20;
        switch (closestEdge) {
            case 'left':
                this.element.style.left = `${margin}px`;
                break;
            case 'right':
                this.element.style.left = 'auto';
                this.element.style.right = `${margin}px`;
                break;
            case 'top':
                this.element.style.top = `${margin}px`;
                break;
            case 'bottom':
                this.element.style.top = 'auto';
                this.element.style.bottom = `${margin}px`;
                break;
        }
    }
    updatePosition() {
        const position = this.inspector.getConfig().position;
        const margin = 20;
        // Reset positioning
        this.element.style.top = 'auto';
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
        this.element.style.left = 'auto';
        switch (position) {
            case 'top-left':
                this.element.style.top = `${margin}px`;
                this.element.style.left = `${margin}px`;
                break;
            case 'top-right':
                this.element.style.top = `${margin}px`;
                this.element.style.right = `${margin}px`;
                break;
            case 'bottom-left':
                this.element.style.bottom = `${margin}px`;
                this.element.style.left = `${margin}px`;
                break;
            case 'bottom-right':
            default:
                this.element.style.bottom = `${margin}px`;
                this.element.style.right = `${margin}px`;
                break;
        }
    }
    updateAppearance() {
        if (this.errorCount > 0) {
            this.element.classList.add('has-errors');
            this.element.innerHTML = '⚠️';
            this.element.title = `DevInspector - ${this.errorCount} error${this.errorCount > 1 ? 's' : ''} detected`;
        }
        else {
            this.element.classList.remove('has-errors');
            this.element.innerHTML = '🔍';
            this.element.title = 'DevInspector - Click to toggle, drag to move';
        }
    }
    show() {
        if (!this.element.parentNode) {
            document.body.appendChild(this.element);
        }
        this.element.style.display = 'flex';
    }
    hide() {
        this.element.style.display = 'none';
    }
    destroy() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
    getElement() {
        return this.element;
    }
}

class MainPanel {
    constructor(inspector) {
        this.tabs = new Map();
        this.activeTab = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isResizing = false;
        this.inspector = inspector;
        this.element = this.createElement();
        this.setupEventListeners();
        this.updatePosition();
    }
    createElement() {
        const panel = document.createElement('div');
        panel.className = `devinspector position-${this.inspector.getConfig().position}`;
        panel.style.width = '600px';
        panel.style.height = '400px';
        panel.style.display = 'none';
        // Header
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'devinspector-header';
        this.headerElement.innerHTML = `
      <h3 class="devinspector-title">DevInspector</h3>
      <div class="devinspector-controls">
        <button class="devinspector-control settings" title="Settings">⚙️</button>
        <button class="devinspector-control minimize" title="Minimize">−</button>
        <button class="devinspector-control close" title="Close">×</button>
      </div>
    `;
        // Tabs
        this.tabsElement = document.createElement('div');
        this.tabsElement.className = 'devinspector-tabs';
        // Body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'devinspector-body';
        // Resizer
        const resizer = document.createElement('div');
        resizer.className = 'devinspector-resizer';
        panel.appendChild(this.headerElement);
        panel.appendChild(this.tabsElement);
        panel.appendChild(this.bodyElement);
        panel.appendChild(resizer);
        return panel;
    }
    setupEventListeners() {
        // Header controls
        const controls = this.headerElement.querySelectorAll('.devinspector-control');
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const className = control.className;
                if (className.includes('minimize')) {
                    this.inspector.minimize();
                }
                else if (className.includes('close')) {
                    this.inspector.hide();
                }
                else if (className.includes('settings')) {
                    this.showSettings();
                }
            });
        });
        // Header dragging
        this.headerElement.addEventListener('mousedown', this.handleHeaderMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        // Resizing
        const resizer = this.element.querySelector('.devinspector-resizer');
        resizer.addEventListener('mousedown', this.handleResizerMouseDown.bind(this));
        // Tab clicks
        this.tabsElement.addEventListener('click', (e) => {
            const tab = e.target.closest('.devinspector-tab');
            if (tab) {
                const tabId = tab.dataset.tabId;
                if (tabId) {
                    this.setActiveTab(tabId);
                }
            }
        });
        // Update badge counts periodically
        setInterval(() => this.updateBadges(), 1000);
    }
    handleHeaderMouseDown(e) {
        if (e.target.closest('.devinspector-control'))
            return;
        e.preventDefault();
        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.headerElement.style.cursor = 'grabbing';
        this.element.style.zIndex = '1000000';
    }
    handleResizerMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isResizing = true;
        this.element.style.zIndex = '1000000';
        document.body.style.cursor = 'nw-resize';
    }
    handleMouseMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            // Keep panel within viewport
            const maxX = window.innerWidth - this.element.offsetWidth;
            const maxY = window.innerHeight - this.element.offsetHeight;
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            this.element.style.left = `${clampedX}px`;
            this.element.style.top = `${clampedY}px`;
            this.element.style.right = 'auto';
            this.element.style.bottom = 'auto';
        }
        else if (this.isResizing) {
            e.preventDefault();
            const rect = this.element.getBoundingClientRect();
            const newWidth = e.clientX - rect.left;
            const newHeight = e.clientY - rect.top;
            // Minimum dimensions
            const minWidth = 300;
            const minHeight = 200;
            // Maximum dimensions (viewport size)
            const maxWidth = window.innerWidth - rect.left;
            const maxHeight = window.innerHeight - rect.top;
            const width = Math.max(minWidth, Math.min(newWidth, maxWidth));
            const height = Math.max(minHeight, Math.min(newHeight, maxHeight));
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
        }
    }
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.headerElement.style.cursor = 'move';
            this.element.style.zIndex = '999999';
        }
        if (this.isResizing) {
            this.isResizing = false;
            this.element.style.zIndex = '999999';
            document.body.style.cursor = 'auto';
        }
    }
    updatePosition() {
        const position = this.inspector.getConfig().position;
        // Remove all position classes
        this.element.classList.remove('position-top-left', 'position-top-right', 'position-bottom-left', 'position-bottom-right');
        // Add current position class
        this.element.classList.add(`position-${position}`);
    }
    showSettings() {
        // TODO: Implement settings modal
        console.log('Settings not implemented yet');
    }
    addTab(config) {
        this.tabs.set(config.id, config);
        // Create tab element
        const tab = document.createElement('button');
        tab.className = 'devinspector-tab';
        tab.dataset.tabId = config.id;
        tab.innerHTML = `
      ${config.label}
      ${config.badge ? '<span class="devinspector-tab-badge">0</span>' : ''}
    `;
        this.tabsElement.appendChild(tab);
        // Create panel element
        const panel = document.createElement('div');
        panel.className = 'devinspector-panel';
        panel.dataset.panelId = config.id;
        panel.appendChild(config.content);
        this.bodyElement.appendChild(panel);
        // Set as active if first tab
        if (this.tabs.size === 1) {
            this.setActiveTab(config.id);
        }
        this.updateBadges();
    }
    removeTab(tabId) {
        if (!this.tabs.has(tabId))
            return;
        this.tabs.delete(tabId);
        // Remove tab element
        const tab = this.tabsElement.querySelector(`[data-tab-id="${tabId}"]`);
        if (tab) {
            tab.remove();
        }
        // Remove panel element
        const panel = this.bodyElement.querySelector(`[data-panel-id="${tabId}"]`);
        if (panel) {
            panel.remove();
        }
        // Switch to first available tab if this was active
        if (this.activeTab === tabId) {
            const firstTab = this.tabs.keys().next().value;
            if (firstTab) {
                this.setActiveTab(firstTab);
            }
            else {
                this.activeTab = null;
            }
        }
    }
    setActiveTab(tabId) {
        if (!this.tabs.has(tabId))
            return;
        this.activeTab = tabId;
        // Update tab states
        this.tabsElement.querySelectorAll('.devinspector-tab').forEach(tab => {
            const htmlTab = tab;
            tab.classList.toggle('active', htmlTab.dataset.tabId === tabId);
        });
        // Update panel states
        this.bodyElement.querySelectorAll('.devinspector-panel').forEach(panel => {
            const htmlPanel = panel;
            panel.classList.toggle('active', htmlPanel.dataset.panelId === tabId);
        });
    }
    updateBadges() {
        this.tabs.forEach((config, tabId) => {
            if (config.badge) {
                const count = config.badge();
                const tab = this.tabsElement.querySelector(`[data-tab-id="${tabId}"]`);
                const badge = tab === null || tab === void 0 ? void 0 : tab.querySelector('.devinspector-tab-badge');
                if (badge) {
                    badge.textContent = count.toString();
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            }
        });
    }
    show() {
        if (!this.element.parentNode) {
            document.body.appendChild(this.element);
        }
        this.element.style.display = 'flex';
        this.element.classList.remove('minimized');
    }
    hide() {
        this.element.style.display = 'none';
    }
    minimize() {
        this.element.classList.add('minimized');
    }
    destroy() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
    getElement() {
        return this.element;
    }
    getActiveTab() {
        return this.activeTab;
    }
}

const createStyles = (theme = 'dark') => {
    const colors = theme === 'dark' ? {
        primary: '#1e1e1e',
        secondary: '#2d2d30',
        tertiary: '#3e3e42',
        accent: '#007acc',
        text: '#cccccc',
        textSecondary: '#9d9d9d',
        border: '#3e3e42',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    } : {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        tertiary: '#e0e0e0',
        accent: '#1976d2',
        text: '#333333',
        textSecondary: '#666666',
        border: '#ddd',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    };
    return `
    .devinspector {
      position: fixed;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: ${colors.text};
      background: ${colors.primary};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      min-width: 300px;
      min-height: 200px;
      resize: both;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .devinspector.fullwidth {
      width: calc(100vw - 40px) !important;
      left: 20px !important;
      right: 20px !important;
    }

    .devinspector.bottom-sidebar {
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      top: auto !important;
      width: 100vw !important;
      height: 40vh !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom: none !important;
      resize: vertical;
    }

    .devinspector.bottom-sidebar .devinspector-header {
      border-radius: 0;
    }

    .devinspector * {
      box-sizing: border-box;
    }

    .devinspector.position-top-left {
      top: 20px;
      left: 20px;
    }

    .devinspector.position-top-right {
      top: 20px;
      right: 20px;
    }

    .devinspector.position-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .devinspector.position-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .devinspector.position-bottom-sidebar {
      bottom: 0;
      left: 0;
      right: 0;
      width: 100vw;
      height: 40vh;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .devinspector.minimized {
      width: 50px !important;
      height: 50px !important;
      overflow: hidden;
      border-radius: 50%;
      cursor: pointer;
    }

    .devinspector.minimized .devinspector-header {
      height: 100%;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
    }

    .devinspector.minimized .devinspector-body,
    .devinspector.minimized .devinspector-tabs,
    .devinspector.minimized .devinspector-title {
      display: none !important;
    }

    .devinspector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      cursor: move;
      user-select: none;
      border-radius: 8px 8px 0 0;
    }

    .devinspector-title {
      font-weight: 600;
      color: ${colors.text};
      margin: 0;
      font-size: 13px;
    }

    .devinspector-controls {
      display: flex;
      gap: 4px;
    }

    .devinspector-control {
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .devinspector-control:hover {
      opacity: 0.8;
      transform: scale(1.1);
    }

    .devinspector-control.minimize {
      background: ${colors.warning};
      color: white;
    }

    .devinspector-control.close {
      background: ${colors.error};
      color: white;
    }

    .devinspector-control.settings {
      background: ${colors.tertiary};
      color: ${colors.text};
    }

    .devinspector-tabs {
      display: flex;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      overflow-x: auto;
    }

    .devinspector-tab {
      padding: 8px 16px;
      background: none;
      border: none;
      color: ${colors.textSecondary};
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .devinspector-tab:hover {
      color: ${colors.text};
      background: ${colors.tertiary};
    }

    .devinspector-tab.active {
      color: ${colors.accent};
      border-bottom-color: ${colors.accent};
      background: ${colors.primary};
    }

    .devinspector-tab-badge {
      display: inline-block;
      background: ${colors.error};
      color: white;
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 10px;
      margin-left: 6px;
      min-width: 16px;
      text-align: center;
    }

    .devinspector-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .devinspector-panel {
      flex: 1;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .devinspector-panel.active {
      display: flex;
    }

    .devinspector-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      flex-wrap: wrap;
    }

    .devinspector-search {
      flex: 1;
      min-width: 200px;
      padding: 4px 8px;
      border: 1px solid ${colors.border};
      border-radius: 4px;
      background: ${colors.primary};
      color: ${colors.text};
      font-family: inherit;
      font-size: 11px;
    }

    .devinspector-search::placeholder {
      color: ${colors.textSecondary};
    }

    .devinspector-button {
      padding: 4px 8px;
      border: 1px solid ${colors.border};
      border-radius: 4px;
      background: ${colors.tertiary};
      color: ${colors.text};
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      transition: all 0.2s ease;
    }

    .devinspector-button:hover {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-button.active {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-content {
      flex: 1;
      overflow: auto;
      padding: 8px;
    }

    .devinspector-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .devinspector-list-item {
      padding: 8px 12px;
      border-bottom: 1px solid ${colors.border};
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .devinspector-list-item:hover {
      background: ${colors.secondary};
    }

    .devinspector-list-item.selected {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-timestamp {
      color: ${colors.textSecondary};
      font-size: 10px;
    }

    .devinspector-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .devinspector-status.success {
      background: ${colors.success};
      color: white;
    }

    .devinspector-status.error {
      background: ${colors.error};
      color: white;
    }

    .devinspector-status.warning {
      background: ${colors.warning};
      color: white;
    }

    .devinspector-status.info {
      background: ${colors.info};
      color: white;
    }

    .devinspector-json {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .devinspector-json .json-key {
      color: ${theme === 'dark' ? '#9cdcfe' : '#0451a5'};
    }

    .devinspector-json .json-string {
      color: ${theme === 'dark' ? '#ce9178' : '#a31515'};
    }

    .devinspector-json .json-number {
      color: ${theme === 'dark' ? '#b5cea8' : '#09885a'};
    }

    .devinspector-json .json-boolean {
      color: ${theme === 'dark' ? '#569cd6' : '#0000ff'};
    }

    .devinspector-json .json-null {
      color: ${theme === 'dark' ? '#569cd6' : '#0000ff'};
    }

    .devinspector-console-entry {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid ${colors.border};
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      line-height: 1.4;
    }

    .devinspector-console-entry.log {
      color: ${colors.text};
    }

    .devinspector-console-entry.info {
      color: ${colors.info};
    }

    .devinspector-console-entry.warn {
      color: ${colors.warning};
    }

    .devinspector-console-entry.error {
      color: ${colors.error};
    }

    .devinspector-console-entry.debug {
      color: ${colors.textSecondary};
    }

    .devinspector-console-level {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      min-width: 40px;
    }

    .devinspector-chart {
      height: 100px;
      background: ${colors.secondary};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      margin: 8px 0;
      position: relative;
    }

    .devinspector-metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: ${colors.secondary};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      margin: 4px 0;
    }

    .devinspector-metric-label {
      font-weight: 500;
      color: ${colors.text};
    }

    .devinspector-metric-value {
      font-weight: bold;
      color: ${colors.accent};
    }

    .devinspector-error-group {
      border-left: 4px solid ${colors.error};
      padding-left: 8px;
      margin: 8px 0;
    }

    .devinspector-error-message {
      font-weight: bold;
      color: ${colors.error};
      margin-bottom: 4px;
    }

    .devinspector-error-stack {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 10px;
      color: ${colors.textSecondary};
      background: ${colors.secondary};
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre;
    }

    .devinspector-resizer {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: nw-resize;
      background: linear-gradient(
        -45deg,
        transparent 0%,
        transparent 40%,
        ${colors.border} 40%,
        ${colors.border} 60%,
        transparent 60%,
        transparent 100%
      );
    }

    .devinspector-floating-widget {
      position: fixed;
      width: 60px;
      height: 60px;
      background: ${colors.accent};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: all 0.3s ease;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .devinspector-floating-widget:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .devinspector-floating-widget.has-errors {
      background: ${colors.error};
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    /* Scrollbar styles */
    .devinspector *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .devinspector *::-webkit-scrollbar-track {
      background: ${colors.secondary};
    }

    .devinspector *::-webkit-scrollbar-thumb {
      background: ${colors.tertiary};
      border-radius: 4px;
    }

    .devinspector *::-webkit-scrollbar-thumb:hover {
      background: ${colors.accent};
    }
  `;
};

class DevInspectorUI {
    constructor(inspector) {
        this.styleElement = null;
        this.isVisible = false;
        this.isMinimized = false;
        this.inspector = inspector;
        this.floatingWidget = new FloatingWidget(inspector);
        this.mainPanel = new MainPanel(inspector);
    }
    async init() {
        this.injectStyles();
        this.setupTabs();
        this.setupEventListeners();
        this.floatingWidget.show();
    }
    injectStyles() {
        this.styleElement = document.createElement('style');
        const theme = this.inspector.getConfig().theme;
        const resolvedTheme = theme === 'auto' ?
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
            theme;
        this.styleElement.textContent = createStyles(resolvedTheme);
        document.head.appendChild(this.styleElement);
    }
    setupTabs() {
        // Network tab
        const networkTab = {
            id: 'network',
            label: 'Network',
            badge: () => this.inspector.getStorage('network').getSize(),
            content: this.createNetworkPanel()
        };
        // Console tab
        const consoleTab = {
            id: 'console',
            label: 'Console',
            badge: () => this.inspector.getStorage('console').getSize(),
            content: this.createConsolePanel()
        };
        // Performance tab
        const performanceTab = {
            id: 'performance',
            label: 'Performance',
            content: this.createPerformancePanel()
        };
        // Errors tab
        const errorsTab = {
            id: 'errors',
            label: 'Errors',
            badge: () => this.inspector.getStorage('error').getSize(),
            content: this.createErrorsPanel()
        };
        this.mainPanel.addTab(networkTab);
        this.mainPanel.addTab(consoleTab);
        this.mainPanel.addTab(performanceTab);
        this.mainPanel.addTab(errorsTab);
    }
    createNetworkPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
      <div class="devinspector-toolbar">
        <input type="text" class="devinspector-search" placeholder="Filter requests...">
        <button class="devinspector-button">Clear</button>
        <button class="devinspector-button">Export</button>
      </div>
      <div class="devinspector-content">
        <div class="devinspector-network-list">
          <p style="text-align: center; color: #666; margin-top: 40px;">
            Network requests will appear here...
          </p>
        </div>
      </div>
    `;
        // Setup network event listeners
        this.inspector.on('network:request', (request) => {
            this.addNetworkEntry(panel, request);
        });
        this.inspector.on('network:response', (response) => {
            this.updateNetworkEntry(panel, response);
        });
        return panel;
    }
    createConsolePanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
      <div class="devinspector-toolbar">
        <input type="text" class="devinspector-search" placeholder="Filter logs...">
        <button class="devinspector-button">Clear</button>
        <button class="devinspector-button">Export</button>
      </div>
      <div class="devinspector-content">
        <div class="devinspector-console-list">
          <p style="text-align: center; color: #666; margin-top: 40px;">
            Console logs will appear here...
          </p>
        </div>
      </div>
    `;
        // Setup console event listeners
        this.inspector.on('console:log', (entry) => {
            this.addConsoleEntry(panel, entry);
        });
        return panel;
    }
    createPerformancePanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
      <div class="devinspector-content">
        <div class="devinspector-metrics">
          <div class="devinspector-metric">
            <span class="devinspector-metric-label">FPS</span>
            <span class="devinspector-metric-value" id="fps-value">--</span>
          </div>
          <div class="devinspector-metric">
            <span class="devinspector-metric-label">Memory</span>
            <span class="devinspector-metric-value" id="memory-value">--</span>
          </div>
          <div class="devinspector-chart" id="fps-chart"></div>
          <div class="devinspector-chart" id="memory-chart"></div>
        </div>
      </div>
    `;
        // Setup performance event listeners
        this.inspector.on('performance:data', (data) => {
            this.updatePerformanceMetrics(panel, data);
        });
        return panel;
    }
    createErrorsPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `
      <div class="devinspector-toolbar">
        <button class="devinspector-button">Clear All</button>
        <button class="devinspector-button">Export</button>
      </div>
      <div class="devinspector-content">
        <div class="devinspector-errors-list">
          <p style="text-align: center; color: #666; margin-top: 40px;">
            No errors detected
          </p>
        </div>
      </div>
    `;
        // Setup error event listeners
        this.inspector.on('error:caught', (error) => {
            this.addErrorEntry(panel, error);
        });
        this.inspector.on('error:uncaught', (error) => {
            this.addErrorEntry(panel, error);
        });
        return panel;
    }
    setupEventListeners() {
        // Clear console when clear button clicked
        this.inspector.on('console:clear', () => {
            const consoleList = document.querySelector('.devinspector-console-list');
            if (consoleList) {
                consoleList.innerHTML = `
          <p style="text-align: center; color: #666; margin-top: 40px;">
            Console cleared
          </p>
        `;
            }
        });
    }
    addNetworkEntry(panel, request) {
        const list = panel.querySelector('.devinspector-network-list');
        if (!list)
            return;
        // Remove placeholder if exists
        const placeholder = list.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }
        const entry = document.createElement('div');
        entry.className = 'devinspector-list-item';
        entry.dataset.requestId = request.id;
        entry.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${request.method} ${request.url}</span>
        <span class="devinspector-status info">Pending</span>
      </div>
      <div class="devinspector-timestamp">${new Date(request.timestamp).toLocaleTimeString()}</div>
    `;
        list.appendChild(entry);
    }
    updateNetworkEntry(panel, response) {
        const entry = panel.querySelector(`[data-request-id="${response.id}"]`);
        if (!entry)
            return;
        const status = entry.querySelector('.devinspector-status');
        if (status) {
            status.textContent = `${response.status}`;
            status.className = `devinspector-status ${response.status >= 400 ? 'error' : 'success'}`;
        }
    }
    addConsoleEntry(panel, entry) {
        const list = panel.querySelector('.devinspector-console-list');
        if (!list)
            return;
        // Remove placeholder if exists
        const placeholder = list.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }
        const consoleEntry = document.createElement('div');
        consoleEntry.className = `devinspector-console-entry ${entry.level}`;
        consoleEntry.innerHTML = `
      <span class="devinspector-console-level">${entry.level}</span>
      <span class="devinspector-console-content">${this.formatConsoleArgs(entry.formattedArgs)}</span>
      <span class="devinspector-timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</span>
    `;
        list.appendChild(consoleEntry);
        list.scrollTop = list.scrollHeight;
    }
    addErrorEntry(panel, error) {
        const list = panel.querySelector('.devinspector-errors-list');
        if (!list)
            return;
        // Remove placeholder if exists
        const placeholder = list.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }
        const errorEntry = document.createElement('div');
        errorEntry.className = 'devinspector-error-group';
        errorEntry.innerHTML = `
      <div class="devinspector-error-message">${error.message}</div>
      <div class="devinspector-timestamp">${new Date(error.timestamp).toLocaleTimeString()}</div>
      ${error.stack ? `<pre class="devinspector-error-stack">${error.stack.join('\n')}</pre>` : ''}
    `;
        list.appendChild(errorEntry);
    }
    updatePerformanceMetrics(panel, data) {
        const fpsValue = panel.querySelector('#fps-value');
        const memoryValue = panel.querySelector('#memory-value');
        if (fpsValue && data.fps) {
            fpsValue.textContent = `${data.fps.fps} FPS`;
        }
        if (memoryValue && data.memory) {
            const memoryMB = Math.round(data.memory.usedJSHeapSize / 1024 / 1024);
            memoryValue.textContent = `${memoryMB} MB`;
        }
    }
    formatConsoleArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'string') {
                return arg;
            }
            else if (arg && typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            else {
                return String(arg);
            }
        }).join(' ');
    }
    show() {
        this.mainPanel.show();
        this.isVisible = true;
        this.isMinimized = false;
    }
    hide() {
        this.mainPanel.hide();
        this.isVisible = false;
    }
    minimize() {
        this.mainPanel.minimize();
        this.isMinimized = true;
    }
    destroy() {
        this.floatingWidget.destroy();
        this.mainPanel.destroy();
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
    getElement() {
        return this.mainPanel.getElement();
    }
}

var inspectorUi = /*#__PURE__*/Object.freeze({
    __proto__: null,
    DevInspectorUI: DevInspectorUI
});

export { BasePlugin, CircularStorage, EnhancedDevInspector as DevInspector, EnhancedDevInspector, EventEmitter, IndexedStorage, DevInspector as OriginalDevInspector, SimpleDevInspector, EnhancedDevInspector as default };
//# sourceMappingURL=devinspector.esm.js.map
