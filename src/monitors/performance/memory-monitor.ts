export interface MemoryData {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
  percentUsed: number;
}

export type MemoryCallback = (data: MemoryData) => void;

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export class MemoryMonitor {
  private callback: MemoryCallback;
  private intervalId: number | null = null;
  private updateInterval: number;
  private isSupported: boolean;

  constructor(callback: MemoryCallback, updateInterval: number = 1000) {
    this.callback = callback;
    this.updateInterval = updateInterval;
    this.isSupported = this.checkSupport();
  }

  private checkSupport(): boolean {
    return 'memory' in performance && performance.memory !== undefined;
  }

  start(): void {
    if (!this.isSupported) {
      console.warn('Performance.memory is not supported in this browser');
      return;
    }
    
    if (this.intervalId !== null) return;
    
    // Initial reading
    this.measure();
    
    // Set up interval
    this.intervalId = window.setInterval(() => {
      this.measure();
    }, this.updateInterval);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private measure(): void {
    if (!performance.memory) return;

    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const percentUsed = jsHeapSizeLimit > 0 ? (usedJSHeapSize / jsHeapSizeLimit) * 100 : 0;

    const data: MemoryData = {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      timestamp: Date.now(),
      percentUsed
    };

    this.callback(data);
  }

  getCurrentMemory(): MemoryData | null {
    if (!this.isSupported || !performance.memory) return null;

    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;

    return {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      timestamp: Date.now(),
      percentUsed: jsHeapSizeLimit > 0 ? (usedJSHeapSize / jsHeapSizeLimit) * 100 : 0
    };
  }

  isMemorySupported(): boolean {
    return this.isSupported;
  }
}