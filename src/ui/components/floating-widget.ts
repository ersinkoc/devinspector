import { DevInspector } from '../../core/inspector';

export class FloatingWidget {
  private inspector: DevInspector;
  private element: HTMLDivElement;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private errorCount = 0;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private eventUnsubscribers: Array<() => void> = [];

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.element = this.createElement();

    // Bind event handlers for proper cleanup later
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

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
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);

    // Error tracking - store unsubscribe functions for cleanup
    const unsubErrorCaught = this.inspector.on('error:caught', () => {
      this.errorCount++;
      this.updateAppearance();
    });
    this.eventUnsubscribers.push(unsubErrorCaught);

    const unsubErrorUncaught = this.inspector.on('error:uncaught', () => {
      this.errorCount++;
      this.updateAppearance();
    });
    this.eventUnsubscribers.push(unsubErrorUncaught);

    // Clear error count when inspector is opened
    const unsubInspectorShow = this.inspector.on('inspector:show', () => {
      this.errorCount = 0;
      this.updateAppearance();
    });
    this.eventUnsubscribers.push(unsubInspectorShow);
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
    
    // Find closest edge using type-safe approach
    const closestEdge = (Object.entries(distances) as [keyof typeof distances, number][])
      .reduce((a, b) => a[1] < b[1] ? a : b)[0];
    
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
    // Remove document event listeners to prevent memory leaks
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);

    // Unsubscribe from all inspector events
    this.eventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.eventUnsubscribers = [];

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}