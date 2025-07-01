/**
 * Enhanced DevInspector - Beautiful Modern UI (Simplified for Build)
 * @version 1.1.0
 */

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number | string;
  timestamp: Date;
  duration?: number;
  headers?: any;
  error?: string;
}

interface ConsoleLog {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
}

interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  stack?: string;
}

export class EnhancedDevInspector {
  private data = {
    network: [] as NetworkRequest[],
    console: [] as ConsoleLog[],
    performance: { fps: 0, memory: null },
    errors: [] as ErrorInfo[]
  };
  
  private isRecording = true;
  private widget: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private isMinimized = false;
  private activeTab = 'network';
  private selectedRequest: NetworkRequest | null = null;
  
  constructor() {
    this.init();
  }

  private init() {
    this.createFloatingButton();
    this.createMainPanel();
    this.setupInterceptors();
    this.setupEventListeners();
  }

  private createFloatingButton() {
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
      this.widget!.style.transform = 'scale(1.1)';
    });
    this.widget.addEventListener('mouseleave', () => {
      this.widget!.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(this.widget);
  }

  private createMainPanel() {
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

  private renderPanel() {
    if (!this.panel) return;
    
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

  private renderTabs() {
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

  private renderTabContent() {
    switch (this.activeTab) {
      case 'network': return this.renderNetworkTab();
      case 'console': return this.renderConsoleTab();
      case 'performance': return this.renderPerformanceTab();
      case 'errors': return this.renderErrorsTab();
      default: return '';
    }
  }

  private renderNetworkTab() {
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

  private renderNetworkRequest(req: NetworkRequest) {
    const statusColor = this.getStatusColor(req.status);
    const methodColor = this.getMethodColor(req.method);
    
    return `
      <div class="network-request" data-id="${req.id}" style="
        padding: 12px 16px; border-bottom: 1px solid #2a2a2a; cursor: pointer;
        ${this.selectedRequest?.id === req.id ? 'background: #1e3a8a;' : ''}
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

  private renderConsoleTab() {
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

  private renderPerformanceTab() {
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

  private renderErrorsTab() {
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

  private renderRequestDetails() {
    if (!this.selectedRequest) return '';
    
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

  private getStatusColor(status: number | string): string {
    if (status === 'error' || status === 'pending') return '#6b7280';
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    if (statusNum >= 200 && statusNum < 300) return '#22c55e';
    if (statusNum >= 300 && statusNum < 400) return '#f59e0b';
    if (statusNum >= 400) return '#ef4444';
    return '#6b7280';
  }

  private getMethodColor(method: string): string {
    const colors: any = {
      GET: '#22c55e',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      DELETE: '#ef4444',
      PATCH: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  }

  private getConsoleLevelColor(level: string): string {
    const colors: any = {
      log: '#d1d5db',
      info: '#60a5fa',
      warn: '#fbbf24',
      error: '#f87171',
      debug: '#a78bfa'
    };
    return colors[level] || '#d1d5db';
  }

  private attachEventListeners() {
    if (!this.panel) return;

    // Header buttons
    const minimizeBtn = this.panel.querySelector('.minimize-btn');
    const closeBtn = this.panel.querySelector('.close-btn');
    
    minimizeBtn?.addEventListener('click', () => this.minimize());
    closeBtn?.addEventListener('click', () => this.hide());

    // Tab buttons
    this.panel.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        this.activeTab = e.target.getAttribute('data-tab');
        this.renderPanel();
      });
    });

    // Action buttons
    this.panel.querySelector('.clear-network')?.addEventListener('click', () => this.clear('network'));
    this.panel.querySelector('.toggle-recording')?.addEventListener('click', () => this.toggleRecording());
    this.panel.querySelector('.clear-console')?.addEventListener('click', () => this.clear('console'));
    this.panel.querySelector('.clear-errors')?.addEventListener('click', () => this.clear('errors'));
    this.panel.querySelector('.close-details')?.addEventListener('click', () => {
      this.selectedRequest = null;
      this.renderPanel();
    });

    // Network request selection
    this.panel.querySelectorAll('.network-request').forEach(req => {
      req.addEventListener('click', (e: any) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.selectedRequest = this.data.network.find(r => r.id === id) || null;
        this.renderPanel();
      });
    });
  }

  private setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private setupInterceptors() {
    this.interceptFetch();
    this.interceptXHR();
    this.interceptConsole();
    this.interceptErrors();
    this.setupPerformanceMonitoring();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!this.isRecording) return originalFetch(input, init);

      const requestId = Math.random().toString(36).substr(2, 9);
      const startTime = performance.now();
      const url = typeof input === 'string' ? input : input.toString();
      const options = init || {};

      const request: NetworkRequest = {
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
      } catch (error: any) {
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

  private interceptXHR() {
    const originalXHR = window.XMLHttpRequest;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    (window as any).XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const requestId = Math.random().toString(36).substr(2, 9);
      let startTime: number;

      const originalOpen = xhr.open;
      const originalSend = xhr.send;

      xhr.open = function(method: string, url: string, ...args: any[]) {
        if (self.isRecording) {
          const request: NetworkRequest = {
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

      xhr.send = function(...args: any[]) {
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

  private interceptConsole() {
    const levels = ['log', 'warn', 'error', 'info', 'debug'];
    
    levels.forEach(level => {
      const original = (console as any)[level];
      (console as any)[level] = (...args: any[]) => {
        if (this.isRecording) {
          const log: ConsoleLog = {
            id: Math.random().toString(36).substr(2, 9),
            level,
            message: args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
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

  private interceptErrors() {
    window.addEventListener('error', (event) => {
      if (!this.isRecording) return;

      const error: ErrorInfo = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'JavaScript Error',
        message: event.message,
        timestamp: new Date(),
        stack: event.error?.stack
      };

      this.data.errors.unshift(error);
      this.renderPanel();
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (!this.isRecording) return;

      const error: ErrorInfo = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Promise Rejection',
        message: event.reason?.message || String(event.reason),
        timestamp: new Date()
      };

      this.data.errors.unshift(error);
      this.renderPanel();
    });
  }

  private setupPerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measurePerformance = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        this.data.performance.fps = Math.round(frames * 1000 / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;

        if ((performance as any).memory) {
          const memory = (performance as any).memory;
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

  public show() {
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.isVisible = true;
      if (this.widget) this.widget.style.display = 'none';
    }
  }

  public hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
      if (this.widget) this.widget.style.display = 'flex';
    }
  }

  public toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  public minimize() {
    this.isMinimized = !this.isMinimized;
    if (this.panel) {
      this.panel.style.height = this.isMinimized ? '60px' : '650px';
      this.renderPanel();
    }
  }

  public clear(type: string) {
    if (type === 'network') {
      this.data.network = [];
      this.selectedRequest = null;
    } else if (type === 'console') {
      this.data.console = [];
    } else if (type === 'errors') {
      this.data.errors = [];
    }
    this.renderPanel();
  }

  public toggleRecording() {
    this.isRecording = !this.isRecording;
    this.renderPanel();
  }

  public destroy() {
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
  (window as any).EnhancedDevInspector = EnhancedDevInspector;
}

export default EnhancedDevInspector;