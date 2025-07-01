import { DevInspector } from '../../core/inspector';
export declare class FloatingWidget {
    private inspector;
    private element;
    private isDragging;
    private dragOffset;
    private errorCount;
    constructor(inspector: DevInspector);
    private createElement;
    private setupEventListeners;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private snapToEdge;
    private updatePosition;
    private updateAppearance;
    show(): void;
    hide(): void;
    destroy(): void;
    getElement(): HTMLDivElement;
}
