export type EventListener<T = any> = (data: T) => void;
export type EventUnsubscribe = () => void;

export interface EventEmitterOptions {
  maxListeners?: number;
  captureRejections?: boolean;
}

export class EventEmitter<Events extends Record<string, any> = Record<string, any>> {
  private events: Map<keyof Events, Set<EventListener>> = new Map();
  private maxListeners: number;
  private captureRejections: boolean;

  constructor(options: EventEmitterOptions = {}) {
    this.maxListeners = options.maxListeners ?? 10;
    this.captureRejections = options.captureRejections ?? false;
  }

  on<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>
  ): EventUnsubscribe {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const listeners = this.events.get(event)!;
    
    if (listeners.size >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.size} ${String(event)} listeners added.`
      );
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    };
  }

  once<K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>
  ): EventUnsubscribe {
    const wrappedListener = (data: Events[K]) => {
      unsubscribe();
      listener(data);
    };

    const unsubscribe = this.on(event, wrappedListener);
    return unsubscribe;
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K] extends void ? [] : [Events[K]]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }

    const data = args[0];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        if (this.captureRejections) {
          // Use type assertion for recursive error emit
          (this.emit as any)('error', error);
        } else {
          console.error(`Error in event listener for "${String(event)}":`, error);
        }
      }
    });

    return true;
  }

  off<K extends keyof Events>(event: K, listener?: EventListener<Events[K]>): void {
    if (!listener) {
      this.events.delete(event);
      return;
    }

    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: keyof Events): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }

  eventNames(): (keyof Events)[] {
    return Array.from(this.events.keys());
  }

  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  getMaxListeners(): number {
    return this.maxListeners;
  }
}