import { DevInspector } from '../../core/inspector';

export class DOMMonitor {
  private inspector: DevInspector;
  private isActive: boolean = false;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
  }

  start(): void {
    if (this.isActive) return;
    // TODO: Implement DOM monitoring
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;
    // TODO: Implement cleanup
    this.isActive = false;
  }
}