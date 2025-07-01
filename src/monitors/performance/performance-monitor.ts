import { DevInspector } from '../../core/inspector';
import { FPSMonitor, FPSData } from './fps-monitor';
import { MemoryMonitor, MemoryData } from './memory-monitor';
import { MetricsCollector, PerformanceMetrics } from './metrics-collector';
import { LongTaskDetector, LongTask } from './long-task-detector';
import { throttle } from '../../core/utils';

export interface PerformanceData {
  fps?: FPSData;
  memory?: MemoryData;
  metrics?: PerformanceMetrics;
  longTasks?: LongTask[];
  timestamp: number;
}

export class PerformanceMonitor {
  private inspector: DevInspector;
  private fpsMonitor: FPSMonitor;
  private memoryMonitor: MemoryMonitor;
  private metricsCollector: MetricsCollector;
  private longTaskDetector: LongTaskDetector;
  private isActive: boolean = false;
  private performanceData: PerformanceData = { timestamp: Date.now() };

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    
    // Initialize monitors with callbacks
    this.fpsMonitor = new FPSMonitor(this.handleFPSData.bind(this));
    this.memoryMonitor = new MemoryMonitor(this.handleMemoryData.bind(this));
    this.metricsCollector = new MetricsCollector(this.handleMetrics.bind(this));
    this.longTaskDetector = new LongTaskDetector(this.handleLongTask.bind(this));
    
    // Throttle the performance data emission
    this.emitPerformanceData = throttle(this.emitPerformanceData.bind(this), 100);
  }

  start(): void {
    if (this.isActive) return;
    
    this.fpsMonitor.start();
    this.memoryMonitor.start();
    this.metricsCollector.start();
    this.longTaskDetector.start();
    
    this.setupPerformanceObservers();
    this.monitorResourceTiming();
    
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;
    
    this.fpsMonitor.stop();
    this.memoryMonitor.stop();
    this.metricsCollector.stop();
    this.longTaskDetector.stop();
    
    this.isActive = false;
  }

  private handleFPSData(data: FPSData): void {
    this.performanceData.fps = data;
    
    const storage = this.inspector.getStorage('performance');
    storage.set('fps', data);
    
    // Check for performance issues
    if (data.fps < 30) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'low-fps',
        message: `Low FPS detected: ${data.fps}`,
        fps: data.fps,
        droppedFrames: data.droppedFrames
      });
    }
    
    this.emitPerformanceData();
  }

  private handleMemoryData(data: MemoryData): void {
    this.performanceData.memory = data;
    
    const storage = this.inspector.getStorage('performance');
    storage.set('memory', data);
    
    // Check for memory issues
    if (data.percentUsed > 90) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'high-memory',
        message: `High memory usage: ${data.percentUsed.toFixed(1)}%`,
        percentUsed: data.percentUsed,
        usedBytes: data.usedJSHeapSize
      });
    }
    
    this.emitPerformanceData();
  }

  private handleMetrics(metrics: PerformanceMetrics): void {
    this.performanceData.metrics = metrics;
    
    const storage = this.inspector.getStorage('performance');
    storage.set('metrics', metrics);
    
    // Check for poor metrics
    if (metrics.LCP && metrics.LCP > 2500) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'poor-lcp',
        message: `Poor LCP: ${metrics.LCP}ms`,
        value: metrics.LCP
      });
    }
    
    if (metrics.FID && metrics.FID > 100) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'poor-fid',
        message: `Poor FID: ${metrics.FID}ms`,
        value: metrics.FID
      });
    }
    
    if (metrics.CLS && metrics.CLS > 0.1) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'poor-cls',
        message: `Poor CLS: ${metrics.CLS}`,
        value: metrics.CLS
      });
    }
    
    this.inspector.getEvents().emit('performance:metrics', metrics);
  }

  private handleLongTask(task: LongTask): void {
    const storage = this.inspector.getStorage('performance');
    const longTasks = storage.get('longTasks') || [];
    longTasks.push(task);
    
    // Keep only last 100 long tasks
    if (longTasks.length > 100) {
      longTasks.shift();
    }
    
    storage.set('longTasks', longTasks);
    
    this.inspector.getEvents().emit('performance:longtask', task);
    
    // Report significant long tasks
    if (task.duration > 200) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'long-task',
        message: `Long task detected: ${task.duration}ms`,
        duration: task.duration,
        attribution: task.attribution
      });
    }
  }

  private emitPerformanceData(): void {
    this.performanceData.timestamp = Date.now();
    this.inspector.getEvents().emit('performance:data', this.performanceData);
  }

  private setupPerformanceObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.inspector.getEvents().emit('performance:navigation', {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
              timestamp: Date.now()
            });
          }
        });
        
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Navigation timing observation not supported');
      }
    }
  }

  private monitorResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Check for slow resources
          if (resourceEntry.duration > 1000) {
            this.inspector.getConfig().onPerformanceIssue?.({
              type: 'slow-resource',
              message: `Slow resource: ${resourceEntry.name}`,
              duration: resourceEntry.duration,
              url: resourceEntry.name
            });
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource timing observation not supported');
    }
  }

  // Public API for manual performance tracking
  markStart(name: string): void {
    this.metricsCollector.markStart(name);
  }

  markEnd(name: string): void {
    const duration = this.metricsCollector.markEnd(name);
    
    if (duration !== undefined) {
      this.inspector.getEvents().emit('performance:mark', {
        name,
        duration,
        timestamp: Date.now()
      });
    }
  }

  getSnapshot(): PerformanceData {
    return {
      fps: this.performanceData.fps,
      memory: this.memoryMonitor.getCurrentMemory() || undefined,
      metrics: this.metricsCollector.getMetrics(),
      longTasks: this.inspector.getStorage('performance').get('longTasks') || [],
      timestamp: Date.now()
    };
  }
}