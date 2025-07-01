export declare class LogFormatter {
    formatArgs(args: any[]): any[];
    formatArgsAsText(args: any[]): string;
    private formatValue;
    private formatValueAsText;
    formatStackTrace(stack: string[]): string;
    highlightSyntax(code: string, language?: 'javascript' | 'json'): string;
}
