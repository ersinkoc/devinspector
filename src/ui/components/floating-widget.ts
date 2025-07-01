import { DevInspector } from '../../core/inspector';

export class FloatingWidget {
  private inspector: DevInspector;
  private element: HTMLDivElement;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private errorCount = 0;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.element = this.createElement();
    this.setupEventListeners();
    this.updatePosition();
  }

  private createElement(): HTMLDivElement {
    const widget = document.createElement('div');
    widget.className = 'devinspector-floating-widget';
    widget.innerHTML = '🔍';
    widget.title = 'DevInspector - Click to toggle, drag to move';
    
    return widget;
  }

  private setupEventListeners(): void {
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

  private handleMouseDown(e: MouseEvent): void {
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

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

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

  private handleMouseUp(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.element.style.cursor = 'pointer';
    this.element.style.zIndex = '999998';
    
    // Snap to nearest edge
    this.snapToEdge();
  }

  private snapToEdge(): void {
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
    
    const closestEdge = Object.keys(distances).reduce((a, b) => 
      distances[a] < distances[b] ? a : b
    );
    
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

  private updatePosition(): void {
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

  private updateAppearance(): void {
    if (this.errorCount > 0) {
      this.element.classList.add('has-errors');
      this.element.innerHTML = '⚠️';
      this.element.title = `DevInspector - ${this.errorCount} error${this.errorCount > 1 ? 's' : ''} detected`;
    } else {
      this.element.classList.remove('has-errors');
      this.element.innerHTML = '🔍';
      this.element.title = 'DevInspector - Click to toggle, drag to move';
    }
  }

  show(): void {
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);
    }
    this.element.style.display = 'flex';
  }

  hide(): void {
    this.element.style.display = 'none';
  }

  destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}