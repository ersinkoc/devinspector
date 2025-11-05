import { ConsoleMonitor } from '../../src/monitors/console/console-monitor';
import { DevInspector } from '../../src/core/inspector';

describe('ConsoleMonitor', () => {
  let inspector: DevInspector;
  let consoleMonitor: ConsoleMonitor;

  beforeEach(() => {
    inspector = new DevInspector({ enabled: false });
    consoleMonitor = new ConsoleMonitor(inspector);
  });

  afterEach(() => {
    inspector.destroy();
  });

  describe('navigateHistory', () => {
    it('should return undefined when history is empty', () => {
      expect(consoleMonitor.navigateHistory('up')).toBeUndefined();
      expect(consoleMonitor.navigateHistory('down')).toBeUndefined();
    });

    it('should navigate up through history', () => {
      consoleMonitor.executeCommand('cmd1');
      consoleMonitor.executeCommand('cmd2');
      consoleMonitor.executeCommand('cmd3');

      expect(consoleMonitor.navigateHistory('up')).toBe('cmd3');
      expect(consoleMonitor.navigateHistory('up')).toBe('cmd2');
      expect(consoleMonitor.navigateHistory('up')).toBe('cmd1');
      expect(consoleMonitor.navigateHistory('up')).toBe('cmd1'); // Stay at first
    });

    it('should navigate down through history', () => {
      consoleMonitor.executeCommand('cmd1');
      consoleMonitor.executeCommand('cmd2');
      consoleMonitor.executeCommand('cmd3');

      // Navigate up
      consoleMonitor.navigateHistory('up');
      consoleMonitor.navigateHistory('up');
      consoleMonitor.navigateHistory('up');

      // Navigate down
      expect(consoleMonitor.navigateHistory('down')).toBe('cmd2');
      expect(consoleMonitor.navigateHistory('down')).toBe('cmd3');
    });

    it('should allow navigating down past last command to empty input', () => {
      // Bug fix: should allow going one position beyond array length
      consoleMonitor.executeCommand('cmd1');
      consoleMonitor.executeCommand('cmd2');

      // Navigate up
      consoleMonitor.navigateHistory('up');
      consoleMonitor.navigateHistory('up');

      // Navigate down past last command
      consoleMonitor.navigateHistory('down');
      const result = consoleMonitor.navigateHistory('down');

      // Should return undefined (empty input) when going past last command
      expect(result).toBeUndefined();
    });
  });

  describe('getHistory', () => {
    it('should return command history', () => {
      consoleMonitor.executeCommand('cmd1');
      consoleMonitor.executeCommand('cmd2');

      const history = consoleMonitor.getHistory();
      expect(history).toEqual(['cmd1', 'cmd2']);
    });

    it('should return a copy of history', () => {
      consoleMonitor.executeCommand('cmd1');

      const history1 = consoleMonitor.getHistory();
      consoleMonitor.executeCommand('cmd2');
      const history2 = consoleMonitor.getHistory();

      expect(history1).toEqual(['cmd1']);
      expect(history2).toEqual(['cmd1', 'cmd2']);
    });
  });
});
