export class LogFormatter {
  formatArgs(args: any[]): any[] {
    return args.map(arg => this.formatValue(arg));
  }

  formatArgsAsText(args: any[]): string {
    return args.map(arg => this.formatValueAsText(arg)).join(' ');
  }

  private formatValue(value: any): any {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return value;
    }
    
    if (value instanceof Error) {
      return {
        type: 'error',
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    
    if (value instanceof Date) {
      return {
        type: 'date',
        value: value.toISOString()
      };
    }
    
    if (value instanceof RegExp) {
      return {
        type: 'regexp',
        value: value.toString()
      };
    }
    
    if (value instanceof Set) {
      return {
        type: 'set',
        size: value.size,
        values: Array.from(value).slice(0, 100)
      };
    }
    
    if (value instanceof Map) {
      return {
        type: 'map',
        size: value.size,
        entries: Array.from(value.entries()).slice(0, 100)
      };
    }
    
    if (value instanceof WeakSet || value instanceof WeakMap) {
      return {
        type: value instanceof WeakSet ? 'weakset' : 'weakmap',
        value: '[WeakCollection]'
      };
    }
    
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
      return {
        type: 'arraybuffer',
        byteLength: value.byteLength
      };
    }
    
    if (typeof value === 'function') {
      return {
        type: 'function',
        name: value.name || '<anonymous>',
        value: value.toString().substring(0, 100)
      };
    }
    
    if (Array.isArray(value)) {
      return {
        type: 'array',
        length: value.length,
        value: value.slice(0, 100).map(v => this.formatValue(v))
      };
    }
    
    if (type === 'object') {
      // Check if it's a formatted object from interceptor
      if (value.type && typeof value.value !== 'undefined') {
        return value;
      }
      
      try {
        const proto = Object.getPrototypeOf(value);
        const constructorName = proto?.constructor?.name || 'Object';
        
        const entries = Object.entries(value).slice(0, 100);
        const formatted: any = {
          type: 'object',
          constructor: constructorName,
          value: {}
        };
        
        for (const [key, val] of entries) {
          formatted.value[key] = this.formatValue(val);
        }
        
        if (Object.keys(value).length > 100) {
          formatted.truncated = true;
          formatted.totalKeys = Object.keys(value).length;
        }
        
        return formatted;
      } catch (error) {
        return {
          type: 'object',
          value: '[Complex Object]'
        };
      }
    }
    
    return String(value);
  }

  private formatValueAsText(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    if (type === 'string') return `"${value}"`;
    if (type === 'number' || type === 'boolean') return String(value);
    
    if (value.type) {
      switch (value.type) {
        case 'error':
          return `${value.name}: ${value.message}`;
        case 'date':
          return value.value;
        case 'regexp':
          return value.value;
        case 'function':
          return `[Function: ${value.name}]`;
        case 'array':
          return `Array(${value.length})`;
        case 'object':
          return value.constructor ? `${value.constructor} {...}` : 'Object {...}';
        case 'set':
          return `Set(${value.size})`;
        case 'map':
          return `Map(${value.size})`;
        default:
          return JSON.stringify(value.value);
      }
    }
    
    return JSON.stringify(value);
  }

  formatStackTrace(stack: string[]): string {
    return stack.map((frame, index) => {
      // Remove leading "at " if present
      const cleanFrame = frame.replace(/^\s*at\s+/, '');
      
      // Add indentation
      return '  '.repeat(index) + cleanFrame;
    }).join('\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  highlightSyntax(code: string, language: 'javascript' | 'json' = 'javascript'): string {
    // Simple syntax highlighting for console display
    // In a real implementation, you might use a proper syntax highlighter
    
    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while',
      'return', 'new', 'this', 'typeof', 'instanceof', 'try', 'catch', 'finally',
      'throw', 'async', 'await', 'import', 'export', 'default'
    ];
    
    let highlighted = code;
    
    // Highlight strings
    highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    // Highlight comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    
    return highlighted;
  }
}