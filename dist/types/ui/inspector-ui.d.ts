import { DevInspector } from '../core/inspector';
export declare class DevInspectorUI {
    private inspector;
    private floatingWidget;
    private mainPanel;
    private styleElement;
    private isVisible;
    private isMinimized;
    constructor(inspector: DevInspector);
    init(): Promise<void>;
    private injectStyles;
    private setupTabs;
    private createNetworkPanel;
    private createConsolePanel;
    private createPerformancePanel;
    private createErrorsPanel;
    private setupEventListeners;
    private addNetworkEntry;
    private updateNetworkEntry;
    private addConsoleEntry;
    private addErrorEntry;
    private updatePerformanceMetrics;
    private formatConsoleArgs;
    show(): void;
    hide(): void;
    minimize(): void;
    destroy(): void;
    getElement(): HTMLElement;
}
