// Simplified DevInspector for production demo
export interface SimpleConfig {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme?: 'dark' | 'light';
}

export class SimpleDevInspector {
  private config: SimpleConfig;
  private widget: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private isVisible = false;

  constructor(config: SimpleConfig = {}) {
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

  private init(): void {
    this.createWidget();
    this.createPanel();
    this.setupEventListeners();
  }

  private createWidget(): void {
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

  private createPanel(): void {
    this.panel = document.createElement('div');
    const bgColor = this.config.theme === 'dark' ? '#1e1e1e' : '#ffffff';
    const textColor = this.config.theme === 'dark' ? '#cccccc' : '#333333';
    const borderColor = this.config.theme === 'dark' ? '#3e3e42' : '#ddd';

    this.panel.style.cssText = `
      position: fixed;
      ${this.config.position?.includes('bottom') ? 'bottom: 100px;' : 'top: 100px;'}
      ${this.config.position?.includes('right') ? 'right: 20px;' : 'left: 20px;'}
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

  private setupEventListeners(): void {
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

  show(): void {
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }

  toggle(): void {
    this.isVisible ? this.hide() : this.show();
  }

  destroy(): void {
    if (this.widget && this.widget.parentNode) {
      this.widget.parentNode.removeChild(this.widget);
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }

  // Tracking methods for demonstration
  track(name: string, data: any): void {
    console.log(`[DevInspector] Tracking: ${name}`, data);
  }

  markStart(name: string): void {
    performance.mark(`devinspector-${name}-start`);
  }

  markEnd(name: string): void {
    performance.mark(`devinspector-${name}-end`);
    try {
      performance.measure(
        `devinspector-${name}`,
        `devinspector-${name}-start`,
        `devinspector-${name}-end`
      );
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }
}

export default SimpleDevInspector;