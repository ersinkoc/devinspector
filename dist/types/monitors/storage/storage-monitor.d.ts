import { DevInspector } from '../../core/inspector';
export declare class StorageMonitor {
    private inspector;
    private isActive;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
}
