import { DevInspector } from '../../core/inspector';
import { ErrorTracker, ErrorInfo } from './error-tracker';
import { SourceMapSupport } from './source-map-support';

export class ErrorMonitor {
  private inspector: DevInspector;
  private errorTracker: ErrorTracker;
  private sourceMapSupport: SourceMapSupport;
  private isActive: boolean = false;
  private originalHandlers: {
    error: OnErrorEventHandler | null;
    unhandledrejection: ((event: PromiseRejectionEvent) => any) | null;
  } = {
    error: null,
    unhandledrejection: null
  };

  constructor(inspector: DevInspector) {
    this.inspector = inspector;
    this.errorTracker = new ErrorTracker(this.handleError.bind(this));
    this.sourceMapSupport = new SourceMapSupport();
  }

  start(): void {
    if (this.isActive) return;
    
    this.installErrorHandlers();
    this.isActive = true;
  }

  stop(): void {
    if (!this.isActive) return;
    
    this.uninstallErrorHandlers();
    this.isActive = false;
  }

  private installErrorHandlers(): void {
    // Save original handlers
    this.originalHandlers.error = window.onerror;
    this.originalHandlers.unhandledrejection = window.onunhandledrejection;

    // Install error handler
    window.onerror = (message, source, lineno, colno, error) => {
      const errorEvent = new ErrorEvent('error', {
        message: String(message),
        filename: source,
        lineno,
        colno,
        error
      });

      this.errorTracker.trackError(errorEvent, 'error');

      // Call original handler if exists
      if (this.originalHandlers.error) {
        return this.originalHandlers.error(message, source, lineno, colno, error);
      }

      return true; // Prevent default browser error handling
    };

    // Install unhandled rejection handler
    window.onunhandledrejection = (event) => {
      this.errorTracker.trackError(event, 'unhandledRejection');

      // Call original handler if exists
      if (this.originalHandlers.unhandledrejection) {
        return this.originalHandlers.unhandledrejection(event);
      }

      return true; // Prevent default browser error handling
    };

    // Also use addEventListener for better coverage
    window.addEventListener('error', this.handleErrorEvent);
    window.addEventListener('unhandledrejection', this.handleRejectionEvent);
  }

  private uninstallErrorHandlers(): void {
    // Restore original handlers
    window.onerror = this.originalHandlers.error;
    window.onunhandledrejection = this.originalHandlers.unhandledrejection;

    // Remove event listeners
    window.removeEventListener('error', this.handleErrorEvent);
    window.removeEventListener('unhandledrejection', this.handleRejectionEvent);
  }

  private handleErrorEvent = (event: ErrorEvent): void => {
    this.errorTracker.trackError(event, 'error');
  };

  private handleRejectionEvent = (event: PromiseRejectionEvent): void => {
    this.errorTracker.trackError(event, 'unhandledRejection');
  };

  private async handleError(errorInfo: ErrorInfo): Promise<void> {
    // Enhance stack trace with source maps if available
    if (errorInfo.stack && this.sourceMapSupport.isEnabled()) {
      try {
        errorInfo.stack = await this.sourceMapSupport.enhanceStackTrace(errorInfo.stack);
      } catch (error) {
        console.debug('Failed to enhance stack trace:', error);
      }
    }

    // Store in circular buffer
    const storage = this.inspector.getStorage('error');
    storage.push(errorInfo);

    // Emit events
    this.inspector.getEvents().emit(
      errorInfo.type === 'unhandledRejection' ? 'error:uncaught' : 'error:caught',
      errorInfo
    );

    // Call error callback
    this.inspector.getConfig().onError?.(new Error(errorInfo.message));

    // Log to console in development
    if (this.inspector.getConfig().enabled) {
      console.error('[DevInspector] Error captured:', errorInfo);
    }
  }

  // Public API
  trackError(error: Error): void {
    this.errorTracker.trackError(error);
  }

  getErrorGroups() {
    return this.errorTracker.getGroups();
  }

  getErrorStats() {
    return this.errorTracker.getErrorStats();
  }

  clearErrors(): void {
    this.errorTracker.clearGroups();
    const storage = this.inspector.getStorage('error');
    storage.clear();
  }

  addIgnorePattern(pattern: RegExp): void {
    this.errorTracker.addIgnorePattern(pattern);
  }

  enableSourceMaps(enabled: boolean): void {
    this.sourceMapSupport.setEnabled(enabled);
  }
}