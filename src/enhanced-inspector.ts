/**
 * Enhanced DevInspector with Beautiful Modern UI
 * @version 1.1.0
 */

// Core Data Structures
interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number | string;
  statusText?: string;
  timestamp: Date;
  duration?: number;
  size?: number;
  headers?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  body?: any;
  error?: string;
}

interface ConsoleLog {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  stack?: string;
  args?: any[];
}

interface PerformanceMetrics {
  fps: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  timing?: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  };
}

interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: Date;
  stack?: string;
}

interface Filters {
  network: {
    method: string;
    status: string;
    search: string;
  };
  console: {
    level: string;
    search: string;
  };
}

export class EnhancedDevInspector {
  private data: {
    network: NetworkRequest[];
    console: ConsoleLog[];
    performance: PerformanceMetrics;
    errors: ErrorInfo[];
  };
  
  private subscribers = new Set<(event: string, data: any) => void>();
  private isRecording = true;
  private filters: Filters;
  private widget: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private isMinimized = false;
  private activeTab = 'network';
  private selectedRequest: NetworkRequest | null = null;
  
  constructor() {
    this.data = {
      network: [],
      console: [],
      performance: { fps: 0 },
      errors: []
    };
    
    this.filters = {
      network: { method: 'all', status: 'all', search: '' },
      console: { level: 'all', search: '' }
    };
    
    this.init();
  }

  private init() {
    this.createFloatingButton();
    this.createMainPanel();
    this.setupInterceptors();
    this.setupPerformanceMonitoring();
    this.setupEventListeners();
  }

