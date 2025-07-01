import { generateId, parseStackFrame } from '../../core/utils';

export interface ErrorInfo {
  id: string;
  type: 'error' | 'unhandledRejection';
  message: string;
  stack?: string[];
  stackFrames?: Array<{
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
  }>;
  source?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  errorObject?: any;
  groupId?: string;
  count: number;
}

export interface ErrorGroup {
  id: string;
  fingerprint: string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  errors: ErrorInfo[];
}

export type ErrorCallback = (error: ErrorInfo) => void;

export class ErrorTracker {
  private callback: ErrorCallback;
  private groups: Map<string, ErrorGroup> = new Map();
  private seenErrors: WeakSet<Error> = new WeakSet();
  private ignorePatterns: RegExp[] = [];

  constructor(callback: ErrorCallback) {
    this.callback = callback;
    this.setupDefaultIgnorePatterns();
  }

  private setupDefaultIgnorePatterns(): void {
    this.ignorePatterns = [
      /ResizeObserver loop limit exceeded/,
      /ResizeObserver loop completed with undelivered notifications/,
      /Non-Error promise rejection captured/,
      /Network request failed/,
      /Failed to fetch/,
      /Load failed/,
      /Script error/
    ];
  }

  addIgnorePattern(pattern: RegExp): void {
    this.ignorePatterns.push(pattern);
  }

  trackError(error: Error | ErrorEvent | PromiseRejectionEvent, type: 'error' | 'unhandledRejection' = 'error'): void {
    // Avoid tracking the same error multiple times
    if (error instanceof Error && this.seenErrors.has(error)) {
      return;
    }

    const errorInfo = this.createErrorInfo(error, type);
    
    // Check if error should be ignored
    if (this.shouldIgnoreError(errorInfo)) {
      return;
    }

    // Mark error as seen
    if (error instanceof Error) {
      this.seenErrors.add(error);
    }

    // Group similar errors
    const group = this.groupError(errorInfo);
    errorInfo.groupId = group.id;

    this.callback(errorInfo);
  }

  private createErrorInfo(error: Error | ErrorEvent | PromiseRejectionEvent, type: 'error' | 'unhandledRejection'): ErrorInfo {
    let message = '';
    let stack: string[] = [];
    let source: string | undefined;
    let lineno: number | undefined;
    let colno: number | undefined;
    let errorObject: any;

    if (error instanceof Error) {
      message = error.message || error.toString();
      stack = error.stack ? error.stack.split('\n').map(line => line.trim()) : [];
      errorObject = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if ('message' in error && error instanceof ErrorEvent) {
      message = error.message;
      source = error.filename;
      lineno = error.lineno;
      colno = error.colno;
      
      if (error.error) {
        stack = error.error.stack ? error.error.stack.split('\n').map(line => line.trim()) : [];
        errorObject = error.error;
      }
    } else if ('reason' in error && error instanceof PromiseRejectionEvent) {
      const reason = error.reason;
      
      if (reason instanceof Error) {
        message = reason.message || reason.toString();
        stack = reason.stack ? reason.stack.split('\n').map(line => line.trim()) : [];
        errorObject = reason;
      } else {
        message = String(reason);
        errorObject = reason;
      }
    }

    // Parse stack frames
    const stackFrames = stack
      .map(frame => parseStackFrame(frame))
      .filter(frame => frame !== null) as ErrorInfo['stackFrames'];

    const errorInfo: ErrorInfo = {
      id: generateId(),
      type,
      message,
      stack,
      stackFrames,
      source,
      lineno,
      colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorObject,
      count: 1
    };

    return errorInfo;
  }

  private shouldIgnoreError(errorInfo: ErrorInfo): boolean {
    // Check ignore patterns
    for (const pattern of this.ignorePatterns) {
      if (pattern.test(errorInfo.message)) {
        return true;
      }
    }

    // Ignore cross-origin script errors without useful information
    if (errorInfo.message === 'Script error.' && !errorInfo.stack?.length) {
      return true;
    }

    // Ignore errors from browser extensions
    if (errorInfo.source && (
      errorInfo.source.includes('extension://') ||
      errorInfo.source.includes('chrome-extension://') ||
      errorInfo.source.includes('moz-extension://')
    )) {
      return true;
    }

    return false;
  }

  private groupError(errorInfo: ErrorInfo): ErrorGroup {
    const fingerprint = this.generateFingerprint(errorInfo);
    
    let group = this.groups.get(fingerprint);
    
    if (!group) {
      group = {
        id: generateId(),
        fingerprint,
        message: errorInfo.message,
        count: 0,
        firstSeen: errorInfo.timestamp,
        lastSeen: errorInfo.timestamp,
        errors: []
      };
      this.groups.set(fingerprint, group);
    }

    group.count++;
    group.lastSeen = errorInfo.timestamp;
    group.errors.push(errorInfo);

    // Keep only last 10 errors in each group
    if (group.errors.length > 10) {
      group.errors.shift();
    }

    return group;
  }

  private generateFingerprint(errorInfo: ErrorInfo): string {
    // Create a fingerprint based on error characteristics
    const parts: string[] = [
      errorInfo.type,
      this.normalizeMessage(errorInfo.message)
    ];

    // Add top stack frame if available
    if (errorInfo.stackFrames && errorInfo.stackFrames.length > 0) {
      const topFrame = errorInfo.stackFrames[0];
      if (topFrame.fileName) {
        parts.push(topFrame.fileName);
        if (topFrame.functionName) {
          parts.push(topFrame.functionName);
        }
      }
    } else if (errorInfo.source) {
      parts.push(errorInfo.source);
    }

    return parts.join('|');
  }

  private normalizeMessage(message: string): string {
    // Remove dynamic parts from error messages for better grouping
    return message
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '<URL>')
      // Remove numbers
      .replace(/\b\d+\b/g, '<NUM>')
      // Remove UUIDs
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
      // Remove quotes content
      .replace(/"[^"]*"/g, '"<STRING>"')
      .replace(/'[^']*'/g, "'<STRING>'")
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  getGroups(): ErrorGroup[] {
    return Array.from(this.groups.values())
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  getGroup(groupId: string): ErrorGroup | undefined {
    for (const group of this.groups.values()) {
      if (group.id === groupId) {
        return group;
      }
    }
    return undefined;
  }

  clearGroups(): void {
    this.groups.clear();
  }

  getErrorStats(): {
    totalErrors: number;
    totalGroups: number;
    errorsByType: Record<string, number>;
    recentErrors: ErrorInfo[];
  } {
    let totalErrors = 0;
    const errorsByType: Record<string, number> = {};
    const recentErrors: ErrorInfo[] = [];

    for (const group of this.groups.values()) {
      totalErrors += group.count;
      
      for (const error of group.errors) {
        errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
        recentErrors.push(error);
      }
    }

    // Sort by timestamp and take last 10
    recentErrors.sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalErrors,
      totalGroups: this.groups.size,
      errorsByType,
      recentErrors: recentErrors.slice(0, 10)
    };
  }
}