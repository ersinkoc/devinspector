export interface SimpleConfig {
    enabled?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    theme?: 'dark' | 'light';
}
export declare class SimpleDevInspector {
    private config;
    private widget;
    private panel;
    private isVisible;
    constructor(config?: SimpleConfig);
    private init;
    private createWidget;
    private createPanel;
    private setupEventListeners;
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
    track(name: string, data: any): void;
    markStart(name: string): void;
    markEnd(name: string): void;
}
export default SimpleDevInspector;