  private createFloatingButton() {
    this.widget = document.createElement('div');
    this.widget.className = 'devinspector-widget';
    this.widget.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    `;
    
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
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(1);
    `;
    
    this.widget.addEventListener('mouseenter', () => {
      this.widget!.style.transform = 'scale(1.1)';
      this.widget!.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
    });
    
    this.widget.addEventListener('mouseleave', () => {
      this.widget!.style.transform = 'scale(1)';
      this.widget!.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
    });
    
    this.widget.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.widget);
  }

  private createMainPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'devinspector-panel';
    
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
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    this.renderPanel();
    document.body.appendChild(this.panel);
  }

  private renderPanel() {
    if (!this.panel) return;
    
    this.panel.innerHTML = `
      <div class="devinspector-header" style="
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
            ${this.isRecording ? 'animation: pulse 2s infinite;' : ''}
          "></div>
          <span style="font-weight: 600; font-size: 14px;">DevInspector</span>
          <span style="
            font-size: 11px;
            color: #6b7280;
            background: #374151;
            padding: 2px 6px;
            border-radius: 4px;
          ">v1.1.0</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="minimize-btn" style="
            padding: 6px;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
          " title="Minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <button class="close-btn" style="
            padding: 6px;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
          " title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      ${this.isMinimized ? '' : `
        <div class="devinspector-tabs" style="
          display: flex;
          background: #262626;
          border-bottom: 1px solid #333;
          overflow-x: auto;
        ">
          ${this.renderTabs()}
        </div>

        <div class="devinspector-content" style="
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        ">
          ${this.renderTabContent()}
        </div>
      `}
    `;
    
    this.attachPanelEventListeners();
  }

  private renderTabs() {
    const tabs = [
      { id: 'network', label: 'Network', icon: this.getIcon('globe'), count: this.data.network.length },
      { id: 'console', label: 'Console', icon: this.getIcon('terminal'), count: this.data.console.length },
      { id: 'performance', label: 'Performance', icon: this.getIcon('activity') },
      { id: 'errors', label: 'Errors', icon: this.getIcon('alert'), count: this.data.errors.length }
    ];
    
    return tabs.map(tab => `
      <button 
        data-tab="${tab.id}"
        class="tab-btn ${this.activeTab === tab.id ? 'active' : ''}"
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          background: ${this.activeTab === tab.id ? '#1a1a1a' : 'transparent'};
          border: none;
          color: ${this.activeTab === tab.id ? '#3b82f6' : '#9ca3af'};
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 2px solid ${this.activeTab === tab.id ? '#3b82f6' : 'transparent'};
          transition: all 0.2s;
          white-space: nowrap;
        "
      >
        ${tab.icon}
        ${tab.label}
        ${tab.count !== undefined ? `
          <span style="
            background: ${this.activeTab === tab.id ? '#3b82f6' : '#374151'};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
            min-width: 18px;
            text-align: center;
          ">${tab.count}</span>
        ` : ''}
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
    const requests = this.data.network;
    
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          background: #1e1e1e;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="clear-network-btn" style="
              padding: 6px 12px;
              background: #374151;
              border: none;
              color: #d1d5db;
              cursor: pointer;
              border-radius: 6px;
              font-size: 12px;
              transition: all 0.2s;
            " title="Clear">
              ${this.getIcon('trash')} Clear
            </button>
            <button class="toggle-recording-btn" style="
              padding: 6px 12px;
              background: ${this.isRecording ? '#ef4444' : '#22c55e'};
              border: none;
              color: white;
              cursor: pointer;
              border-radius: 6px;
              font-size: 12px;
              transition: all 0.2s;
            ">
              ${this.isRecording ? this.getIcon('pause') + ' Pause' : this.getIcon('play') + ' Resume'}
            </button>
          </div>
          <div style="
            font-size: 12px;
            color: #6b7280;
            background: #374151;
            padding: 4px 8px;
            border-radius: 4px;
          ">
            ${requests.length} requests
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto;">
          ${requests.length === 0 ? `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              flex-direction: column;
              color: #6b7280;
            ">
              ${this.getIcon('globe', 48)}
              <p style="margin: 16px 0 0 0;">No network activity recorded</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column;">
              ${requests.map(req => this.renderNetworkRequest(req)).join('')}
            </div>
          `}
        </div>
        
        ${this.selectedRequest ? this.renderRequestDetails() : ''}
      </div>
    `;
  }

  private renderNetworkRequest(req: NetworkRequest) {
    const statusColor = this.getStatusColor(req.status);
    const methodColor = this.getMethodColor(req.method);
    
    return `
      <div 
        class="network-request" 
        data-request-id="${req.id}"
        style="
          padding: 12px 16px;
          border-bottom: 1px solid #2a2a2a;
          cursor: pointer;
          transition: all 0.2s;
          ${this.selectedRequest?.id === req.id ? 'background: #1e3a8a;' : ''}
        "
      >
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              background: ${methodColor};
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              min-width: 45px;
              text-align: center;
            ">${req.method}</span>
            <span style="color: ${statusColor}; font-weight: 600;">
              ${req.status === 'pending' ? '...' : req.status}
            </span>
            <span style="color: #6b7280; font-size: 12px;">
              ${req.duration ? `${req.duration}ms` : '-'}
            </span>
          </div>
          <span style="color: #6b7280; font-size: 11px;">
            ${req.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div style="
          color: #d1d5db;
          font-size: 12px;
          word-break: break-all;
          opacity: 0.9;
        ">
          ${req.url}
        </div>
      </div>
    `;
  }

  private renderConsoleTab() {
    const logs = this.data.console;
    
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          background: #1e1e1e;
        ">
          <button class="clear-console-btn" style="
            padding: 6px 12px;
            background: #374151;
            border: none;
            color: #d1d5db;
            cursor: pointer;
            border-radius: 6px;
            font-size: 12px;
            transition: all 0.2s;
          ">
            ${this.getIcon('trash')} Clear
          </button>
          <div style="
            font-size: 12px;
            color: #6b7280;
            background: #374151;
            padding: 4px 8px;
            border-radius: 4px;
          ">
            ${logs.length} logs
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto; font-family: 'SF Mono', Monaco, monospace;">
          ${logs.length === 0 ? `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              flex-direction: column;
              color: #6b7280;
            ">
              ${this.getIcon('terminal', 48)}
              <p style="margin: 16px 0 0 0;">No console logs recorded</p>
            </div>
          ` : `
            ${logs.map(log => this.renderConsoleLog(log)).join('')}
          `}
        </div>
      </div>
    `;
  }

  private renderConsoleLog(log: ConsoleLog) {
    const levelColor = this.getConsoleLevelColor(log.level);
    
    return `
      <div style="
        padding: 8px 16px;
        border-bottom: 1px solid #2a2a2a;
        font-size: 12px;
      ">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="
            color: ${levelColor};
            font-weight: 600;
            text-transform: uppercase;
            min-width: 45px;
            font-size: 10px;
          ">[${log.level}]</span>
          <span style="color: #6b7280; font-size: 11px; min-width: 70px;">
            ${log.timestamp.toLocaleTimeString()}
          </span>
          <pre style="
            margin: 0;
            color: ${levelColor};
            white-space: pre-wrap;
            word-break: break-word;
            flex: 1;
            font-family: inherit;
          ">${log.message}</pre>
        </div>
      </div>
    `;
  }

  private renderPerformanceTab() {
    const { fps, memory } = this.data.performance;
    
    return `
      <div style="padding: 20px; height: 100%; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              ${this.getIcon('activity', 20)}
              <span style="font-weight: 600;">FPS</span>
            </div>
            <div style="font-size: 32px; font-weight: 700; color: #60a5fa;">${fps}</div>
            <div style="font-size: 12px; color: #bfdbfe; margin-top: 4px;">frames per second</div>
          </div>
          
          ${memory ? `
            <div style="
              background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            ">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
                ${this.getIcon('database', 20)}
                <span style="font-weight: 600;">Memory</span>
              </div>
              <div style="font-size: 32px; font-weight: 700; color: #4ade80;">${memory.used} MB</div>
              <div style="font-size: 12px; color: #bbf7d0; margin-top: 4px;">
                ${Math.round((memory.used / memory.limit) * 100)}% of ${memory.limit} MB
              </div>
            </div>
          ` : ''}
        </div>
        
        <div style="
          background: #262626;
          border-radius: 12px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Performance Metrics</h4>
          <div style="display: grid; gap: 12px;">
            ${this.renderPerformanceMetric('Page Load Time', `${this.getPageLoadTime()}ms`)}
            ${this.renderPerformanceMetric('DOM Content Loaded', `${this.getDOMContentLoadedTime()}ms`)}
            ${this.renderPerformanceMetric('First Paint', `${this.getFirstPaintTime()}ms`)}
          </div>
        </div>
      </div>
    `;
  }

  private renderPerformanceMetric(label: string, value: string) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
        <span style="color: #9ca3af;">${label}</span>
        <span style="color: #e5e7eb; font-weight: 600;">${value}</span>
      </div>
    `;
  }

  private renderErrorsTab() {
    const errors = this.data.errors;
    
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          background: #1e1e1e;
        ">
          <button class="clear-errors-btn" style="
            padding: 6px 12px;
            background: #374151;
            border: none;
            color: #d1d5db;
            cursor: pointer;
            border-radius: 6px;
            font-size: 12px;
            transition: all 0.2s;
          ">
            ${this.getIcon('trash')} Clear
          </button>
          <div style="
            font-size: 12px;
            color: #6b7280;
            background: #374151;
            padding: 4px 8px;
            border-radius: 4px;
          ">
            ${errors.length} errors
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto;">
          ${errors.length === 0 ? `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              flex-direction: column;
              color: #6b7280;
            ">
              ${this.getIcon('check-circle', 48)}
              <p style="margin: 16px 0 0 0;">No errors recorded</p>
            </div>
          ` : `
            ${errors.map(error => this.renderError(error)).join('')}
          `}
        </div>
      </div>
    `;
  }

  private renderError(error: ErrorInfo) {
    return `
      <div style="
        padding: 16px;
        border-bottom: 1px solid #2a2a2a;
      ">
        <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
          <span style="
            color: #ef4444;
            font-weight: 600;
            background: rgba(239, 68, 68, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          ">${error.type}</span>
          <span style="color: #6b7280; font-size: 11px;">
            ${error.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div style="color: #fca5a5; margin-bottom: 8px; font-size: 13px;">${error.message}</div>
        ${error.source ? `
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 8px;">
            ${error.source}:${error.line}:${error.column}
          </div>
        ` : ''}
        ${error.stack ? `
          <pre style="
            background: #0f0f0f;
            padding: 12px;
            border-radius: 6px;
            font-size: 11px;
            color: #9ca3af;
            overflow-x: auto;
            margin: 8px 0 0 0;
            white-space: pre-wrap;
          ">${error.stack}</pre>
        ` : ''}
      </div>
    `;
  }

  private renderRequestDetails() {
    if (!this.selectedRequest) return '';
    
    return `
      <div style="
        border-top: 1px solid #333;
        height: 200px;
        overflow-y: auto;
        background: #1e1e1e;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
        ">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600;">Request Details</h4>
          <button class="close-details-btn" style="
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
          ">
            ${this.getIcon('x', 16)}
          </button>
        </div>
        <div style="padding: 16px; font-size: 12px; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">URL:</span>
            <span style="color: #e5e7eb; margin-left: 8px; word-break: break-all;">${this.selectedRequest.url}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Method:</span>
            <span style="color: #e5e7eb; margin-left: 8px;">${this.selectedRequest.method}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Status:</span>
            <span style="color: ${this.getStatusColor(this.selectedRequest.status)}; margin-left: 8px;">${this.selectedRequest.status}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Duration:</span>
            <span style="color: #e5e7eb; margin-left: 8px;">${this.selectedRequest.duration || '-'}ms</span>
          </div>
          ${this.selectedRequest.headers ? `
            <div>
              <span style="color: #6b7280;">Request Headers:</span>
              <pre style="
                background: #0f0f0f;
                padding: 8px;
                border-radius: 4px;
                margin: 8px 0 0 0;
                color: #d1d5db;
                font-size: 11px;
                overflow: auto;
              ">${JSON.stringify(this.selectedRequest.headers, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Helper methods for styling
  private getStatusColor(status: number | string): string {
    if (status === 'error' || status === 'pending') return '#6b7280';
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    if (statusNum >= 200 && statusNum < 300) return '#22c55e';
    if (statusNum >= 300 && statusNum < 400) return '#f59e0b';
    if (statusNum >= 400) return '#ef4444';
    return '#6b7280';
  }

  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '#22c55e',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      DELETE: '#ef4444',
      PATCH: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  }

  private getConsoleLevelColor(level: string): string {
    const colors: Record<string, string> = {
      log: '#d1d5db',
      info: '#60a5fa',
      warn: '#fbbf24',
      error: '#f87171',
      debug: '#a78bfa'
    };
    return colors[level] || '#d1d5db';
  }

  private getIcon(name: string, size: number = 16): string {
    const icons: Record<string, string> = {
      globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      terminal: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
      activity: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>`,
      alert: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      trash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6v14a2 2 0 0 1-2,2H7a2 2 0 0 1-2-2V6m3,0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2,2v2"/></svg>`,
      pause: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
      play: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,3 19,12 5,21"/></svg>`,
      x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      database: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="m21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
      'check-circle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`
    };
    return icons[name] || '';
  }

  // Event listeners
  private attachPanelEventListeners() {
    if (!this.panel) return;

    // Header buttons
    const minimizeBtn = this.panel.querySelector('.minimize-btn');
    const closeBtn = this.panel.querySelector('.close-btn');
    
    minimizeBtn?.addEventListener('click', () => this.minimize());
    closeBtn?.addEventListener('click', () => this.hide());

    // Tab buttons
    this.panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabId = target.getAttribute('data-tab');
        if (tabId) {
          this.activeTab = tabId;
          this.renderPanel();
        }
      });
    });

    // Action buttons
    const clearNetworkBtn = this.panel.querySelector('.clear-network-btn');
    const toggleRecordingBtn = this.panel.querySelector('.toggle-recording-btn');
    const clearConsoleBtn = this.panel.querySelector('.clear-console-btn');
    const clearErrorsBtn = this.panel.querySelector('.clear-errors-btn');
    const closeDetailsBtn = this.panel.querySelector('.close-details-btn');

    clearNetworkBtn?.addEventListener('click', () => this.clear('network'));
    toggleRecordingBtn?.addEventListener('click', () => this.toggleRecording());
    clearConsoleBtn?.addEventListener('click', () => this.clear('console'));
    clearErrorsBtn?.addEventListener('click', () => this.clear('errors'));
    closeDetailsBtn?.addEventListener('click', () => {
      this.selectedRequest = null;
      this.renderPanel();
    });

    // Network request selection
    this.panel.querySelectorAll('.network-request').forEach(req => {
      req.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const requestId = target.getAttribute('data-request-id');
        this.selectedRequest = this.data.network.find(r => r.id === requestId) || null;
        this.renderPanel();
      });
    });
  }

  private setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });

    // CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .devinspector-panel .tab-btn:hover {
        background: #2a2a2a !important;
        color: #e5e7eb !important;
      }
      
      .devinspector-panel .network-request:hover {
        background: #2a2a2a !important;
      }
      
      .devinspector-panel button:hover {
        background: #4b5563 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Performance monitoring helpers
  private getPageLoadTime(): number {
    return Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart);
  }

  private getDOMContentLoadedTime(): number {
    return Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);
  }

  private getFirstPaintTime(): string {
    const paintEntry = performance.getEntriesByType('paint').find(p => p.name === 'first-paint');
    return paintEntry ? paintEntry.startTime.toFixed(0) : '-';
  }

  // Core functionality methods
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
    this.emit('update', { type });
  }

  public toggleRecording() {
    this.isRecording = !this.isRecording;
    this.renderPanel();
    this.emit('recording', this.isRecording);
  }

  private emit(event: string, data: any) {
    this.subscribers.forEach(callback => callback(event, data));
  }

  // Network monitoring setup
  private setupInterceptors() {
    this.interceptFetch();
    this.interceptXHR();
    this.interceptConsole();
    this.interceptErrors();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (!this.isRecording) return originalFetch(...args);

      const requestId = Math.random().toString(36).substr(2, 9);
      const startTime = performance.now();
      const [url, options = {}] = args;

      const request: NetworkRequest = {
        id: requestId,
        url: typeof url === 'string' ? url : url.toString(),
        method: options.method || 'GET',
        status: 'pending',
        timestamp: new Date(),
        headers: options.headers as Record<string, string> || {}
      };

      this.data.network.unshift(request);
      this.renderPanel();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        const updatedRequest: NetworkRequest = {
          ...request,
          status: response.status,
          statusText: response.statusText,
          duration: Math.round(endTime - startTime),
          size: parseInt(response.headers.get('content-length') || '0'),
          responseHeaders: Object.fromEntries(response.headers.entries())
        };

        const index = this.data.network.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.data.network[index] = updatedRequest;
          this.renderPanel();
        }

        return response;
      } catch (error: any) {
        const endTime = performance.now();
        const updatedRequest: NetworkRequest = {
          ...request,
          status: 'error',
          error: error.message,
          duration: Math.round(endTime - startTime)
        };

        const index = this.data.network.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.data.network[index] = updatedRequest;
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
                statusText: xhr.statusText,
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
    const levels = ['log', 'warn', 'error', 'info', 'debug'] as const;
    
    levels.forEach(level => {
      const original = console[level] as (...args: any[]) => void;
      console[level] = (...args: any[]) => {
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
            timestamp: new Date(),
            stack: new Error().stack,
            args
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
        source: event.filename,
        line: event.lineno,
        column: event.colno,
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
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || String(event.reason),
        timestamp: new Date(),
        stack: event.reason?.stack
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

        // Memory monitoring (Chrome only)
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

  public destroy() {
    if (this.widget && this.widget.parentNode) {
      this.widget.parentNode.removeChild(this.widget);
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.subscribers.clear();
  }
}

// Auto-initialize if not in Node.js environment
if (typeof window !== 'undefined') {
  (window as any).EnhancedDevInspector = EnhancedDevInspector;
}

export default EnhancedDevInspector;