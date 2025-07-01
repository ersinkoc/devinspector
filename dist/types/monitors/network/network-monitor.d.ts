import { DevInspector } from '../../core/inspector';
import { NetworkRequest, NetworkResponse, NetworkError } from './fetch-interceptor';
import { WebSocketConnection, WebSocketMessage, WebSocketError } from './websocket-monitor';
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
export declare class NetworkMonitor {
    private inspector;
    private fetchInterceptor;
    private xhrInterceptor;
    private websocketMonitor;
    private beaconInterceptor;
    private entries;
    private isActive;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
    private handleRequest;
    private handleResponse;
    private handleError;
    private handleProgress;
    private handleWebSocketConnection;
    private handleWebSocketMessage;
    private handleWebSocketStatusChange;
    private handleWebSocketError;
    private installBeaconInterceptor;
    private uninstallBeaconInterceptor;
    private sanitizeBeaconData;
    private generateId;
    getEntries(): NetworkEntry[];
    clearEntries(): void;
    getEntry(id: string): NetworkEntry | undefined;
    filterEntries(predicate: (entry: NetworkEntry) => boolean): NetworkEntry[];
}
