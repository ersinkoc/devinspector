/**
 * Clean DevInspector - Modern Clean UI
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

export class CleanDevInspector {
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
  private isResizing = false;
  private currentWidth = 420;
  private minWidth = 320;
  private maxWidth = 800;
  
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
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: #0066cc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      color: white;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.2s ease;
    `;
    
    this.widget.addEventListener('click', () => this.toggle());
    this.widget.addEventListener('mouseenter', () => {
      this.widget!.style.transform = 'translateY(-2px)';
    });
    this.widget.addEventListener('mouseleave', () => {
      this.widget!.style.transform = 'translateY(0)';
    });
    
    document.body.appendChild(this.widget);
  }

  private createMainPanel() {
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: ${this.currentWidth}px;
      height: 600px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      display: none;
      flex-direction: column;
      z-index: 999998;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #374151;
      overflow: hidden;
      resize: horizontal;
      min-width: ${this.minWidth}px;
      max-width: ${this.maxWidth}px;
    `;
    
    this.renderPanel();
    document.body.appendChild(this.panel);
    this.setupResizing();
  }

  private setupResizing() {
    if (!this.panel) return;

    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: ew-resize;
      background: transparent;
      z-index: 10;
    `;

    resizeHandle.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      const startX = e.clientX;
      const startWidth = this.currentWidth;

      const handleMouseMove = (e: MouseEvent) => {
        if (!this.isResizing || !this.panel) return;
        
        const diff = startX - e.clientX;
        const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, startWidth + diff));
        
        this.currentWidth = newWidth;
        this.panel.style.width = `${newWidth}px`;
      };

      const handleMouseUp = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    });

    this.panel.appendChild(resizeHandle);
  }

  private renderPanel() {
    if (!this.panel) return;
    
    this.panel.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        min-height: 44px;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 6px;
            height: 6px;
            background: ${this.isRecording ? '#10b981' : '#6b7280'};
            border-radius: 50%;
          "></div>
          <span style="font-weight: 600; color: #111827;">DevInspector</span>
          <span style="
            font-size: 10px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          ">v1.1.0</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="resize-btn" style="
            padding: 4px 8px;
            background: none;
            border: 1px solid #d1d5db;
            color: #6b7280;
            cursor: pointer;
            border-radius: 4px;
            font-size: 11px;
            line-height: 1;
          " title="Expand">↔</button>
          <button class="minimize-btn" style="
            padding: 4px 8px;
            background: none;
            border: 1px solid #d1d5db;
            color: #6b7280;
            cursor: pointer;
            border-radius: 4px;
            font-size: 11px;
            line-height: 1;
          " title="Minimize">−</button>
          <button class="close-btn" style="
            padding: 4px 8px;
            background: none;
            border: 1px solid #d1d5db;
            color: #6b7280;
            cursor: pointer;
            border-radius: 4px;
            font-size: 11px;
            line-height: 1;
          " title="Close">×</button>
        </div>
      </div>

      ${!this.isMinimized ? `
        <div style="
          display: flex;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
        ">
          ${this.renderTabs()}
        </div>
        <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
          ${this.renderTabContent()}
        </div>
      ` : ''}
    `;
    
    this.setupResizing();
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
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background: ${this.activeTab === tab.id ? '#ffffff' : 'transparent'};
        border: none;
        border-bottom: 2px solid ${this.activeTab === tab.id ? '#0066cc' : 'transparent'};
        color: ${this.activeTab === tab.id ? '#0066cc' : '#6b7280'};
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='${this.activeTab === tab.id ? '#ffffff' : 'transparent'}'">
        ${tab.label}
        ${tab.count !== undefined ? `
          <span style="
            background: ${this.activeTab === tab.id ? '#0066cc' : '#9ca3af'};
            color: white;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            min-width: 16px;
            text-align: center;
            line-height: 1.4;
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
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          min-height: 40px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="clear-network" style="
              padding: 4px 12px;
              background: #ffffff;
              border: 1px solid #d1d5db;
              color: #374151;
              cursor: pointer;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            ">Clear</button>
            <button class="toggle-recording" style="
              padding: 4px 12px;
              border: 1px solid;
              color: white;
              cursor: pointer;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              background: ${this.isRecording ? '#dc2626' : '#16a34a'};
              border-color: ${this.isRecording ? '#dc2626' : '#16a34a'};
            ">${this.isRecording ? 'Pause' : 'Record'}</button>
          </div>
          <span style="
            font-size: 11px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          ">
            ${this.data.network.length} requests
          </span>
        </div>
        
        <div style="flex: 1; overflow-y: auto; ${this.data.network.length === 0 ? 'display: flex; align-items: center; justify-content: center;' : ''}">
          ${this.data.network.length === 0 ? `
            <div style="
              text-align: center;
              color: #9ca3af;
              padding: 40px 20px;
            ">
              <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">🌐</div>
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">No network activity</div>
              <div style="font-size: 12px;">Network requests will appear here</div>
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
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background-color 0.15s ease;
        ${this.selectedRequest?.id === req.id ? 'background: #eff6ff; border-left: 3px solid #0066cc;' : ''}
      " onmouseover="if ('${this.selectedRequest?.id}' !== '${req.id}') this.style.background='#f9fafb'" 
         onmouseout="if ('${this.selectedRequest?.id}' !== '${req.id}') this.style.background='transparent'">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              background: ${methodColor};
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: 600;
              min-width: 40px;
              text-align: center;
              line-height: 1.2;
            ">${req.method}</span>
            <span style="color: ${statusColor}; font-weight: 600; font-size: 12px;">${req.status}</span>
            <span style="color: #6b7280; font-size: 11px;">${req.duration || '-'}ms</span>
          </div>
          <span style="color: #9ca3af; font-size: 10px;">
            ${req.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div style="
          color: #4b5563;
          font-size: 12px;
          word-break: break-all;
          line-height: 1.3;
          font-family: 'SF Mono', Monaco, monospace;
        ">
          ${req.url}
        </div>
      </div>
    `;
  }

  private renderConsoleTab() {
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          min-height: 40px;
        ">
          <button class="clear-console" style="
            padding: 4px 12px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            color: #374151;
            cursor: pointer;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          ">Clear</button>
          <span style="
            font-size: 11px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          ">
            ${this.data.console.length} logs
          </span>
        </div>
        
        <div style="flex: 1; overflow-y: auto; font-family: 'SF Mono', Monaco, monospace; ${this.data.console.length === 0 ? 'display: flex; align-items: center; justify-content: center;' : ''}">
          ${this.data.console.length === 0 ? `
            <div style="
              text-align: center;
              color: #9ca3af;
              padding: 40px 20px;
            ">
              <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">📝</div>
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">No console logs</div>
              <div style="font-size: 12px;">Console output will appear here</div>
            </div>
          ` : this.data.console.map(log => `
            <div style="
              padding: 8px 16px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 12px;
              line-height: 1.4;
            ">
              <div style="display: flex; align-items: flex-start; gap: 8px;">
                <span style="
                  color: ${this.getConsoleLevelColor(log.level)};
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 10px;
                  min-width: 40px;
                ">[${log.level}]</span>
                <span style="
                  color: #9ca3af;
                  font-size: 10px;
                  min-width: 60px;
                ">${log.timestamp.toLocaleTimeString()}</span>
                <pre style="
                  margin: 0;
                  color: ${this.getConsoleLevelColor(log.level)};
                  white-space: pre-wrap;
                  word-break: break-word;
                  flex: 1;
                  font-family: inherit;
                  font-size: 12px;
                ">${log.message}</pre>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderPerformanceTab() {
    return `
      <div style="padding: 16px; height: 100%; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">FPS</div>
            <div style="font-size: 24px; font-weight: 700; color: #0066cc;">${this.data.performance.fps}</div>
          </div>
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            text-align: center;
          ">
            <div style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Memory</div>
            <div style="font-size: 24px; font-weight: 700; color: #059669;">
              ${this.data.performance.memory ? this.data.performance.memory.used + ' MB' : 'N/A'}
            </div>
          </div>
        </div>
        
        <div style="
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;
        ">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">Performance Metrics</h4>
          <div style="color: #6b7280; font-size: 12px;">
            Performance monitoring is active and collecting metrics...
          </div>
        </div>
      </div>
    `;
  }

  private renderErrorsTab() {
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          min-height: 40px;
        ">
          <button class="clear-errors" style="
            padding: 4px 12px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            color: #374151;
            cursor: pointer;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          ">Clear</button>
          <span style="
            font-size: 11px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          ">
            ${this.data.errors.length} errors
          </span>
        </div>
        
        <div style="flex: 1; overflow-y: auto; ${this.data.errors.length === 0 ? 'display: flex; align-items: center; justify-content: center;' : ''}">
          ${this.data.errors.length === 0 ? `
            <div style="
              text-align: center;
              color: #9ca3af;
              padding: 40px 20px;
            ">
              <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">✅</div>
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">No errors recorded</div>
              <div style="font-size: 12px;">JavaScript errors will appear here</div>
            </div>
          ` : this.data.errors.map(error => `
            <div style="
              padding: 16px;
              border-bottom: 1px solid #f3f4f6;
            ">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="
                  color: #dc2626;
                  font-weight: 600;
                  background: #fef2f2;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  border: 1px solid #fecaca;
                ">${error.type}</span>
                <span style="color: #9ca3af; font-size: 10px;">
                  ${error.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div style="color: #dc2626; margin-bottom: 8px; font-size: 13px; line-height: 1.4;">${error.message}</div>
              ${error.stack ? `
                <pre style="
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  padding: 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  color: #6b7280;
                  overflow-x: auto;
                  margin: 0;
                  white-space: pre-wrap;
                  line-height: 1.3;
                ">${error.stack}</pre>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderRequestDetails() {
    if (!this.selectedRequest) return '';
    
    return `
      <div style="
        border-top: 1px solid #e5e7eb;
        height: 200px;
        overflow-y: auto;
        background: #f9fafb;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          min-height: 40px;
        ">
          <h4 style="margin: 0; font-size: 13px; font-weight: 600; color: #111827;">Request Details</h4>
          <button class="close-details" style="
            background: none;
            border: 1px solid #d1d5db;
            color: #6b7280;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            line-height: 1;
          ">×</button>
        </div>
        <div style="padding: 16px; font-size: 12px; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            <div style="color: #6b7280; font-size: 11px; font-weight: 600; margin-bottom: 2px;">URL</div>
            <div style="color: #111827; word-break: break-all; font-family: 'SF Mono', Monaco, monospace;">${this.selectedRequest.url}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <div style="color: #6b7280; font-size: 11px; font-weight: 600; margin-bottom: 2px;">Method</div>
              <div style="color: #111827; font-weight: 500;">${this.selectedRequest.method}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 11px; font-weight: 600; margin-bottom: 2px;">Status</div>
              <div style="color: ${this.getStatusColor(this.selectedRequest.status)}; font-weight: 600;">${this.selectedRequest.status}</div>
            </div>
            <div>
              <div style="color: #6b7280; font-size: 11px; font-weight: 600; margin-bottom: 2px;">Duration</div>
              <div style="color: #111827; font-weight: 500;">${this.selectedRequest.duration || '-'}ms</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper methods for styling
  private getStatusColor(status: number | string): string {
    if (status === 'error' || status === 'pending') return '#6b7280';
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    if (statusNum >= 200 && statusNum < 300) return '#059669';
    if (statusNum >= 300 && statusNum < 400) return '#d97706';
    if (statusNum >= 400) return '#dc2626';
    return '#6b7280';
  }

  private getMethodColor(method: string): string {
    const colors: any = {
      GET: '#059669',
      POST: '#0066cc',
      PUT: '#d97706',
      DELETE: '#dc2626',
      PATCH: '#7c3aed'
    };
    return colors[method] || '#6b7280';
  }

  private getConsoleLevelColor(level: string): string {
    const colors: any = {
      log: '#4b5563',
      info: '#0066cc',
      warn: '#d97706',
      error: '#dc2626',
      debug: '#7c3aed'
    };
    return colors[level] || '#4b5563';
  }

  private attachEventListeners() {
    if (!this.panel) return;

    // Header buttons
    const minimizeBtn = this.panel.querySelector('.minimize-btn');
    const closeBtn = this.panel.querySelector('.close-btn');
    const resizeBtn = this.panel.querySelector('.resize-btn');
    
    minimizeBtn?.addEventListener('click', () => this.minimize());
    closeBtn?.addEventListener('click', () => this.hide());
    resizeBtn?.addEventListener('click', () => this.expandToggle());

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

  private expandToggle() {
    const isExpanded = this.currentWidth > 500;
    this.currentWidth = isExpanded ? 420 : 680;
    if (this.panel) {
      this.panel.style.width = `${this.currentWidth}px`;
    }
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
      this.panel.style.height = this.isMinimized ? '56px' : '600px';
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

  // Network monitoring setup (same as before)
  private setupInterceptors() {
    this.interceptFetch();
    this.interceptXHR();
    this.interceptConsole();
    this.interceptErrors();
    this.setupPerformanceMonitoring();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      if (!this.isRecording) return originalFetch(...args);

      const requestId = Math.random().toString(36).substr(2, 9);
      const startTime = performance.now();
      const [url, options = {}] = args;

      const request: NetworkRequest = {
        id: requestId,
        url: typeof url === 'string' ? url : url.toString(),
        method: options.method || 'GET',
        status: 'pending',
        timestamp: new Date()
      };

      this.data.network.unshift(request);
      this.renderPanel();

      try {
        const response = await originalFetch(...args);
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
  (window as any).CleanDevInspector = CleanDevInspector;
}

export default CleanDevInspector;