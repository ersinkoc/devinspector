export const createStyles = (theme: 'dark' | 'light' = 'dark'): string => {
  const colors = theme === 'dark' ? {
    primary: '#1e1e1e',
    secondary: '#2d2d30',
    tertiary: '#3e3e42',
    accent: '#007acc',
    text: '#cccccc',
    textSecondary: '#9d9d9d',
    border: '#3e3e42',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  } : {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e0e0e0',
    accent: '#1976d2',
    text: '#333333',
    textSecondary: '#666666',
    border: '#ddd',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  };

  return `
    .devinspector {
      position: fixed;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: ${colors.text};
      background: ${colors.primary};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      min-width: 300px;
      min-height: 200px;
      resize: both;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .devinspector.fullwidth {
      width: calc(100vw - 40px) !important;
      left: 20px !important;
      right: 20px !important;
    }

    .devinspector.bottom-sidebar {
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      top: auto !important;
      width: 100vw !important;
      height: 40vh !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom: none !important;
      resize: vertical;
    }

    .devinspector.bottom-sidebar .devinspector-header {
      border-radius: 0;
    }

    .devinspector * {
      box-sizing: border-box;
    }

    .devinspector.position-top-left {
      top: 20px;
      left: 20px;
    }

    .devinspector.position-top-right {
      top: 20px;
      right: 20px;
    }

    .devinspector.position-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .devinspector.position-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .devinspector.position-bottom-sidebar {
      bottom: 0;
      left: 0;
      right: 0;
      width: 100vw;
      height: 40vh;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .devinspector.minimized {
      width: 50px !important;
      height: 50px !important;
      overflow: hidden;
      border-radius: 50%;
      cursor: pointer;
    }

    .devinspector.minimized .devinspector-header {
      height: 100%;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
    }

    .devinspector.minimized .devinspector-body,
    .devinspector.minimized .devinspector-tabs,
    .devinspector.minimized .devinspector-title {
      display: none !important;
    }

    .devinspector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      cursor: move;
      user-select: none;
      border-radius: 8px 8px 0 0;
    }

    .devinspector-title {
      font-weight: 600;
      color: ${colors.text};
      margin: 0;
      font-size: 13px;
    }

    .devinspector-controls {
      display: flex;
      gap: 4px;
    }

    .devinspector-control {
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .devinspector-control:hover {
      opacity: 0.8;
      transform: scale(1.1);
    }

    .devinspector-control.minimize {
      background: ${colors.warning};
      color: white;
    }

    .devinspector-control.close {
      background: ${colors.error};
      color: white;
    }

    .devinspector-control.settings {
      background: ${colors.tertiary};
      color: ${colors.text};
    }

    .devinspector-tabs {
      display: flex;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      overflow-x: auto;
    }

    .devinspector-tab {
      padding: 8px 16px;
      background: none;
      border: none;
      color: ${colors.textSecondary};
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .devinspector-tab:hover {
      color: ${colors.text};
      background: ${colors.tertiary};
    }

    .devinspector-tab.active {
      color: ${colors.accent};
      border-bottom-color: ${colors.accent};
      background: ${colors.primary};
    }

    .devinspector-tab-badge {
      display: inline-block;
      background: ${colors.error};
      color: white;
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 10px;
      margin-left: 6px;
      min-width: 16px;
      text-align: center;
    }

    .devinspector-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .devinspector-panel {
      flex: 1;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .devinspector-panel.active {
      display: flex;
    }

    .devinspector-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: ${colors.secondary};
      border-bottom: 1px solid ${colors.border};
      flex-wrap: wrap;
    }

    .devinspector-search {
      flex: 1;
      min-width: 200px;
      padding: 4px 8px;
      border: 1px solid ${colors.border};
      border-radius: 4px;
      background: ${colors.primary};
      color: ${colors.text};
      font-family: inherit;
      font-size: 11px;
    }

    .devinspector-search::placeholder {
      color: ${colors.textSecondary};
    }

    .devinspector-button {
      padding: 4px 8px;
      border: 1px solid ${colors.border};
      border-radius: 4px;
      background: ${colors.tertiary};
      color: ${colors.text};
      cursor: pointer;
      font-family: inherit;
      font-size: 11px;
      transition: all 0.2s ease;
    }

    .devinspector-button:hover {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-button.active {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-content {
      flex: 1;
      overflow: auto;
      padding: 8px;
    }

    .devinspector-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .devinspector-list-item {
      padding: 8px 12px;
      border-bottom: 1px solid ${colors.border};
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .devinspector-list-item:hover {
      background: ${colors.secondary};
    }

    .devinspector-list-item.selected {
      background: ${colors.accent};
      color: white;
    }

    .devinspector-timestamp {
      color: ${colors.textSecondary};
      font-size: 10px;
    }

    .devinspector-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .devinspector-status.success {
      background: ${colors.success};
      color: white;
    }

    .devinspector-status.error {
      background: ${colors.error};
      color: white;
    }

    .devinspector-status.warning {
      background: ${colors.warning};
      color: white;
    }

    .devinspector-status.info {
      background: ${colors.info};
      color: white;
    }

    .devinspector-json {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .devinspector-json .json-key {
      color: ${theme === 'dark' ? '#9cdcfe' : '#0451a5'};
    }

    .devinspector-json .json-string {
      color: ${theme === 'dark' ? '#ce9178' : '#a31515'};
    }

    .devinspector-json .json-number {
      color: ${theme === 'dark' ? '#b5cea8' : '#09885a'};
    }

    .devinspector-json .json-boolean {
      color: ${theme === 'dark' ? '#569cd6' : '#0000ff'};
    }

    .devinspector-json .json-null {
      color: ${theme === 'dark' ? '#569cd6' : '#0000ff'};
    }

    .devinspector-console-entry {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid ${colors.border};
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      line-height: 1.4;
    }

    .devinspector-console-entry.log {
      color: ${colors.text};
    }

    .devinspector-console-entry.info {
      color: ${colors.info};
    }

    .devinspector-console-entry.warn {
      color: ${colors.warning};
    }

    .devinspector-console-entry.error {
      color: ${colors.error};
    }

    .devinspector-console-entry.debug {
      color: ${colors.textSecondary};
    }

    .devinspector-console-level {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      min-width: 40px;
    }

    .devinspector-chart {
      height: 100px;
      background: ${colors.secondary};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      margin: 8px 0;
      position: relative;
    }

    .devinspector-metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: ${colors.secondary};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      margin: 4px 0;
    }

    .devinspector-metric-label {
      font-weight: 500;
      color: ${colors.text};
    }

    .devinspector-metric-value {
      font-weight: bold;
      color: ${colors.accent};
    }

    .devinspector-error-group {
      border-left: 4px solid ${colors.error};
      padding-left: 8px;
      margin: 8px 0;
    }

    .devinspector-error-message {
      font-weight: bold;
      color: ${colors.error};
      margin-bottom: 4px;
    }

    .devinspector-error-stack {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 10px;
      color: ${colors.textSecondary};
      background: ${colors.secondary};
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre;
    }

    .devinspector-resizer {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      cursor: nw-resize;
      background: linear-gradient(
        -45deg,
        transparent 0%,
        transparent 40%,
        ${colors.border} 40%,
        ${colors.border} 60%,
        transparent 60%,
        transparent 100%
      );
    }

    .devinspector-floating-widget {
      position: fixed;
      width: 60px;
      height: 60px;
      background: ${colors.accent};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: all 0.3s ease;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .devinspector-floating-widget:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .devinspector-floating-widget.has-errors {
      background: ${colors.error};
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    /* Scrollbar styles */
    .devinspector *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .devinspector *::-webkit-scrollbar-track {
      background: ${colors.secondary};
    }

    .devinspector *::-webkit-scrollbar-thumb {
      background: ${colors.tertiary};
      border-radius: 4px;
    }

    .devinspector *::-webkit-scrollbar-thumb:hover {
      background: ${colors.accent};
    }
  `;
};