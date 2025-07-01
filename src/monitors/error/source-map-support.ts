interface SourceMapPosition {
  source: string;
  line: number;
  column: number;
  name?: string;
}

interface SourceMapCache {
  [url: string]: any;
}

export class SourceMapSupport {
  private cache: SourceMapCache = {};
  private enabled: boolean = true;
  private sourceMapUrlRegex = /\/\/# sourceMappingURL=(.+)$/;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): boolean {
    // Check if we can fetch source maps
    this.enabled = typeof fetch !== 'undefined' && 'URL' in window;
    return this.enabled;
  }

  async enhanceStackTrace(stack: string[]): Promise<string[]> {
    if (!this.enabled) return stack;

    const enhancedStack: string[] = [];
    
    for (const frame of stack) {
      const enhanced = await this.enhanceStackFrame(frame);
      enhancedStack.push(enhanced);
    }

    return enhancedStack;
  }

  private async enhanceStackFrame(frame: string): Promise<string> {
    // Parse the stack frame
    const match = frame.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
    
    if (!match) return frame;

    const [, functionName, fileUrl, line, column] = match;
    const lineNumber = parseInt(line, 10);
    const columnNumber = parseInt(column, 10);

    try {
      // Check if this is a local file or has source map
      const sourceMapUrl = await this.findSourceMapUrl(fileUrl);
      if (!sourceMapUrl) return frame;

      // Load and parse source map
      const sourceMap = await this.loadSourceMap(fileUrl, sourceMapUrl);
      if (!sourceMap) return frame;

      // Get original position
      const originalPosition = this.getOriginalPosition(
        sourceMap,
        lineNumber,
        columnNumber
      );

      if (originalPosition) {
        const functionPart = functionName ? `${functionName} ` : '';
        return `at ${functionPart}(${originalPosition.source}:${originalPosition.line}:${originalPosition.column})`;
      }
    } catch (error) {
      // Failed to enhance, return original frame
      console.debug('Failed to enhance stack frame:', error);
    }

    return frame;
  }

  private async findSourceMapUrl(fileUrl: string): Promise<string | null> {
    // Check cache first
    if (this.cache[fileUrl]) {
      return this.cache[fileUrl].sourceMapUrl;
    }

    try {
      // For inline source maps or data URLs, skip
      if (fileUrl.startsWith('data:') || fileUrl.includes('blob:')) {
        return null;
      }

      // Try to fetch the file to look for source map comment
      const response = await fetch(fileUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) return null;

      const text = await response.text();
      const lastLines = text.split('\n').slice(-5).join('\n');
      
      const match = lastLines.match(this.sourceMapUrlRegex);
      if (!match) return null;

      const sourceMapUrl = match[1];
      
      // Handle relative URLs
      if (sourceMapUrl.startsWith('data:')) {
        return sourceMapUrl;
      }

      const absoluteUrl = new URL(sourceMapUrl, fileUrl).href;
      return absoluteUrl;
    } catch (error) {
      return null;
    }
  }

  private async loadSourceMap(fileUrl: string, sourceMapUrl: string): Promise<any> {
    // Check cache
    if (this.cache[fileUrl]?.sourceMap) {
      return this.cache[fileUrl].sourceMap;
    }

    try {
      let sourceMapData: string;

      if (sourceMapUrl.startsWith('data:')) {
        // Inline source map
        const base64 = sourceMapUrl.split(',')[1];
        sourceMapData = atob(base64);
      } else {
        // External source map
        const response = await fetch(sourceMapUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) return null;
        sourceMapData = await response.text();
      }

      const sourceMap = JSON.parse(sourceMapData);
      
      // Cache it
      this.cache[fileUrl] = {
        sourceMapUrl,
        sourceMap
      };

      return sourceMap;
    } catch (error) {
      return null;
    }
  }

  private getOriginalPosition(
    sourceMap: any,
    line: number,
    column: number
  ): SourceMapPosition | null {
    // This is a simplified source map lookup
    // In a real implementation, you'd use a proper source map library
    
    if (!sourceMap.mappings || !sourceMap.sources) {
      return null;
    }

    // For now, return a simple mapping
    // Real implementation would decode VLQ mappings
    return {
      source: sourceMap.sources[0] || 'unknown',
      line: line,
      column: column,
      name: sourceMap.names?.[0]
    };
  }

  clearCache(): void {
    this.cache = {};
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled && this.checkSupport();
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}