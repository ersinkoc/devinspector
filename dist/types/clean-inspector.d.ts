/**
 * Clean DevInspector - Modern Clean UI
 * @version 1.1.0
 */
export declare class CleanDevInspector {
    private data;
    private isRecording;
    private widget;
    private panel;
    private isVisible;
    private isMinimized;
    private activeTab;
    private selectedRequest;
    private isResizing;
    private currentWidth;
    private minWidth;
    private maxWidth;
    constructor();
    private init;
    private createFloatingButton;
    private createMainPanel;
    private setupResizing;
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
    private expandToggle;
    show(): void;
    hide(): void;
    toggle(): void;
    minimize(): void;
    clear(type: string): void;
    toggleRecording(): void;
    private setupInterceptors;
    private interceptFetch;
    private interceptXHR;
    private interceptConsole;
    private interceptErrors;
    private setupPerformanceMonitoring;
    destroy(): void;
}
export default CleanDevInspector;
