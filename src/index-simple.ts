/**
 * DevInspector - Professional Developer Debugging Tool
 * @version 1.1.0
 * @description Zero-dependency framework-agnostic debugging tool with beautiful modern UI
 */

// Clean UI version (main export)
export { CleanDevInspector as DevInspector } from './clean-inspector';
export { CleanDevInspector } from './clean-inspector';

// Enhanced UI version
export { EnhancedDevInspector } from './enhanced-simple';

// Simple version
export { SimpleDevInspector } from './simple-inspector';

// Default export for convenience (clean version)
import { CleanDevInspector } from './clean-inspector';
export default CleanDevInspector;