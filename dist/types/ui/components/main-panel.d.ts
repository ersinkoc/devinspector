import { DevInspector } from '../../core/inspector';
export interface TabConfig {
    id: string;
    label: string;
    badge?: () => number;
    content: HTMLElement;
}
export declare class MainPanel {
    private inspector;
    private element;
    private headerElement;
    private tabsElement;
    private bodyElement;
    private tabs;
    private activeTab;
    private isDragging;
    private dragOffset;
    private isResizing;
    constructor(inspector: DevInspector);
    private createElement;
    private setupEventListeners;
    private handleHeaderMouseDown;
    private handleResizerMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private updatePosition;
    private showSettings;
    addTab(config: TabConfig): void;
    removeTab(tabId: string): void;
    setActiveTab(tabId: string): void;
    private updateBadges;
    show(): void;
    hide(): void;
    minimize(): void;
    destroy(): void;
    getElement(): HTMLDivElement;
    getActiveTab(): string | null;
}
