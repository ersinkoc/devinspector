export interface LongTask {
  id: string;
  duration: number;
  startTime: number;
  timestamp: number;
  attribution: Array<{
    name: string;
    containerType: string;
    containerSrc?: string;
    containerId?: string;
    containerName?: string;
  }>;
}

export type LongTaskCallback = (task: LongTask) => void;

export class LongTaskDetector {
  private callback: LongTaskCallback;
  private observer: PerformanceObserver | null = null;
  private threshold: number;
  private idCounter: number = 0;

  constructor(callback: LongTaskCallback, threshold: number = 50) {
    this.callback = callback;
    this.threshold = threshold;
  }

  start(): void {
    if (this.observer) return;
    
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= this.threshold) {
            this.handleLongTask(entry);
          }
        }
      });
      
      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long Task API not supported');
      this.fallbackDetection();
    }
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private handleLongTask(entry: PerformanceEntry): void {
    const longTaskEntry = entry as any; // PerformanceLongTaskTiming
    
    const task: LongTask = {
      id: `longtask-${++this.idCounter}`,
      duration: Math.round(entry.duration),
      startTime: Math.round(entry.startTime),
      timestamp: Date.now(),
      attribution: longTaskEntry.attribution ? 
        longTaskEntry.attribution.map((attr: any) => ({
          name: attr.name,
          containerType: attr.containerType,
          containerSrc: attr.containerSrc,
          containerId: attr.containerId,
          containerName: attr.containerName
        })) : []
    };
    
    this.callback(task);
  }

  private fallbackDetection(): void {
    // Fallback detection using requestAnimationFrame
    let lastTime = performance.now();
    
    const check = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > this.threshold) {
        const task: LongTask = {
          id: `longtask-fallback-${++this.idCounter}`,
          duration: Math.round(deltaTime),
          startTime: Math.round(lastTime),
          timestamp: Date.now(),
          attribution: [{
            name: 'unknown',
            containerType: 'window'
          }]
        };
        
        this.callback(task);
      }
      
      lastTime = currentTime;
      
      if (this.observer === null) {
        requestAnimationFrame(check);
      }
    };
    
    requestAnimationFrame(check);
  }
}