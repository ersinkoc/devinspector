import { generateId } from '../../core/utils';

export interface WebSocketConnection {
  id: string;
  url: string;
  protocols?: string | string[];
  timestamp: number;
  readyState: number;
  status: 'connecting' | 'open' | 'closing' | 'closed';
}

export interface WebSocketMessage {
  id: string;
  connectionId: string;
  type: 'sent' | 'received';
  data: any;
  timestamp: number;
  size: number;
}

export interface WebSocketError {
  id: string;
  connectionId: string;
  message: string;
  timestamp: number;
}

type WebSocketEventHandler = {
  onConnection?: (connection: WebSocketConnection) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: { connectionId: string; status: WebSocketConnection['status'] }) => void;
  onError?: (error: WebSocketError) => void;
};

interface ExtendedWebSocket extends WebSocket {
  _devinspectorId?: string;
  _devinspectorUrl?: string;
  _devinspectorProtocols?: string | string[];
}

export class WebSocketMonitor {
  private originalWebSocket: typeof WebSocket;
  private handlers: WebSocketEventHandler;
  private connections: Map<string, WebSocketConnection> = new Map();

  constructor(handlers: WebSocketEventHandler = {}) {
    this.originalWebSocket = window.WebSocket;
    this.handlers = handlers;
  }

  install(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const OriginalWebSocket = this.originalWebSocket;

    window.WebSocket = function(
      url: string | URL,
      protocols?: string | string[]
    ): WebSocket {
      const ws = new OriginalWebSocket(url, protocols) as ExtendedWebSocket;
      const connectionId = generateId();
      
      ws._devinspectorId = connectionId;
      ws._devinspectorUrl = url.toString();
      ws._devinspectorProtocols = protocols;

      const connection: WebSocketConnection = {
        id: connectionId,
        url: url.toString(),
        protocols,
        timestamp: Date.now(),
        readyState: ws.readyState,
        status: 'connecting'
      };

      self.connections.set(connectionId, connection);
      self.handlers.onConnection?.(connection);

      // Monitor open event
      ws.addEventListener('open', function() {
        const conn = self.connections.get(connectionId);
        if (conn) {
          conn.status = 'open';
          conn.readyState = this.readyState;
          self.handlers.onStatusChange?.({ 
            connectionId, 
            status: 'open' 
          });
        }
      });

      // Monitor close event
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ws.addEventListener('close', function(event) {
        const conn = self.connections.get(connectionId);
        if (conn) {
          conn.status = 'closed';
          conn.readyState = this.readyState;
          self.handlers.onStatusChange?.({ 
            connectionId, 
            status: 'closed' 
          });
        }
        self.connections.delete(connectionId);
      });

      // Monitor error event
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ws.addEventListener('error', function(event) {
        const error: WebSocketError = {
          id: generateId(),
          connectionId,
          message: 'WebSocket error occurred',
          timestamp: Date.now()
        };
        self.handlers.onError?.(error);
      });

      // Monitor incoming messages
      ws.addEventListener('message', function(event) {
        const message: WebSocketMessage = {
          id: generateId(),
          connectionId,
          type: 'received',
          data: self.parseMessageData(event.data),
          timestamp: Date.now(),
          size: self.calculateMessageSize(event.data)
        };
        self.handlers.onMessage?.(message);
      });

      // Intercept send method
      const originalSend = ws.send.bind(ws);
      ws.send = function(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        const message: WebSocketMessage = {
          id: generateId(),
          connectionId,
          type: 'sent',
          data: self.parseMessageData(data),
          timestamp: Date.now(),
          size: self.calculateMessageSize(data)
        };
        self.handlers.onMessage?.(message);
        
        return originalSend(data);
      };

      // Intercept close method
      const originalClose = ws.close.bind(ws);
      ws.close = function(code?: number, reason?: string) {
        const conn = self.connections.get(connectionId);
        if (conn) {
          conn.status = 'closing';
          conn.readyState = this.readyState;
          self.handlers.onStatusChange?.({ 
            connectionId, 
            status: 'closing' 
          });
        }
        
        return originalClose(code, reason);
      };

      return ws;
    } as any;

    // Copy static properties
    Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
    Object.setPrototypeOf(window.WebSocket.prototype, OriginalWebSocket.prototype);
    
    // Copy constants
    (window.WebSocket as any).CONNECTING = OriginalWebSocket.CONNECTING;
    (window.WebSocket as any).OPEN = OriginalWebSocket.OPEN;
    (window.WebSocket as any).CLOSING = OriginalWebSocket.CLOSING;
    (window.WebSocket as any).CLOSED = OriginalWebSocket.CLOSED;
  }

  uninstall(): void {
    window.WebSocket = this.originalWebSocket;
    this.connections.clear();
  }

  private parseMessageData(data: any): any {
    if (typeof data === 'string') {
      // Try to parse JSON
      try {
        return JSON.parse(data);
      } catch {
        // Return string as-is, but truncate if too long
        return data.length > 10000 ? data.substring(0, 10000) + '...' : data;
      }
    }
    
    if (data instanceof ArrayBuffer) {
      return `[ArrayBuffer: ${data.byteLength} bytes]`;
    }
    
    if (data instanceof Blob) {
      return `[Blob: ${data.size} bytes, type: ${data.type}]`;
    }
    
    if (ArrayBuffer.isView(data)) {
      return `[ArrayBufferView: ${data.byteLength} bytes]`;
    }
    
    return data;
  }

  private calculateMessageSize(data: any): number {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    
    if (data instanceof Blob) {
      return data.size;
    }
    
    if (ArrayBuffer.isView(data)) {
      return data.byteLength;
    }
    
    return 0;
  }

  getActiveConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  getConnection(id: string): WebSocketConnection | undefined {
    return this.connections.get(id);
  }
}