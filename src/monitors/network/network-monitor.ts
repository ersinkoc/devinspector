import { DevInspector } from '../../core/inspector';
import { FetchInterceptor, NetworkRequest, NetworkResponse, NetworkError } from './fetch-interceptor';
import { XHRInterceptor } from './xhr-interceptor';
import { WebSocketMonitor, WebSocketConnection, WebSocketMessage, WebSocketError } from './websocket-monitor';

export interface NetworkEntry {
  id: string;
  type: 'fetch' | 'xhr' | 'beacon' | 'websocket';
  request?: NetworkRequest;
  response?: NetworkResponse;
  error?: NetworkError;
  websocket?: {
    connection?: WebSocketConnection;
    messages: WebSocketMessage[];
    errors: WebSocketError[];
  };
  timestamp: number;
  duration?: number;
  status?: number;
  size?: number;
}

export class NetworkMonitor {
  private inspector: DevInspector;
  private fetchInterceptor: FetchInterceptor;
  private xhrInterceptor: XHRInterceptor;
  private websocketMonitor: WebSocketMonitor;
  private beaconInterceptor: any;
  private entries: Map<string, NetworkEntry> = new Map();
  private isActive: boolean = false;

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    
    this.fetchInterceptor = new FetchInterceptor({
      onRequest: this.handleRequest.bind(this, 'fetch'),
      onResponse: this.handleResponse.bind(this),
      onError: this.handleError.bind(this)
    });

    this.xhrInterceptor = new XHRInterceptor({
      onRequest: this.handleRequest.bind(this, 'xhr'),
      onResponse: this.handleResponse.bind(this),
      onError: this.handleError.bind(this),
      onProgress: this.handleProgress.bind(this)
    });

    this.websocketMonitor = new WebSocketMonitor({
      onConnection: this.handleWebSocketConnection.bind(this),
      onMessage: this.handleWebSocketMessage.bind(this),
      onStatusChange: this.handleWebSocketStatusChange.bind(this),
      onError: this.handleWebSocketError.bind(this)
    });
  }

  start(): void {
    if (this.isActive) return;
    
    this.fetchInterceptor.install();
    this.xhrInterceptor.install();
    this.websocketMonitor.install();
    this.installBeaconInterceptor();
    
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;
    
    this.fetchInterceptor.uninstall();
    this.xhrInterceptor.uninstall();
    this.websocketMonitor.uninstall();
    this.uninstallBeaconInterceptor();
    
    this.isActive = false;
  }

  private handleRequest(type: 'fetch' | 'xhr' | 'beacon', request: NetworkRequest): void {
    const entry: NetworkEntry = {
      id: request.id,
      type,
      request,
      timestamp: request.timestamp
    };

    this.entries.set(request.id, entry);
    
    const storage = this.inspector.getStorage('network');
    storage.push(entry);
    
    this.inspector.getEvents().emit('network:request', {
      ...request,
      type
    });
  }

  private handleResponse(response: NetworkResponse): void {
    const entry = this.entries.get(response.id);
    if (!entry) return;

    entry.response = response;
    entry.duration = response.duration;
    entry.status = response.status;
    entry.size = response.size;

    const storage = this.inspector.getStorage('network');
    storage.push(entry);

    this.inspector.getEvents().emit('network:response', response);
    
    // Check for performance issues
    if (response.duration > 3000) {
      this.inspector.getConfig().onPerformanceIssue?.({
        type: 'slow-network',
        message: `Slow network request: ${entry.request?.url}`,
        duration: response.duration,
        url: entry.request?.url
      });
    }
  }

  private handleError(error: NetworkError): void {
    const entry = this.entries.get(error.id);
    if (!entry) return;

    entry.error = error;

    const storage = this.inspector.getStorage('network');
    storage.push(entry);

    this.inspector.getEvents().emit('network:error', error);
  }

  private handleProgress(progress: { id: string; loaded: number; total: number }): void {
    this.inspector.getEvents().emit('network:progress', progress);
  }

  private handleWebSocketConnection(connection: WebSocketConnection): void {
    const entry: NetworkEntry = {
      id: connection.id,
      type: 'websocket',
      websocket: {
        connection,
        messages: [],
        errors: []
      },
      timestamp: connection.timestamp
    };

    this.entries.set(connection.id, entry);
    
    const storage = this.inspector.getStorage('network');
    storage.push(entry);

    this.inspector.getEvents().emit('network:websocket:connection', connection);
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    const entry = this.entries.get(message.connectionId);
    if (!entry || !entry.websocket) return;

    entry.websocket.messages.push(message);

    this.inspector.getEvents().emit('network:websocket:message', message);
  }

  private handleWebSocketStatusChange(status: { connectionId: string; status: WebSocketConnection['status'] }): void {
    const entry = this.entries.get(status.connectionId);
    if (!entry || !entry.websocket?.connection) return;

    entry.websocket.connection.status = status.status;

    this.inspector.getEvents().emit('network:websocket:status', status);
  }

  private handleWebSocketError(error: WebSocketError): void {
    const entry = this.entries.get(error.connectionId);
    if (!entry || !entry.websocket) return;

    entry.websocket.errors.push(error);

    this.inspector.getEvents().emit('network:websocket:error', error);
  }

  private installBeaconInterceptor(): void {
    if (!navigator.sendBeacon) return;

    const originalSendBeacon = navigator.sendBeacon.bind(navigator);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    navigator.sendBeacon = function(url: string, data?: BodyInit | null): boolean {
      const id = self.generateId();
      const request: NetworkRequest = {
        id,
        method: 'POST',
        url,
        headers: {},
        body: self.sanitizeBeaconData(data),
        timestamp: Date.now(),
        type: 'beacon'
      };

      self.handleRequest('beacon', request);

      const result = originalSendBeacon(url, data);

      // Simulate response for beacon (we don't get actual response)
      setTimeout(() => {
        const response: NetworkResponse = {
          id,
          status: result ? 204 : 0,
          statusText: result ? 'No Content' : 'Failed',
          headers: {},
          size: 0,
          duration: 0,
          timestamp: Date.now()
        };
        self.handleResponse(response);
      }, 0);

      return result;
    };

    this.beaconInterceptor = originalSendBeacon;
  }

  private uninstallBeaconInterceptor(): void {
    if (this.beaconInterceptor && navigator.sendBeacon) {
      navigator.sendBeacon = this.beaconInterceptor;
    }
  }

  private sanitizeBeaconData(data: any): any {
    if (!data) return undefined;
    
    if (typeof data === 'string') {
      return data.length > 1000 ? data.substring(0, 1000) + '...' : data;
    }
    
    if (data instanceof FormData) {
      const entries: Record<string, any> = {};
      data.forEach((value, key) => {
        entries[key] = value instanceof File 
          ? `[File: ${value.name}]` 
          : value;
      });
      return { type: 'FormData', entries };
    }
    
    if (data instanceof Blob) {
      return `[Blob: ${data.size} bytes]`;
    }
    
    if (data instanceof ArrayBuffer) {
      return `[ArrayBuffer: ${data.byteLength} bytes]`;
    }
    
    return data;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  getEntries(): NetworkEntry[] {
    return Array.from(this.entries.values());
  }

  clearEntries(): void {
    this.entries.clear();
  }

  getEntry(id: string): NetworkEntry | undefined {
    return this.entries.get(id);
  }

  filterEntries(predicate: (entry: NetworkEntry) => boolean): NetworkEntry[] {
    return Array.from(this.entries.values()).filter(predicate);
  }
}