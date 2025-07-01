export interface StorageEntry<T> {
    id: string;
    timestamp: number;
    data: T;
}
export interface StorageOptions {
    maxSize: number;
    ttl?: number;
    onEvict?: (entry: StorageEntry<any>) => void;
}
export declare class CircularStorage<T> {
    private buffer;
    private head;
    private tail;
    private size;
    private maxSize;
    private ttl?;
    private onEvict?;
    private idCounter;
    constructor(options: StorageOptions);
    push(data: T): string;
    get(id: string): T | undefined;
    getAll(): T[];
    getAllEntries(): StorageEntry<T>[];
    find(predicate: (data: T) => boolean): T | undefined;
    filter(predicate: (data: T) => boolean): T[];
    clear(): void;
    getSize(): number;
    isFull(): boolean;
    private findEntry;
    private isExpired;
    removeExpired(): number;
}
export declare class IndexedStorage<T> {
    private storage;
    private maxSize;
    private ttl?;
    private onEvict?;
    private accessOrder;
    constructor(options: StorageOptions);
    set(key: string, data: T): void;
    get(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    getSize(): number;
    getAllKeys(): string[];
    getAllValues(): T[];
    private updateAccessOrder;
    private isExpired;
    removeExpired(): number;
}
