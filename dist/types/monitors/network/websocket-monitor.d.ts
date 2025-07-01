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
    onStatusChange?: (status: {
        connectionId: string;
        status: WebSocketConnection['status'];
    }) => void;
    onError?: (error: WebSocketError) => void;
};
export declare class WebSocketMonitor {
    private originalWebSocket;
    private handlers;
    private connections;
    constructor(handlers?: WebSocketEventHandler);
    install(): void;
    uninstall(): void;
    private parseMessageData;
    private calculateMessageSize;
    getActiveConnections(): WebSocketConnection[];
    getConnection(id: string): WebSocketConnection | undefined;
}
export {};
