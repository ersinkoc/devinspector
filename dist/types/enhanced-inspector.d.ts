/**
 * Enhanced DevInspector with Beautiful Modern UI
 * @version 1.1.0
 */
export declare class EnhancedDevInspector {
    private data;
    private subscribers;
    private isRecording;
    private filters;
    private widget;
    private panel;
    private isVisible;
    private isMinimized;
    private activeTab;
    private selectedRequest;
    constructor();
    private init;
    private createFloatingButton;
    private createMainPanel;
    private renderPanel;
    private renderTabs;
    private renderTabContent;
    private renderNetworkTab;
    private renderNetworkRequest;
    private renderConsoleTab;
    private renderConsoleLog;
    private renderPerformanceTab;
    private renderPerformanceMetric;
    private renderErrorsTab;
    private renderError;
    private renderRequestDetails;
    private getStatusColor;
    private getMethodColor;
    private getConsoleLevelColor;
    private getIcon;
    private attachPanelEventListeners;
    private setupEventListeners;
    private getPageLoadTime;
    private getDOMContentLoadedTime;
    private getFirstPaintTime;
    show(): void;
    hide(): void;
    toggle(): void;
    minimize(): void;
    clear(type: string): void;
    toggleRecording(): void;
    private emit;
    private setupInterceptors;
    private interceptFetch;
    private interceptXHR;
    private interceptConsole;
    private interceptErrors;
    private setupPerformanceMonitoring;
    destroy(): void;
}
export default EnhancedDevInspector;
