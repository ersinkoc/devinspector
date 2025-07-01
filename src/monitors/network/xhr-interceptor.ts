import { generateId } from '../../core/utils';
import { NetworkRequest, NetworkResponse, NetworkError } from './fetch-interceptor';

type XHREventHandler = {
  onRequest?: (request: NetworkRequest) => void;
  onResponse?: (response: NetworkResponse) => void;
  onError?: (error: NetworkError) => void;
  onProgress?: (progress: { id: string; loaded: number; total: number }) => void;
};

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _devinspectorId?: string;
  _devinspectorStartTime?: number;
  _devinspectorMethod?: string;
  _devinspectorUrl?: string;
  _devinspectorRequestHeaders?: Record<string, string>;
  _devinspectorRequestBody?: any;
}

export class XHRInterceptor {
  private originalOpen: typeof XMLHttpRequest.prototype.open;
  private originalSend: typeof XMLHttpRequest.prototype.send;
  private originalSetRequestHeader: typeof XMLHttpRequest.prototype.setRequestHeader;
  private handlers: XHREventHandler;

  constructor(handlers: XHREventHandler = {}) {
    this.handlers = handlers;
    this.originalOpen = XMLHttpRequest.prototype.open;
    this.originalSend = XMLHttpRequest.prototype.send;
    this.originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  }

  install(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    XMLHttpRequest.prototype.open = function(
      this: ExtendedXMLHttpRequest,
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ): void {
      this._devinspectorId = generateId();
      this._devinspectorMethod = method;
      this._devinspectorUrl = url.toString();
      this._devinspectorRequestHeaders = {};
      
      return self.originalOpen.apply(this, [method, url, async, username, password] as any);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(
      this: ExtendedXMLHttpRequest,
      name: string,
      value: string
    ): void {
      if (this._devinspectorRequestHeaders) {
        this._devinspectorRequestHeaders[name] = value;
      }
      
      return self.originalSetRequestHeader.apply(this, [name, value]);
    };

    XMLHttpRequest.prototype.send = function(
      this: ExtendedXMLHttpRequest,
      body?: Document | XMLHttpRequestBodyInit | null
    ): void {
      this._devinspectorStartTime = performance.now();
      this._devinspectorRequestBody = self.sanitizeBody(body);

      const request: NetworkRequest = {
        id: this._devinspectorId!,
        method: this._devinspectorMethod!,
        url: this._devinspectorUrl!,
        headers: this._devinspectorRequestHeaders || {},
        body: this._devinspectorRequestBody,
        timestamp: Date.now(),
        type: 'xhr'
      };

      self.handlers.onRequest?.(request);

      // Track upload progress
      if (this.upload && self.handlers.onProgress) {
        this.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            self.handlers.onProgress!({
              id: this._devinspectorId!,
              loaded: event.loaded,
              total: event.total
            });
          }
        });
      }

      // Track download progress
      if (self.handlers.onProgress) {
        this.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            self.handlers.onProgress!({
              id: this._devinspectorId!,
              loaded: event.loaded,
              total: event.total
            });
          }
        });
      }

      // Handle load event
      this.addEventListener('load', function(this: ExtendedXMLHttpRequest) {
        const duration = performance.now() - this._devinspectorStartTime!;
        
        const responseHeaders = self.parseResponseHeaders(this.getAllResponseHeaders());
        const responseBody = self.extractResponseBody(this);
        const size = self.calculateSize(responseBody, responseHeaders);

        const response: NetworkResponse = {
          id: this._devinspectorId!,
          status: this.status,
          statusText: this.statusText,
          headers: responseHeaders,
          body: responseBody,
          size,
          duration,
          timestamp: Date.now(),
          fromCache: duration < 5
        };

        self.handlers.onResponse?.(response);
      });

      // Handle error event
      this.addEventListener('error', function(this: ExtendedXMLHttpRequest) {
        const error: NetworkError = {
          id: this._devinspectorId!,
          message: 'Network request failed',
          timestamp: Date.now()
        };

        self.handlers.onError?.(error);
      });

      // Handle timeout event
      this.addEventListener('timeout', function(this: ExtendedXMLHttpRequest) {
        const error: NetworkError = {
          id: this._devinspectorId!,
          message: `Request timeout after ${this.timeout}ms`,
          timestamp: Date.now()
        };

        self.handlers.onError?.(error);
      });

      // Handle abort event
      this.addEventListener('abort', function(this: ExtendedXMLHttpRequest) {
        const error: NetworkError = {
          id: this._devinspectorId!,
          message: 'Request aborted',
          timestamp: Date.now()
        };

        self.handlers.onError?.(error);
      });

      return self.originalSend.apply(this, [body] as any);
    };
  }

  uninstall(): void {
    XMLHttpRequest.prototype.open = this.originalOpen;
    XMLHttpRequest.prototype.send = this.originalSend;
    XMLHttpRequest.prototype.setRequestHeader = this.originalSetRequestHeader;
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
    
    if (body instanceof Document) {
      return '[Document]';
    }
    
    return body;
  }

  private parseResponseHeaders(headersString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (!headersString) return headers;
    
    const lines = headersString.trim().split(/[\r\n]+/);
    lines.forEach(line => {
      const parts = line.split(': ');
      const key = parts.shift();
      if (key) {
        headers[key] = parts.join(': ');
      }
    });
    
    return headers;
  }

  private extractResponseBody(xhr: XMLHttpRequest): any {
    try {
      const contentType = xhr.getResponseHeader('content-type') || '';
      
      if (xhr.responseType === 'json' && xhr.response) {
        return xhr.response;
      }
      
      if (xhr.responseType === 'arraybuffer') {
        return `[ArrayBuffer: ${xhr.response.byteLength} bytes]`;
      }
      
      if (xhr.responseType === 'blob') {
        return `[Blob: ${xhr.response.size} bytes, type: ${xhr.response.type}]`;
      }
      
      if (xhr.responseType === 'document') {
        return '[Document]';
      }
      
      if (xhr.responseText) {
        if (contentType.includes('application/json')) {
          try {
            return JSON.parse(xhr.responseText);
          } catch {
            return xhr.responseText;
          }
        }
        return xhr.responseText.length > 10000 
          ? xhr.responseText.substring(0, 10000) + '...' 
          : xhr.responseText;
      }
      
      return null;
    } catch (error) {
      return '[Unable to read response]';
    }
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
}