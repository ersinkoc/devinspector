import { generateId } from '../../core/utils';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  type: 'fetch' | 'xhr' | 'beacon' | 'websocket';
}

export interface NetworkResponse {
  id: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  size: number;
  duration: number;
  timestamp: number;
  fromCache?: boolean;
}

export interface NetworkError {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
}

type NetworkEventHandler = {
  onRequest?: (request: NetworkRequest) => void;
  onResponse?: (response: NetworkResponse) => void;
  onError?: (error: NetworkError) => void;
};

export class FetchInterceptor {
  private originalFetch: typeof fetch;
  private handlers: NetworkEventHandler;
  private requestMap: Map<string, NetworkRequest> = new Map();

  constructor(handlers: NetworkEventHandler = {}) {
    this.originalFetch = window.fetch;
    this.handlers = handlers;
  }

  install(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    window.fetch = async function(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const id = generateId();
      const startTime = performance.now();
      
      let url: string;
      let method: string;
      let headers: Record<string, string> = {};
      let body: any;

      if (input instanceof Request) {
        url = input.url;
        method = input.method;
        input.headers.forEach((value, key) => {
          headers[key] = value;
        });
        body = await self.extractBody(input);
      } else {
        url = input.toString();
        method = init?.method || 'GET';
        
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
              headers[key] = value;
            });
          } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
              headers[key] = value;
            });
          } else {
            headers = init.headers as Record<string, string>;
          }
        }
        
        body = init?.body;
      }

      const request: NetworkRequest = {
        id,
        method,
        url,
        headers,
        body: self.sanitizeBody(body),
        timestamp: Date.now(),
        type: 'fetch'
      };

      self.requestMap.set(id, request);
      self.handlers.onRequest?.(request);

      try {
        const response = await self.originalFetch.apply(window, [input, init]);
        const duration = performance.now() - startTime;

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        const clonedResponse = response.clone();
        const responseBody = await self.extractResponseBody(clonedResponse);
        const size = self.calculateSize(responseBody, responseHeaders);

        const networkResponse: NetworkResponse = {
          id,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
          size,
          duration,
          timestamp: Date.now(),
          fromCache: self.isFromCache(response, duration)
        };

        self.handlers.onResponse?.(networkResponse);
        self.requestMap.delete(id);

        return response;
      } catch (error: any) {
        const networkError: NetworkError = {
          id,
          message: error.message || 'Network request failed',
          stack: error.stack,
          timestamp: Date.now()
        };

        self.handlers.onError?.(networkError);
        self.requestMap.delete(id);
        
        throw error;
      }
    };
  }

  uninstall(): void {
    window.fetch = this.originalFetch;
    this.requestMap.clear();
  }

  private async extractBody(request: Request): Promise<any> {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (request.bodyUsed) {
        return '[Body already read]';
      }

      const cloned = request.clone();
      
      if (contentType.includes('application/json')) {
        return await cloned.json();
      } else if (contentType.includes('text/')) {
        return await cloned.text();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        return await cloned.text();
      } else if (contentType.includes('multipart/form-data')) {
        return '[FormData]';
      }
      
      return '[Binary data]';
    } catch (error) {
      return '[Unable to read body]';
    }
  }

  private async extractResponseBody(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/')) {
        return await response.text();
      } else if (contentType.includes('image/')) {
        return '[Image data]';
      } else if (contentType.includes('video/')) {
        return '[Video data]';
      } else if (contentType.includes('audio/')) {
        return '[Audio data]';
      }
      
      const blob = await response.blob();
      return `[Binary data: ${blob.size} bytes]`;
    } catch (error) {
      return '[Unable to read response]';
    }
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;
    
    if (typeof body === 'string') {
      return body.length > 10000 ? body.substring(0, 10000) + '...' : body;
    }
    
    if (body instanceof FormData) {
      const entries: Record<string, any> = {};
      body.forEach((value, key) => {
        if (value instanceof File) {
          entries[key] = `[File: ${value.name}, ${value.size} bytes]`;
        } else {
          entries[key] = value;
        }
      });
      return { type: 'FormData', entries };
    }
    
    if (body instanceof ArrayBuffer) {
      return `[ArrayBuffer: ${body.byteLength} bytes]`;
    }
    
    if (body instanceof Blob) {
      return `[Blob: ${body.size} bytes, type: ${body.type}]`;
    }
    
    if (body instanceof URLSearchParams) {
      return body.toString();
    }
    
    return body;
  }

  private calculateSize(body: any, headers: Record<string, string>): number {
    const contentLength = headers['content-length'];
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    
    if (typeof body === 'string') {
      return new Blob([body]).size;
    }
    
    if (body && typeof body === 'object') {
      try {
        return new Blob([JSON.stringify(body)]).size;
      } catch {
        return 0;
      }
    }
    
    return 0;
  }

  private isFromCache(response: Response, duration: number): boolean {
    // Heuristic: very fast responses (< 5ms) are likely from cache
    if (duration < 5) return true;
    
    // Check cache headers
    const cacheControl = response.headers.get('cache-control');
    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');
    
    return !!(cacheControl || etag || lastModified);
  }
}