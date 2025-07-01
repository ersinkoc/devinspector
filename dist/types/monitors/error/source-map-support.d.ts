export declare class SourceMapSupport {
    private cache;
    private enabled;
    private sourceMapUrlRegex;
    constructor();
    private checkSupport;
    enhanceStackTrace(stack: string[]): Promise<string[]>;
    private enhanceStackFrame;
    private findSourceMapUrl;
    private loadSourceMap;
    private getOriginalPosition;
    clearCache(): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}
