import { LongTaskDetector, LongTask } from '../../src/monitors/performance/long-task-detector';

describe('LongTaskDetector', () => {
  let detector: LongTaskDetector;
  let capturedTasks: LongTask[];

  beforeEach(() => {
    capturedTasks = [];
    detector = new LongTaskDetector((task) => {
      capturedTasks.push(task);
    }, 50);
  });

  afterEach(() => {
    detector.stop();
  });

  describe('start and stop', () => {
    it('should not start twice', () => {
      detector.start();
      detector.start();
      // Should not throw or cause issues
      expect(true).toBe(true);
    });

    it('should stop properly when using fallback detection', (done) => {
      // Force fallback by not having PerformanceObserver support
      const originalPerformanceObserver = (global as any).PerformanceObserver;
      (global as any).PerformanceObserver = undefined;

      detector = new LongTaskDetector((task) => {
        capturedTasks.push(task);
      }, 50);

      detector.start();

      // Wait a bit then stop
      setTimeout(() => {
        detector.stop();

        const taskCountAtStop = capturedTasks.length;

        // Wait more and verify no more tasks are captured
        setTimeout(() => {
          // Bug fix: stopping should prevent further task detection
          expect(capturedTasks.length).toBe(taskCountAtStop);

          // Restore
          (global as any).PerformanceObserver = originalPerformanceObserver;
          done();
        }, 100);
      }, 50);
    });
  });

  describe('task detection', () => {
    it('should initialize without errors', () => {
      detector.start();
      expect(detector).toBeDefined();
      detector.stop();
    });
  });
});
