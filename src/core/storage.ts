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

export class CircularStorage<T> {
  private buffer: (StorageEntry<T> | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;
  private maxSize: number;
  private ttl?: number;
  private onEvict?: (entry: StorageEntry<T>) => void;
  private idCounter: number = 0;

  constructor(options: StorageOptions) {
    this.maxSize = options.maxSize;
    this.ttl = options.ttl;
    this.onEvict = options.onEvict;
    this.buffer = new Array(this.maxSize);
  }

  push(data: T): string {
    const id = `${Date.now()}-${++this.idCounter}`;
    const entry: StorageEntry<T> = {
      id,
      timestamp: Date.now(),
      data
    };

    if (this.size === this.maxSize) {
      const evictedEntry = this.buffer[this.tail];
      if (evictedEntry && this.onEvict) {
        this.onEvict(evictedEntry);
      }
      this.tail = (this.tail + 1) % this.maxSize;
    } else {
      this.size++;
    }

    this.buffer[this.head] = entry;
    this.head = (this.head + 1) % this.maxSize;

    return id;
  }

  get(id: string): T | undefined {
    const entry = this.findEntry(id);
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }
    return undefined;
  }

  getAll(): T[] {
    return this.getAllEntries().map(entry => entry.data);
  }

  getAllEntries(): StorageEntry<T>[] {
    const entries: StorageEntry<T>[] = [];
    const now = Date.now();

    for (let i = 0; i < this.size; i++) {
      const index = (this.tail + i) % this.maxSize;
      const entry = this.buffer[index];
      if (entry && !this.isExpired(entry, now)) {
        entries.push(entry);
      }
    }

    return entries;
  }

  find(predicate: (data: T) => boolean): T | undefined {
    const entries = this.getAllEntries();
    for (const entry of entries) {
      if (predicate(entry.data)) {
        return entry.data;
      }
    }
    return undefined;
  }

  filter(predicate: (data: T) => boolean): T[] {
    return this.getAllEntries()
      .filter(entry => predicate(entry.data))
      .map(entry => entry.data);
  }

  clear(): void {
    this.buffer = new Array(this.maxSize);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  getSize(): number {
    return this.size;
  }

  isFull(): boolean {
    return this.size === this.maxSize;
  }

  private findEntry(id: string): StorageEntry<T> | undefined {
    for (let i = 0; i < this.size; i++) {
      const index = (this.tail + i) % this.maxSize;
      const entry = this.buffer[index];
      if (entry && entry.id === id) {
        return entry;
      }
    }
    return undefined;
  }

  private isExpired(entry: StorageEntry<T>, now: number = Date.now()): boolean {
    if (!this.ttl) return false;
    return now - entry.timestamp > this.ttl;
  }

  removeExpired(): number {
    if (!this.ttl) return 0;

    const now = Date.now();
    let removedCount = 0;
    const validEntries: StorageEntry<T>[] = [];

    for (let i = 0; i < this.size; i++) {
      const index = (this.tail + i) % this.maxSize;
      const entry = this.buffer[index];
      if (entry && !this.isExpired(entry, now)) {
        validEntries.push(entry);
      } else if (entry && this.onEvict) {
        this.onEvict(entry);
        removedCount++;
      }
    }

    this.buffer = new Array(this.maxSize);
    this.size = validEntries.length;
    this.tail = 0;
    this.head = this.size;

    validEntries.forEach((entry, i) => {
      this.buffer[i] = entry;
    });

    return removedCount;
  }
}

export class IndexedStorage<T> {
  private storage: Map<string, StorageEntry<T>> = new Map();
  private maxSize: number;
  private ttl?: number;
  private onEvict?: (entry: StorageEntry<T>) => void;
  private accessOrder: string[] = [];

  constructor(options: StorageOptions) {
    this.maxSize = options.maxSize;
    this.ttl = options.ttl;
    this.onEvict = options.onEvict;
  }

  set(key: string, data: T): void {
    const entry: StorageEntry<T> = {
      id: key,
      timestamp: Date.now(),
      data
    };

    if (this.storage.has(key)) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    } else if (this.storage.size >= this.maxSize) {
      const evictKey = this.accessOrder.shift();
      if (evictKey) {
        const evictedEntry = this.storage.get(evictKey);
        if (evictedEntry && this.onEvict) {
          this.onEvict(evictedEntry);
        }
        this.storage.delete(evictKey);
      }
    }

    this.storage.set(key, entry);
    this.accessOrder.push(key);
  }

  get(key: string): T | undefined {
    const entry = this.storage.get(key);
    if (entry && !this.isExpired(entry)) {
      this.updateAccessOrder(key);
      return entry.data;
    } else if (entry) {
      this.delete(key);
    }
    return undefined;
  }

  has(key: string): boolean {
    const entry = this.storage.get(key);
    if (entry && !this.isExpired(entry)) {
      return true;
    } else if (entry) {
      this.delete(key);
    }
    return false;
  }

  delete(key: string): boolean {
    const entry = this.storage.get(key);
    if (entry) {
      if (this.onEvict) {
        this.onEvict(entry);
      }
      this.storage.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      return true;
    }
    return false;
  }

  clear(): void {
    if (this.onEvict) {
      this.storage.forEach(entry => this.onEvict!(entry));
    }
    this.storage.clear();
    this.accessOrder = [];
  }

  getSize(): number {
    return this.storage.size;
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  getAllValues(): T[] {
    return Array.from(this.storage.values())
      .filter(entry => !this.isExpired(entry))
      .map(entry => entry.data);
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private isExpired(entry: StorageEntry<T>): boolean {
    if (!this.ttl) return false;
    return Date.now() - entry.timestamp > this.ttl;
  }

  removeExpired(): number {
    let removedCount = 0;
    const expiredKeys: string[] = [];

    this.storage.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      if (this.delete(key)) {
        removedCount++;
      }
    });

    return removedCount;
  }
}