export interface FPSData {
  fps: number;
  timestamp: number;
  frameTime: number;
  droppedFrames: number;
}

export type FPSCallback = (data: FPSData) => void;

export class FPSMonitor {
  private callback: FPSCallback;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private frameTimeSum: number = 0;
  private droppedFrames: number = 0;
  private animationId: number | null = null;
  private updateInterval: number;
  private lastUpdateTime: number = 0;

  constructor(callback: FPSCallback, updateInterval: number = 1000) {
    this.callback = callback;
    this.updateInterval = updateInterval;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastUpdateTime = this.lastTime;
    this.frameCount = 0;
    this.frameTimeSum = 0;
    this.droppedFrames = 0;
    
    this.tick();
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    // Track frame time
    this.frameTimeSum += deltaTime;
    this.frameCount++;
    
    // Detect dropped frames (> 16.67ms indicates < 60fps)
    if (deltaTime > 16.67) {
      this.droppedFrames++;
    }
    
    // Update FPS calculation
    const timeSinceUpdate = currentTime - this.lastUpdateTime;
    if (timeSinceUpdate >= this.updateInterval) {
      this.fps = (this.frameCount * 1000) / timeSinceUpdate;
      const avgFrameTime = this.frameTimeSum / this.frameCount;
      
      this.callback({
        fps: Math.round(this.fps),
        timestamp: Date.now(),
        frameTime: avgFrameTime,
        droppedFrames: this.droppedFrames
      });
      
      // Reset counters
      this.frameCount = 0;
      this.frameTimeSum = 0;
      this.droppedFrames = 0;
      this.lastUpdateTime = currentTime;
    }
    
    this.lastTime = currentTime;
    this.animationId = requestAnimationFrame(this.tick);
  };

  getCurrentFPS(): number {
    return Math.round(this.fps);
  }
}