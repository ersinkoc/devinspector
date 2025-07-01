/**
 * Enhanced DevInspector - Beautiful Modern UI (Simplified for Build)
 * @version 1.1.0
 */
export declare class EnhancedDevInspector {
    private data;
    private isRecording;
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
    private renderPerformanceTab;
    private renderErrorsTab;
    private renderRequestDetails;
    private getStatusColor;
    private getMethodColor;
    private getConsoleLevelColor;
    private attachEventListeners;
    private setupEventListeners;
    private setupInterceptors;
    private interceptFetch;
    private interceptXHR;
    private interceptConsole;
    private interceptErrors;
    private setupPerformanceMonitoring;
    show(): void;
    hide(): void;
    toggle(): void;
    minimize(): void;
    clear(type: string): void;
    toggleRecording(): void;
    destroy(): void;
}
export default EnhancedDevInspector;
