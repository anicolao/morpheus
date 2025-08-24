import { describe, it, expect } from 'vitest';
import { LLMMetrics, MetricsTracker, estimateTokens } from './metrics';

describe('MetricsTracker', () => {
  it('should initialize with zero metrics', () => {
    const tracker = new MetricsTracker();
    const metrics = tracker.getMetrics();
    
    expect(metrics.requests).toBe(0);
    expect(metrics.inputTokens).toBe(0);
    expect(metrics.outputTokens).toBe(0);
  });

  it('should track single request correctly', () => {
    const tracker = new MetricsTracker();
    tracker.addRequest(100, 50);
    
    const metrics = tracker.getMetrics();
    expect(metrics.requests).toBe(1);
    expect(metrics.inputTokens).toBe(100);
    expect(metrics.outputTokens).toBe(50);
  });

  it('should accumulate multiple requests', () => {
    const tracker = new MetricsTracker();
    tracker.addRequest(100, 50);
    tracker.addRequest(200, 75);
    tracker.addRequest(150, 25);
    
    const metrics = tracker.getMetrics();
    expect(metrics.requests).toBe(3);
    expect(metrics.inputTokens).toBe(450);
    expect(metrics.outputTokens).toBe(150);
  });

  it('should reset metrics to zero', () => {
    const tracker = new MetricsTracker();
    tracker.addRequest(100, 50);
    tracker.addRequest(200, 75);
    
    tracker.reset();
    
    const metrics = tracker.getMetrics();
    expect(metrics.requests).toBe(0);
    expect(metrics.inputTokens).toBe(0);
    expect(metrics.outputTokens).toBe(0);
  });

  it('should add metrics from another tracker', () => {
    const tracker1 = new MetricsTracker();
    tracker1.addRequest(100, 50);
    
    const tracker2 = new MetricsTracker();
    tracker2.addRequest(200, 75);
    
    tracker1.addMetrics(tracker2.getMetrics());
    
    const metrics = tracker1.getMetrics();
    expect(metrics.requests).toBe(2);
    expect(metrics.inputTokens).toBe(300);
    expect(metrics.outputTokens).toBe(125);
  });

  it('should return immutable metrics snapshot', () => {
    const tracker = new MetricsTracker();
    tracker.addRequest(100, 50);
    
    const metrics1 = tracker.getMetrics();
    const metrics2 = tracker.getMetrics();
    
    // Should be different objects
    expect(metrics1).not.toBe(metrics2);
    // But with same values
    expect(metrics1).toEqual(metrics2);
    
    // Modifying returned object should not affect tracker
    metrics1.requests = 999;
    const metrics3 = tracker.getMetrics();
    expect(metrics3.requests).toBe(1);
  });
});

describe('estimateTokens', () => {
  it('should estimate tokens for typical text', () => {
    const text = 'Hello world'; // 11 characters
    const tokens = estimateTokens(text);
    expect(tokens).toBe(3); // ceil(11/4) = 3
  });

  it('should handle empty text', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens(null as any)).toBe(0);
    expect(estimateTokens(undefined as any)).toBe(0);
  });

  it('should handle longer text', () => {
    const text = 'This is a longer piece of text that should be estimated correctly'; // 66 characters
    const tokens = estimateTokens(text);
    expect(tokens).toBe(17); // ceil(66/4) = 17
  });

  it('should handle single character', () => {
    expect(estimateTokens('a')).toBe(1); // ceil(1/4) = 1
  });

  it('should handle exact multiples of 4', () => {
    const text = 'abcd'; // 4 characters
    expect(estimateTokens(text)).toBe(1); // ceil(4/4) = 1
    
    const text2 = 'abcdefgh'; // 8 characters
    expect(estimateTokens(text2)).toBe(2); // ceil(8/4) = 2
  });
});