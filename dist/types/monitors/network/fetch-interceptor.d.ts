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
export declare class FetchInterceptor {
    private originalFetch;
    private handlers;
    private requestMap;
    constructor(handlers?: NetworkEventHandler);
    install(): void;
    uninstall(): void;
    private extractBody;
    private extractResponseBody;
    private sanitizeBody;
    private calculateSize;
    private isFromCache;
}
export {};
