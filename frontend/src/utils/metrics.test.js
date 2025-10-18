/**
 * Test suite for metrics collector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '../metrics';

describe('MetricsCollector', () => {
  let collector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  describe('Transaction Metrics', () => {
    it('should record successful transaction', () => {
      collector.recordTransaction(true, 1000);

      expect(collector.metrics.txSuccess).toBe(1);
      expect(collector.metrics.txFailed).toBe(0);
      expect(collector.metrics.avgTxDuration).toEqual([1000]);
    });

    it('should record failed transaction', () => {
      collector.recordTransaction(false, 500);

      expect(collector.metrics.txSuccess).toBe(0);
      expect(collector.metrics.txFailed).toBe(1);
    });

    it('should calculate transaction success rate', () => {
      collector.recordTransaction(true, 100);
      collector.recordTransaction(true, 200);
      collector.recordTransaction(false, 150);

      expect(collector.getTransactionSuccessRate()).toBeCloseTo(66.67, 1);
    });

    it('should track pending transactions', () => {
      const startTime = collector.startTransaction();
      expect(collector.metrics.txPending).toBe(1);

      collector.completeTransaction(startTime, true);
      expect(collector.metrics.txPending).toBe(0);
    });
  });

  describe('API Metrics', () => {
    it('should record API call', () => {
      collector.recordApiCall('/api/campaigns', 250, true);

      expect(collector.metrics.apiCalls).toHaveLength(1);
      expect(collector.metrics.apiLatency).toEqual([250]);
      expect(collector.metrics.apiErrors).toBe(0);
    });

    it('should record API errors', () => {
      collector.recordApiCall('/api/error', 100, false);

      expect(collector.metrics.apiErrors).toBe(1);
    });

    it('should calculate average latency', () => {
      collector.recordApiCall('/api/1', 100);
      collector.recordApiCall('/api/2', 200);
      collector.recordApiCall('/api/3', 300);

      expect(collector.getAvgApiLatency()).toBe(200);
    });

    it('should calculate P95 latency', () => {
      for (let i = 1; i <= 100; i++) {
        collector.recordApiCall('/api', i * 10);
      }

      const p95 = collector.getP95Latency();
      expect(p95).toBeGreaterThanOrEqual(900);
      expect(p95).toBeLessThanOrEqual(1000);
    });

    it('should limit API call history', () => {
      for (let i = 0; i < 150; i++) {
        collector.recordApiCall('/api', 100);
      }

      expect(collector.metrics.apiCalls).toHaveLength(100);
    });
  });

  describe('Campaign Metrics', () => {
    it('should record campaign creation', () => {
      collector.recordCampaignCreation(1, { title: 'Test Campaign' });

      expect(collector.metrics.campaignsCreated).toBe(1);
    });

    it('should record donations', () => {
      collector.recordDonation(BigInt(1000000000000), 1);

      expect(collector.metrics.donationsReceived).toBe(1);
      expect(collector.metrics.totalDonationAmount).toBe(BigInt(1000000000000));
    });

    it('should accumulate donation amounts', () => {
      collector.recordDonation(BigInt(1000), 1);
      collector.recordDonation(BigInt(2000), 1);
      collector.recordDonation(BigInt(3000), 2);

      expect(collector.metrics.totalDonationAmount).toBe(BigInt(6000));
    });
  });

  describe('Wallet Metrics', () => {
    it('should record wallet connection', () => {
      collector.recordWalletConnection(true);

      expect(collector.metrics.walletConnections).toBe(1);
    });

    it('should record wallet disconnection', () => {
      collector.recordWalletConnection(false);

      expect(collector.metrics.walletDisconnections).toBe(1);
    });
  });

  describe('Error Metrics', () => {
    it('should record errors by type', () => {
      const error1 = { code: 'CONNECTION_FAILED', message: 'Failed' };
      const error2 = { code: 'CONNECTION_FAILED', message: 'Failed again' };
      const error3 = { code: 'TX_FAILED', message: 'Tx failed' };

      collector.recordError(error1);
      collector.recordError(error2);
      collector.recordError(error3);

      expect(collector.metrics.errorsByType).toEqual({
        CONNECTION_FAILED: 2,
        TX_FAILED: 1,
      });
    });

    it('should track critical errors', () => {
      const error = { code: 'CRITICAL', message: 'Critical error' };

      collector.recordError(error, 'critical');

      expect(collector.metrics.criticalErrors).toBe(1);
    });
  });

  describe('Block Metrics', () => {
    it('should record block time', () => {
      collector.recordBlockTime(6000, 1000);

      expect(collector.metrics.avgBlockTime).toEqual([6000]);
      expect(collector.metrics.currentBlock).toBe(1000);
    });

    it('should limit block time history', () => {
      for (let i = 0; i < 150; i++) {
        collector.recordBlockTime(6000, i);
      }

      expect(collector.metrics.avgBlockTime).toHaveLength(100);
    });
  });

  describe('Utility Functions', () => {
    it('should calculate average correctly', () => {
      expect(collector.getAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(collector.getAverage([])).toBe(0);
    });

    it('should calculate uptime', () => {
      const uptime = collector.getUptime();
      expect(uptime).toBeGreaterThanOrEqual(0);
    });

    it('should export all metrics', () => {
      collector.recordTransaction(true, 100);
      collector.recordApiCall('/api', 200);

      const exported = collector.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed.txSuccess).toBe(1);
      expect(parsed.successRate).toBe(100);
      expect(parsed.avgApiLatency).toBe(200);
    });

    it('should reset metrics', () => {
      collector.recordTransaction(true, 100);
      collector.recordApiCall('/api', 200);

      collector.reset();

      expect(collector.metrics.txSuccess).toBe(0);
      expect(collector.metrics.apiCalls).toHaveLength(0);
    });
  });
});
