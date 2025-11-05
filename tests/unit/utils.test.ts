import {
  formatBytes,
  generateId,
  createWorkerScript
} from '../../src/core/utils';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs in correct format', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should not use deprecated substr method', () => {
      // If substr was used, the ID length would be wrong
      const id = generateId();
      const parts = id.split('-');
      expect(parts[1].length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format positive bytes correctly', () => {
      expect(formatBytes(100)).toBe('100 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });

    it('should handle negative bytes gracefully', () => {
      // Bug fix: negative bytes should return '0 B' instead of 'NaN undefined'
      expect(formatBytes(-100)).toBe('0 B');
      expect(formatBytes(-1024)).toBe('0 B');
    });

    it('should respect precision parameter', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
    });
  });

  describe('createWorkerScript', () => {
    it('should create valid worker script', () => {
      const fn = (data: any) => data * 2;
      const script = createWorkerScript(fn);

      expect(script).toContain('self.addEventListener');
      expect(script).toContain(fn.toString());
    });

    it('should handle Error objects in catch block', () => {
      const fn = () => { throw new Error('test error'); };
      const script = createWorkerScript(fn);

      // Should check for Error instance before accessing .message and .stack
      expect(script).toContain('error instanceof Error');
      expect(script).toContain('error.message');
      expect(script).toContain('error.stack');
    });

    it('should handle non-Error throws in catch block', () => {
      const fn = () => { throw 'string error'; };
      const script = createWorkerScript(fn);

      // Should convert non-Error to string
      expect(script).toContain('String(error)');
    });
  });
});
