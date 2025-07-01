import { EventEmitter } from '../../src/core/event-emitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter<{
    test: string;
    data: { value: number };
    error: Error;
  }>;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on', () => {
    it('should add event listener', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      
      emitter.emit('test', 'hello');
      expect(listener).toHaveBeenCalledWith('hello');
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = emitter.on('test', listener);
      
      emitter.emit('test', 'hello');
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      emitter.emit('test', 'world');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      
      emitter.emit('test', 'hello');
      
      expect(listener1).toHaveBeenCalledWith('hello');
      expect(listener2).toHaveBeenCalledWith('hello');
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      const listener = jest.fn();
      emitter.once('test', listener);
      
      emitter.emit('test', 'first');
      emitter.emit('test', 'second');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });
  });

  describe('emit', () => {
    it('should return true if listeners exist', () => {
      emitter.on('test', () => {});
      expect(emitter.emit('test', 'hello')).toBe(true);
    });

    it('should return false if no listeners', () => {
      expect(emitter.emit('test', 'hello')).toBe(false);
    });

    it('should catch listener errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      emitter.on('test', () => {
        throw new Error('Listener error');
      });
      
      emitter.emit('test', 'hello');
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      
      emitter.off('test', listener1);
      emitter.emit('test', 'hello');
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('hello');
    });

    it('should remove all listeners if no specific listener provided', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      
      emitter.off('test');
      emitter.emit('test', 'hello');
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      const listener = jest.fn();
      emitter.on('test', listener);
      
      emitter.removeAllListeners('test');
      emitter.emit('test', 'hello');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove all listeners for all events', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      emitter.on('test', listener1);
      emitter.on('data', listener2);
      
      emitter.removeAllListeners();
      
      emitter.emit('test', 'hello');
      emitter.emit('data', { value: 123 });
      
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return number of listeners', () => {
      expect(emitter.listenerCount('test')).toBe(0);
      
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(1);
      
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });

  describe('eventNames', () => {
    it('should return array of event names', () => {
      expect(emitter.eventNames()).toEqual([]);
      
      emitter.on('test', () => {});
      emitter.on('data', () => {});
      
      expect(emitter.eventNames()).toContain('test');
      expect(emitter.eventNames()).toContain('data');
    });
  });

  describe('maxListeners', () => {
    it('should warn when exceeding max listeners', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const emitterWithLimit = new EventEmitter({ maxListeners: 2 });
      
      emitterWithLimit.on('test', () => {});
      emitterWithLimit.on('test', () => {});
      emitterWithLimit.on('test', () => {}); // This should trigger warning
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });
});