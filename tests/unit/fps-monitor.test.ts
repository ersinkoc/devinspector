import { FPSMonitor, FPSData } from '../../src/monitors/performance/fps-monitor';

describe('FPSMonitor', () => {
  let monitor: FPSMonitor;
  let capturedData: FPSData[];

  beforeEach(() => {
    capturedData = [];
    monitor = new FPSMonitor((data) => {
      capturedData.push(data);
    }, 100); // 100ms update interval for faster testing
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('start and stop', () => {
    it('should start monitoring without errors', () => {
      expect(() => monitor.start()).not.toThrow();
    });

    it('should not start twice', () => {
      monitor.start();
      monitor.start();
      expect(true).toBe(true); // Should not throw
    });

    it('should stop monitoring', () => {
      monitor.start();
      monitor.stop();
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('division by zero protection', () => {
    it('should handle zero frame count gracefully', (done) => {
      // Bug fix: should not divide by zero when frameCount is 0
      monitor.start();

      // Wait for update interval
      setTimeout(() => {
        monitor.stop();

        // If no data was captured (no frames), that's ok
        // The important thing is it didn't crash or produce NaN
        if (capturedData.length > 0) {
          capturedData.forEach(data => {
            expect(data.fps).not.toBeNaN();
            expect(data.frameTime).not.toBeNaN();
            expect(isFinite(data.fps)).toBe(true);
            expect(isFinite(data.frameTime)).toBe(true);
          });
        }

        done();
      }, 150);
    });
  });

  describe('getCurrentFPS', () => {
    it('should return a number', () => {
      monitor.start();
      const fps = monitor.getCurrentFPS();
      expect(typeof fps).toBe('number');
      expect(fps).toBeGreaterThanOrEqual(0);
    });
  });
});
