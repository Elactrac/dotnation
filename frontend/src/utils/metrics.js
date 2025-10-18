/**
 * Metrics collection and monitoring utilities for DotNation
 */

export class MetricsCollector {
  constructor() {
    this.metrics = {
      // Transaction metrics
      txSuccess: 0,
      txFailed: 0,
      txPending: 0,
      avgTxDuration: [],
      
      // Block metrics
      avgBlockTime: [],
      currentBlock: 0,
      
      // API metrics
      apiCalls: [],
      apiLatency: [],
      apiErrors: 0,
      
      // Campaign metrics
      campaignsCreated: 0,
      donationsReceived: 0,
      totalDonationAmount: BigInt(0),
      
      // Wallet metrics
      walletConnections: 0,
      walletDisconnections: 0,
      
      // Error metrics
      errorsByType: {},
      criticalErrors: 0,
    };
    
    this.startTime = Date.now();
  }

  /**
   * Record a transaction
   */
  recordTransaction(success, duration, details = {}) {
    if (success) {
      this.metrics.txSuccess++;
    } else {
      this.metrics.txFailed++;
    }
    
    if (duration) {
      this.metrics.avgTxDuration.push(duration);
    }
    
    // Send to analytics
    this.sendToAnalytics('transaction', {
      success,
      duration,
      ...details,
    });
    
    console.log('[Metrics] Transaction recorded:', { success, duration });
  }

  /**
   * Record transaction start
   */
  startTransaction(txId) {
    this.metrics.txPending++;
    return Date.now();
  }

  /**
   * Record transaction completion
   */
  completeTransaction(startTime, success, details = {}) {
    this.metrics.txPending = Math.max(0, this.metrics.txPending - 1);
    const duration = Date.now() - startTime;
    this.recordTransaction(success, duration, details);
  }

  /**
   * Record API call
   */
  recordApiCall(endpoint, duration, success = true) {
    this.metrics.apiCalls.push({
      endpoint,
      duration,
      success,
      timestamp: Date.now(),
    });
    
    this.metrics.apiLatency.push(duration);
    
    if (!success) {
      this.metrics.apiErrors++;
    }
    
    // Keep only last 100 API calls
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls.shift();
    }
    
    // Keep only last 1000 latency measurements
    if (this.metrics.apiLatency.length > 1000) {
      this.metrics.apiLatency.shift();
    }
  }

  /**
   * Record block time
   */
  recordBlockTime(blockTime, blockNumber) {
    this.metrics.avgBlockTime.push(blockTime);
    this.metrics.currentBlock = blockNumber;
    
    // Keep only last 100 block times
    if (this.metrics.avgBlockTime.length > 100) {
      this.metrics.avgBlockTime.shift();
    }
  }

  /**
   * Record campaign creation
   */
  recordCampaignCreation(campaignId, details = {}) {
    this.metrics.campaignsCreated++;
    
    this.sendToAnalytics('campaign_created', {
      campaignId,
      ...details,
    });
  }

  /**
   * Record donation
   */
  recordDonation(amount, campaignId, details = {}) {
    this.metrics.donationsReceived++;
    this.metrics.totalDonationAmount += BigInt(amount);
    
    this.sendToAnalytics('donation_received', {
      amount: amount.toString(),
      campaignId,
      ...details,
    });
  }

  /**
   * Record wallet connection
   */
  recordWalletConnection(connected = true) {
    if (connected) {
      this.metrics.walletConnections++;
    } else {
      this.metrics.walletDisconnections++;
    }
    
    this.sendToAnalytics('wallet_connection', { connected });
  }

  /**
   * Record error
   */
  recordError(error, severity = 'error') {
    const errorType = error.code || error.name || 'UnknownError';
    
    if (!this.metrics.errorsByType[errorType]) {
      this.metrics.errorsByType[errorType] = 0;
    }
    this.metrics.errorsByType[errorType]++;
    
    if (severity === 'critical') {
      this.metrics.criticalErrors++;
    }
    
    this.sendToAnalytics('error', {
      type: errorType,
      message: error.message,
      severity,
    });
    
    console.error('[Metrics] Error recorded:', { errorType, severity });
  }

  /**
   * Get transaction success rate
   */
  getTransactionSuccessRate() {
    const total = this.metrics.txSuccess + this.metrics.txFailed;
    if (total === 0) return 0;
    return (this.metrics.txSuccess / total) * 100;
  }

  /**
   * Get average transaction duration
   */
  getAvgTransactionDuration() {
    return this.getAverage(this.metrics.avgTxDuration);
  }

  /**
   * Get average block time
   */
  getAvgBlockTime() {
    return this.getAverage(this.metrics.avgBlockTime);
  }

  /**
   * Get average API latency
   */
  getAvgApiLatency() {
    return this.getAverage(this.metrics.apiLatency);
  }

  /**
   * Get P95 latency
   */
  getP95Latency() {
    if (this.metrics.apiLatency.length === 0) return 0;
    
    const sorted = [...this.metrics.apiLatency].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  /**
   * Get uptime in seconds
   */
  getUptime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return {
      ...this.metrics,
      successRate: this.getTransactionSuccessRate(),
      avgTxDuration: this.getAvgTransactionDuration(),
      avgBlockTime: this.getAvgBlockTime(),
      avgApiLatency: this.getAvgApiLatency(),
      p95ApiLatency: this.getP95Latency(),
      uptime: this.getUptime(),
      totalDonationAmount: this.metrics.totalDonationAmount.toString(),
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      txSuccess: 0,
      txFailed: 0,
      txPending: 0,
      avgTxDuration: [],
      avgBlockTime: [],
      currentBlock: 0,
      apiCalls: [],
      apiLatency: [],
      apiErrors: 0,
      campaignsCreated: 0,
      donationsReceived: 0,
      totalDonationAmount: BigInt(0),
      walletConnections: 0,
      walletDisconnections: 0,
      errorsByType: {},
      criticalErrors: 0,
    };
    this.startTime = Date.now();
  }

  /**
   * Helper to calculate average
   */
  getAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Send metrics to analytics service
   */
  sendToAnalytics(eventName, data) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
    
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, data);
    }
    
    // Custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: Date.now(),
        }),
      }).catch(err => {
        console.warn('Failed to send analytics:', err);
      });
    }
  }

  /**
   * Export metrics for debugging
   */
  exportMetrics() {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }
}

// Create global metrics collector instance
export const metrics = new MetricsCollector();

// Make metrics available in development
if (import.meta.env.DEV) {
  window.metrics = metrics;
}

export default metrics;
