import { DevInspector } from '../../core/inspector';
export declare class DOMMonitor {
    private inspector;
    private isActive;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
}
