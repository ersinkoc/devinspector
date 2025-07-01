import { NetworkRequest, NetworkResponse, NetworkError } from './fetch-interceptor';
type XHREventHandler = {
    onRequest?: (request: NetworkRequest) => void;
    onResponse?: (response: NetworkResponse) => void;
    onError?: (error: NetworkError) => void;
    onProgress?: (progress: {
        id: string;
        loaded: number;
        total: number;
    }) => void;
};
export declare class XHRInterceptor {
    private originalOpen;
    private originalSend;
    private originalSetRequestHeader;
    private handlers;
    constructor(handlers?: XHREventHandler);
    install(): void;
    uninstall(): void;
    private sanitizeBody;
    private parseResponseHeaders;
    private extractResponseBody;
    private calculateSize;
}
export {};
