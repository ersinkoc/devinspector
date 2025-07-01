import { DevInspector } from '../../core/inspector';
export declare class StateMonitor {
    private inspector;
    private isActive;
    constructor(inspector: DevInspector);
    start(): void;
    stop(): void;
}
