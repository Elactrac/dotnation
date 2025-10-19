/**
 * Smart Contract Event Monitor
 * Subscribes to blockchain events and tracks contract activity
 */

export class ContractEventMonitor {
  constructor(api, contractAddress) {
    this.api = api;
    this.contractAddress = contractAddress;
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    this.unsubscribe = null;
  }

  /**
   * Start monitoring contract events
   */
  async start(callback) {
    if (!this.api || !this.api.isReady) {
      console.warn('[EventMonitor] API not ready');
      return null;
    }

    try {
      console.log('[EventMonitor] Starting event subscription');
      
      this.unsubscribe = await this.api.query.system.events((events) => {
        events.forEach((record) => {
          const { event, phase } = record;
          
          // Filter for contract events
          if (event.section === 'contracts') {
            const eventData = {
              type: event.method,
              section: event.section,
              data: event.data.toHuman(),
              phase: phase.toHuman(),
              timestamp: Date.now(),
            };
            
            this.handleEvent(eventData);
            
            if (callback) {
              callback(eventData);
            }
          }
        });
      });
      
      console.log('[EventMonitor] Event subscription active');
      return this.unsubscribe;
    } catch (error) {
      console.error('[EventMonitor] Failed to subscribe to events:', error);
      return null;
    }
  }

  /**
   * Stop monitoring events
   */
  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('[EventMonitor] Event subscription stopped');
    }
  }

  /**
   * Handle incoming event
   */
  handleEvent(event) {
    // Add to history
    this.eventHistory.push(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    // Log event
    this.logEvent(event);
    
    // Notify specific listeners
    this.notifyListeners(event);
  }

  /**
   * Register event listener for specific event type
   */
  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify registered listeners
   */
  notifyListeners(event) {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[EventMonitor] Listener error:', error);
      }
    });
    
    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get('*') || [];
    wildcardCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[EventMonitor] Wildcard listener error:', error);
      }
    });
  }

  /**
   * Log event to console
   */
  logEvent(event) {
    const emoji = this.getEventEmoji(event.type);
    console.log(
      `${emoji} [Contract Event] ${event.type}:`,
      event.data,
      `(${new Date(event.timestamp).toLocaleTimeString()})`
    );
  }

  /**
   * Get emoji for event type
   */
  getEventEmoji(eventType) {
    const emojiMap = {
      'Instantiated': '🎉',
      'Called': '📞',
      'ContractEmitted': '📢',
      'CodeStored': '💾',
      'ContractCodeUpdated': '🔄',
      'Terminated': '💀',
    };
    return emojiMap[eventType] || '📋';
  }

  /**
   * Get event history
   */
  getHistory(filter = {}) {
    let history = this.eventHistory;
    
    // Filter by event type
    if (filter.type) {
      history = history.filter(e => e.type === filter.type);
    }
    
    // Filter by time range
    if (filter.since) {
      history = history.filter(e => e.timestamp >= filter.since);
    }
    
    if (filter.until) {
      history = history.filter(e => e.timestamp <= filter.until);
    }
    
    // Limit results
    if (filter.limit) {
      history = history.slice(-filter.limit);
    }
    
    return history;
  }

  /**
   * Get event statistics
   */
  getStatistics() {
    const stats = {
      total: this.eventHistory.length,
      byType: {},
      recentEvents: this.eventHistory.slice(-10),
    };
    
    this.eventHistory.forEach(event => {
      if (!stats.byType[event.type]) {
        stats.byType[event.type] = 0;
      }
      stats.byType[event.type]++;
    });
    
    return stats;
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
    console.log('[EventMonitor] Event history cleared');
  }

  /**
   * Export events as JSON
   */
  exportEvents(filter = {}) {
    const events = this.getHistory(filter);
    return JSON.stringify(events, null, 2);
  }
}

/**
 * Campaign-specific event parser
 */
export class CampaignEventParser {
  /**
   * Parse campaign created event
   */
  static parseCampaignCreated(eventData) {
    try {
      return {
        type: 'CampaignCreated',
        campaignId: eventData[0],
        owner: eventData[1],
        title: eventData[2],
        goal: eventData[3],
        deadline: eventData[4],
      };
    } catch (error) {
      console.error('Failed to parse CampaignCreated event:', error);
      return null;
    }
  }

  /**
   * Parse donation received event
   */
  static parseDonationReceived(eventData) {
    try {
      return {
        type: 'DonationReceived',
        campaignId: eventData[0],
        donor: eventData[1],
        amount: eventData[2],
      };
    } catch (error) {
      console.error('Failed to parse DonationReceived event:', error);
      return null;
    }
  }

  /**
   * Parse funds withdrawn event
   */
  static parseFundsWithdrawn(eventData) {
    try {
      return {
        type: 'FundsWithdrawn',
        campaignId: eventData[0],
        beneficiary: eventData[1],
        amount: eventData[2],
      };
    } catch (error) {
      console.error('Failed to parse FundsWithdrawn event:', error);
      return null;
    }
  }
}

export default ContractEventMonitor;
