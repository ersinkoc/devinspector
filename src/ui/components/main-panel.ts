import { DevInspector } from '../../core/inspector';

export interface TabConfig {
  id: string;
  label: string;
  badge?: () => number;
  content: HTMLElement;
}

export class MainPanel {
  private inspector: DevInspector;
  private element: HTMLDivElement;
  private headerElement: HTMLDivElement;
  private tabsElement: HTMLDivElement;
  private bodyElement: HTMLDivElement;
  private tabs: Map<string, TabConfig> = new Map();
  private activeTab: string | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private isResizing = false;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.element = this.createElement();
    this.setupEventListeners();
    this.updatePosition();
  }

  private createElement(): HTMLDivElement {
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

  private setupEventListeners(): void {
    // Header controls
    const controls = this.headerElement.querySelectorAll('.devinspector-control');
    controls.forEach(control => {
      control.addEventListener('click', (e) => {
        e.stopPropagation();
        const className = (control as HTMLElement).className;
        
        if (className.includes('minimize')) {
          this.inspector.minimize();
        } else if (className.includes('close')) {
          this.inspector.hide();
        } else if (className.includes('settings')) {
          this.showSettings();
        }
      });
    });

    // Header dragging
    this.headerElement.addEventListener('mousedown', this.handleHeaderMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Resizing
    const resizer = this.element.querySelector('.devinspector-resizer') as HTMLElement;
    resizer.addEventListener('mousedown', this.handleResizerMouseDown.bind(this));

    // Tab clicks
    this.tabsElement.addEventListener('click', (e) => {
      const tab = (e.target as HTMLElement).closest('.devinspector-tab') as HTMLElement;
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

  private handleHeaderMouseDown(e: MouseEvent): void {
    if ((e.target as HTMLElement).closest('.devinspector-control')) return;
    
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

  private handleResizerMouseDown(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    
    this.element.style.zIndex = '1000000';
    document.body.style.cursor = 'nw-resize';
  }

  private handleMouseMove(e: MouseEvent): void {
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
    } else if (this.isResizing) {
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

  private handleMouseUp(): void {
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

  private updatePosition(): void {
    const position = this.inspector.getConfig().position;
    
    // Remove all position classes
    this.element.classList.remove(
      'position-top-left',
      'position-top-right',
      'position-bottom-left',
      'position-bottom-right'
    );
    
    // Add current position class
    this.element.classList.add(`position-${position}`);
  }

  private showSettings(): void {
    // TODO: Implement settings modal
    console.log('Settings not implemented yet');
  }

  addTab(config: TabConfig): void {
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

  removeTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return;
    
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
      } else {
        this.activeTab = null;
      }
    }
  }

  setActiveTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return;
    
    this.activeTab = tabId;
    
    // Update tab states
    this.tabsElement.querySelectorAll('.devinspector-tab').forEach(tab => {
      const htmlTab = tab as HTMLElement;
      tab.classList.toggle('active', htmlTab.dataset.tabId === tabId);
    });
    
    // Update panel states
    this.bodyElement.querySelectorAll('.devinspector-panel').forEach(panel => {
      const htmlPanel = panel as HTMLElement;
      panel.classList.toggle('active', htmlPanel.dataset.panelId === tabId);
    });
  }

  private updateBadges(): void {
    this.tabs.forEach((config, tabId) => {
      if (config.badge) {
        const count = config.badge();
        const tab = this.tabsElement.querySelector(`[data-tab-id="${tabId}"]`);
        const badge = tab?.querySelector('.devinspector-tab-badge');
        
        if (badge) {
          badge.textContent = count.toString();
          (badge as HTMLElement).style.display = count > 0 ? 'inline-block' : 'none';
        }
      }
    });
  }

  show(): void {
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
    }
    this.element.style.display = 'flex';
    this.element.classList.remove('minimized');
  }

  hide(): void {
    this.element.style.display = 'none';
  }

  minimize(): void {
    this.element.classList.add('minimized');
  }

  destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  getActiveTab(): string | null {
    return this.activeTab;
  }
}