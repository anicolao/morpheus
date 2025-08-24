/**
 * Interface for tracking LLM usage metrics
 */
export interface LLMMetrics {
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Class for accumulating and managing LLM metrics
 */
export class MetricsTracker {
  private metrics: LLMMetrics = {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0
  };

  /**
   * Add metrics from a single LLM request
   */
  addRequest(inputTokens: number, outputTokens: number): void {
    this.metrics.requests++;
    this.metrics.inputTokens += inputTokens;
    this.metrics.outputTokens += outputTokens;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): LLMMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all metrics to zero
   */
  reset(): void {
    this.metrics = {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0
    };
  }

  /**
   * Add metrics from another tracker (for aggregation)
   */
  addMetrics(other: LLMMetrics): void {
    this.metrics.requests += other.requests;
    this.metrics.inputTokens += other.inputTokens;
    this.metrics.outputTokens += other.outputTokens;
  }
}

/**
 * Utility function to estimate tokens for text (rough approximation)
 * Uses the common heuristic of ~4 characters per token for English text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Conservative estimate: 4 characters per token
  return Math.ceil(text.length / 4);
}