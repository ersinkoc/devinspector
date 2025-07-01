import { DevInspector } from '../core/inspector';
import { FloatingWidget } from './components/floating-widget';
import { MainPanel, TabConfig } from './components/main-panel';
import { createStyles } from './styles';

export class DevInspectorUI {
  private inspector: DevInspector;
  private floatingWidget: FloatingWidget;
  private mainPanel: MainPanel;
  private styleElement: HTMLStyleElement | null = null;
  private isVisible: boolean = false;
  private isMinimized: boolean = false;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.floatingWidget = new FloatingWidget(inspector);
    this.mainPanel = new MainPanel(inspector);
  }

  async init(): Promise<void> {
    this.injectStyles();
    this.setupTabs();
    this.setupEventListeners();
    this.floatingWidget.show();
  }

  private injectStyles(): void {
    this.styleElement = document.createElement('style');
    const theme = this.inspector.getConfig().theme;
    const resolvedTheme = theme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme;
    this.styleElement.textContent = createStyles(resolvedTheme);
    document.head.appendChild(this.styleElement);
  }

  private setupTabs(): void {
    // Network tab
    const networkTab: TabConfig = {
      id: 'network',
      label: 'Network',
      badge: () => this.inspector.getStorage('network').getSize(),
      content: this.createNetworkPanel()
    };

    // Console tab
    const consoleTab: TabConfig = {
      id: 'console',
      label: 'Console',
      badge: () => this.inspector.getStorage('console').getSize(),
      content: this.createConsolePanel()
    };

    // Performance tab
    const performanceTab: TabConfig = {
      id: 'performance',
      label: 'Performance',
      content: this.createPerformancePanel()
    };

    // Errors tab
    const errorsTab: TabConfig = {
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

  private createNetworkPanel(): HTMLElement {
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

  private createConsolePanel(): HTMLElement {
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

  private createPerformancePanel(): HTMLElement {
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

  private createErrorsPanel(): HTMLElement {
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

  private setupEventListeners(): void {
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

  private addNetworkEntry(panel: HTMLElement, request: any): void {
    const list = panel.querySelector('.devinspector-network-list');
    if (!list) return;

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

  private updateNetworkEntry(panel: HTMLElement, response: any): void {
    const entry = panel.querySelector(`[data-request-id="${response.id}"]`);
    if (!entry) return;

    const status = entry.querySelector('.devinspector-status');
    if (status) {
      status.textContent = `${response.status}`;
      status.className = `devinspector-status ${response.status >= 400 ? 'error' : 'success'}`;
    }
  }

  private addConsoleEntry(panel: HTMLElement, entry: any): void {
    const list = panel.querySelector('.devinspector-console-list');
    if (!list) return;

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

  private addErrorEntry(panel: HTMLElement, error: any): void {
    const list = panel.querySelector('.devinspector-errors-list');
    if (!list) return;

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

  private updatePerformanceMetrics(panel: HTMLElement, data: any): void {
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

  private formatConsoleArgs(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      } else if (arg && typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      } else {
        return String(arg);
      }
    }).join(' ');
  }

  show(): void {
    this.mainPanel.show();
    this.isVisible = true;
    this.isMinimized = false;
  }

  hide(): void {
    this.mainPanel.hide();
    this.isVisible = false;
  }

  minimize(): void {
    this.mainPanel.minimize();
    this.isMinimized = true;
  }

  destroy(): void {
    this.floatingWidget.destroy();
    this.mainPanel.destroy();
    
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
  }

  getElement(): HTMLElement {
    return this.mainPanel.getElement();
  }
}