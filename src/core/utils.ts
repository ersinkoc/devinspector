export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let result: any;
  let lastCallTime: number | null = null;
  let lastThis: any;
  let lastArgs: any[] | null = null;

  const { leading = false, trailing = true } = options;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    lastCallTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const leadingEdge = (time: number) => {
    lastCallTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  };

  const timerExpired = () => {
    timeout = null;

    if (trailing && lastArgs) {
      return invokeFunc(Date.now());
    }
    lastArgs = lastThis = null;
  };

  return function debounced(this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;

    if (isInvoking) {
      if (timeout === null) {
        return leadingEdge(time);
      }
    }

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(timerExpired, wait);
    return result;
  };

  function shouldInvoke(time: number): boolean {
    return lastCallTime === null || time - lastCallTime >= wait;
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastThis: any;
  let lastArgs: any[] | null = null;
  let result: any;

  const { leading = true, trailing = true } = options;

  const invokeFunc = () => {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    result = func.apply(thisArg, args);
    return result;
  };

  return function throttled(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;
    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      if (leading) {
        result = invokeFunc();
      }
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        if (trailing && lastArgs) {
          invokeFunc();
        }
      }, remaining);
    }

    return result;
  };
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Set) {
    return new Set(Array.from(obj).map(item => deepClone(item))) as any;
  }

  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [deepClone(key), deepClone(value)])
    ) as any;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any;
  }

  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

export function formatBytes(bytes: number, precision: number = 2): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + ' ' + units[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isCircularReference(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (seen.has(obj)) {
    return true;
  }

  seen.add(obj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && isCircularReference(obj[key], seen)) {
      return true;
    }
  }

  seen.delete(obj);
  return false;
}

export function safeStringify(obj: any, indent?: number): string {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    if (typeof value === 'function') {
      return value.toString();
    }
    
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    
    return value;
  }, indent);
}

export function getStackTrace(error?: Error): string[] {
  const stack = (error || new Error()).stack || '';
  return stack
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => line.startsWith('at '));
}

export function parseStackFrame(frame: string): {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
} | null {
  const match = frame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
  
  if (!match) {
    return null;
  }

  const [, functionName, fileName, lineNumber, columnNumber] = match;
  
  return {
    functionName: functionName || '<anonymous>',
    fileName: fileName || '<unknown>',
    lineNumber: parseInt(lineNumber || '0', 10),
    columnNumber: parseInt(columnNumber || '0', 10)
  };
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    ttl?: number;
    keyResolver?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { maxSize = 100, ttl, keyResolver = (...args) => JSON.stringify(args) } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyResolver(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });

    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

export function createWorkerScript(fn: (...args: any[]) => any): string {
  return `
    self.addEventListener('message', async (event) => {
      try {
        const result = await (${fn.toString()})(event.data);
        self.postMessage({ type: 'result', data: result });
      } catch (error) {
        self.postMessage({ 
          type: 'error', 
          error: {
            message: error.message,
            stack: error.stack
          }
        });
      }
    });
  `;
}

export function createObjectURL(content: string, type = 'application/javascript'): string {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
}

export class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}