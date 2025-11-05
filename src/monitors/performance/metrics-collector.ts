export interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  TTI?: number; // Time to Interactive
  TBT?: number; // Total Blocking Time
  INP?: number; // Interaction to Next Paint
}

export interface NavigationTiming {
  dnsTime: number;
  connectTime: number;
  requestTime: number;
  responseTime: number;
  domProcessingTime: number;
  domContentLoadedTime: number;
  loadTime: number;
  totalTime: number;
}

export type MetricsCallback = (metrics: PerformanceMetrics) => void;

export class MetricsCollector {
  private callback: MetricsCallback;
  private metrics: PerformanceMetrics = {};
  private observer: PerformanceObserver | null = null;
  private fidObserver: PerformanceObserver | null = null;
  private clsValue: number = 0;
  private clsEntries: PerformanceEntry[] = [];
  private sessionValue: number = 0;
  private sessionEntries: PerformanceEntry[] = [];

  constructor(callback: MetricsCallback) {
    this.callback = callback;
  }

  start(): void {
    this.observePaintMetrics();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeINP();
    this.measureNavigationTiming();
  }

  stop(): void {
    this.observer?.disconnect();
    this.fidObserver?.disconnect();
    this.observer = null;
    this.fidObserver = null;
  }

  private observePaintMetrics(): void {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = Math.round(entry.startTime);
            this.reportMetrics();
          }
        }
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Paint metrics not supported');
    }
  }

  private observeLCP(): void {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = Math.round(lastEntry.startTime);
          this.reportMetrics();
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP not supported');
    }
  }

  private observeFID(): void {
    try {
      this.fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            this.metrics.FID = Math.round(fidEntry.processingStart - fidEntry.startTime);
            this.reportMetrics();
            this.fidObserver?.disconnect();
          }
        }
      });
      
      this.fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID not supported');
    }
  }

  private observeCLS(): void {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            this.clsValue += layoutShiftEntry.value;
            this.clsEntries.push(entry);
          }
        }
        
        this.metrics.CLS = Math.round(this.clsValue * 1000) / 1000;
        this.reportMetrics();
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS not supported');
    }
  }

  private observeINP(): void {
    try {
      let maxINP = 0;
      
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event') {
            const eventEntry = entry as PerformanceEventTiming;
            const inp = eventEntry.duration;
            
            if (inp > maxINP) {
              maxINP = inp;
              this.metrics.INP = Math.round(maxINP);
              this.reportMetrics();
            }
          }
        }
      });
      
      inpObserver.observe({ entryTypes: ['event'] });
    } catch (e) {
      console.warn('INP not supported');
    }
  }

  private measureNavigationTiming(): void {
    if (!performance.timing) return;
    
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;
    
    // Calculate TTFB
    this.metrics.TTFB = Math.round(timing.responseStart - navigationStart);
    
    // Calculate other timings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const navigationTiming: NavigationTiming = {
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      connectTime: timing.connectEnd - timing.connectStart,
      requestTime: timing.responseStart - timing.requestStart,
      responseTime: timing.responseEnd - timing.responseStart,
      domProcessingTime: timing.domComplete - timing.domLoading,
      domContentLoadedTime: timing.domContentLoadedEventEnd - navigationStart,
      loadTime: timing.loadEventEnd - navigationStart,
      totalTime: timing.loadEventEnd - navigationStart
    };
    
    this.reportMetrics();
  }

  private reportMetrics(): void {
    this.callback({ ...this.metrics });
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  markStart(name: string): void {
    performance.mark(`${name}-start`);
  }

  markEnd(name: string): number | undefined {
    performance.mark(`${name}-end`);
    
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measures = performance.getEntriesByName(name, 'measure');
      
      if (measures.length > 0) {
        const measure = measures[measures.length - 1];
        return measure.duration;
      }
    } catch (e) {
      console.warn(`Failed to measure ${name}`);
    }
  }

  clearMarks(name?: string): void {
    if (name) {
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  hadRecentInput?: boolean;
}