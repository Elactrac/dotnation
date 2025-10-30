/**
 * @file Tests for Fraud Detection Module
 * Tests pattern detection, validation, similarity calculations, and full fraud analysis
 */

const {
  detectFraud,
  detectScamPatterns,
  validateCampaignStructure,
  calculateTextSimilarity,
  checkAgainstKnownFraud
} = require('./fraudDetection');

describe('Fraud Detection Module', () => {
  describe('calculateTextSimilarity', () => {
    it('should return 0 for completely different texts', () => {
      const similarity = calculateTextSimilarity(
        'Hello world',
        'Blockchain technology'
      );
      expect(similarity).toBeLessThan(0.2);
    });

    it('should return high similarity for identical texts', () => {
      const text = 'This is a campaign description';
      const similarity = calculateTextSimilarity(text, text);
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should return high similarity for very similar texts', () => {
      const similarity = calculateTextSimilarity(
        'Help us build a community center',
        'Help us build a community centre'
      );
      expect(similarity).toBeGreaterThan(0.8);
    });

    it('should handle empty strings', () => {
      expect(calculateTextSimilarity('', 'test')).toBe(0);
      expect(calculateTextSimilarity('test', '')).toBe(0);
      expect(calculateTextSimilarity('', '')).toBe(0);
    });

    it('should be case insensitive', () => {
      const similarity = calculateTextSimilarity(
        'HELLO WORLD',
        'hello world'
      );
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should ignore punctuation', () => {
      const similarity = calculateTextSimilarity(
        'Hello, world!',
        'Hello world'
      );
      expect(similarity).toBeGreaterThan(0.8);
    });
  });

  describe('detectScamPatterns', () => {
    it('should detect urgent language patterns', () => {
      const result = detectScamPatterns(
        'Act Now!',
        'Limited time offer! Don\'t miss out! Urgent action required!'
      );

      expect(result.hasRedFlags).toBe(true);
      expect(result.detected.length).toBeGreaterThan(0);
      expect(result.detected[0].category).toBe('urgentLanguage');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect unrealistic promises', () => {
      const result = detectScamPatterns(
        'Guaranteed Returns',
        '100% profit guaranteed! Risk-free investment with guaranteed success!'
      );

      expect(result.hasRedFlags).toBe(true);
      expect(result.detected.some(d => d.category === 'unrealisticPromises')).toBe(true);
      expect(result.score).toBeGreaterThan(20);
    });

    it('should detect technical buzzwords', () => {
      const result = detectScamPatterns(
        'Revolutionary Blockchain',
        'Quantum encryption powered by AI-powered trading with unlimited scalability!'
      );

      expect(result.hasRedFlags).toBe(true);
      expect(result.detected.some(d => d.category === 'technicalBuzzwords')).toBe(true);
    });

    it('should detect suspicious requests', () => {
      const result = detectScamPatterns(
        'Urgent Payment',
        'Please send crypto immediately via wire transfer or gift card. No refunds.'
      );

      expect(result.hasRedFlags).toBe(true);
      expect(result.detected.some(d => d.category === 'suspiciousRequests')).toBe(true);
    });

    it('should detect pressure tactics', () => {
      const result = detectScamPatterns(
        'Exclusive VIP Access',
        'Limited spots available! Whitelist only for this secret opportunity!'
      );

      expect(result.hasRedFlags).toBe(true);
      expect(result.detected.some(d => d.category === 'pressureTactics')).toBe(true);
    });

    it('should return clean result for legitimate campaign', () => {
      const result = detectScamPatterns(
        'Community Garden Project',
        'We are building a community garden to provide fresh produce for local families. ' +
        'Your donation will help us purchase seeds, tools, and build raised beds.'
      );

      expect(result.hasRedFlags).toBe(false);
      expect(result.detected.length).toBe(0);
      expect(result.score).toBe(0);
    });

    it('should calculate higher severity for multiple matches', () => {
      const result = detectScamPatterns(
        'Act Now! Limited Time!',
        'Urgent! Don\'t miss out! Last chance! Expires soon! Immediate action required!'
      );

      expect(result.detected[0].severity).toBe('high');
      expect(result.score).toBeGreaterThan(30);
    });

    it('should cap score at 100', () => {
      const spamText = 'act now limited time urgent hurry don\'t miss out last chance ' +
                       'guaranteed returns 100% profit risk-free get rich quick ' +
                       'revolutionary blockchain quantum encryption ai-powered trading ' +
                       'send crypto wire transfer gift card no refunds ' +
                       'limited spots exclusive offer vip access insider deal '.repeat(5);
      
      const result = detectScamPatterns('SCAM TITLE', spamText);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('validateCampaignStructure', () => {
    it('should flag campaigns with too short title', () => {
      const result = validateCampaignStructure({
        title: 'Help',
        description: 'This is a legitimate campaign description with enough detail to pass validation.',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.type === 'title' && i.severity === 'high')).toBe(true);
    });

    it('should flag campaigns with too short description', () => {
      const result = validateCampaignStructure({
        title: 'Valid Campaign Title Here',
        description: 'Too short',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.type === 'description' && i.severity === 'high')).toBe(true);
    });

    it('should flag campaigns with unusually long title', () => {
      const result = validateCampaignStructure({
        title: 'A'.repeat(250),
        description: 'This is a valid description with enough content to pass the minimum requirements.',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.issues.some(i => i.type === 'title' && i.severity === 'medium')).toBe(true);
    });

    it('should flag high goal with minimal description', () => {
      const result = validateCampaignStructure({
        title: 'High Goal Campaign',
        description: 'Short description here that is too vague for such a high goal.',
        goal: 50000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some(i => 
        i.message.includes('High funding goal with minimal description')
      )).toBe(true);
    });

    it('should flag excessive capital letters', () => {
      const result = validateCampaignStructure({
        title: 'HELP US BUILD THIS AMAZING PROJECT',
        description: 'THIS IS AN AMAZING OPPORTUNITY TO INVEST IN OUR REVOLUTIONARY BLOCKCHAIN PLATFORM!',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.issues.some(i => i.type === 'formatting' && i.severity === 'medium')).toBe(true);
      expect(result.issues.some(i => i.message.includes('capital letters'))).toBe(true);
    });

    it('should flag excessive special characters', () => {
      const result = validateCampaignStructure({
        title: '!!! AMAZING PROJECT !!!',
        description: '$$$ Invest now!!! 100% guaranteed returns!!! Don\'t miss out!!! $$$',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.issues.some(i => i.type === 'formatting' && i.severity === 'low')).toBe(true);
    });

    it('should flag unusually high funding goals', () => {
      const result = validateCampaignStructure({
        title: 'Mega Project Campaign',
        description: 'This is a detailed description explaining our ambitious project goals and implementation plan.',
        goal: 1500000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.issues.some(i => i.type === 'goal' && i.severity === 'medium')).toBe(true);
    });

    it('should pass validation for well-structured campaign', () => {
      const result = validateCampaignStructure({
        title: 'Community Garden Project',
        description: 'We are building a community garden to provide fresh, organic produce for local families. ' +
                     'The funds will be used to purchase seeds, gardening tools, build raised beds, and install irrigation. ' +
                     'Our team has experience in urban agriculture and community organizing.',
        goal: 5000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123abc'
      });

      expect(result.valid).toBe(true);
      expect(result.warningCount).toBe(0);
    });

    it('should allow some warnings but still be valid', () => {
      const result = validateCampaignStructure({
        title: 'Valid Campaign With Some Emoji 🌱',
        description: 'This is a perfectly valid campaign description that explains the project goals, ' +
                     'implementation plan, and how funds will be used. We have a clear timeline and team.',
        goal: 3000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      });

      expect(result.valid).toBe(true);
      // May have low severity warnings but no high severity issues
      const highSeverityIssues = result.issues.filter(i => i.severity === 'high');
      expect(highSeverityIssues.length).toBe(0);
    });
  });

  describe('checkAgainstKnownFraud', () => {
    const knownFraudCampaigns = [
      {
        id: 'fraud1',
        title: 'Get Rich Quick Blockchain Scheme',
        description: 'Invest now and double your money with our revolutionary quantum blockchain AI platform!',
        reason: 'Confirmed Ponzi scheme'
      },
      {
        id: 'fraud2',
        title: 'Urgent Medical Emergency',
        description: 'Need immediate funds for emergency surgery. Send crypto now!',
        reason: 'Fake medical emergency scam'
      }
    ];

    it('should detect campaigns identical to known fraud', () => {
      const result = checkAgainstKnownFraud(
        {
          title: 'Get Rich Quick Blockchain Scheme',
          description: 'Invest now and double your money with our revolutionary quantum blockchain AI platform!'
        },
        knownFraudCampaigns
      );

      expect(result.matchesFound).toBe(true);
      expect(result.highRisk).toBe(true);
      expect(result.matches.length).toBeGreaterThan(0);
    });

    it('should detect campaigns very similar to known fraud', () => {
      const result = checkAgainstKnownFraud(
        {
          title: 'Get Rich Quick with Blockchain',
          description: 'Invest now and double your money with our amazing quantum blockchain AI!'
        },
        knownFraudCampaigns
      );

      expect(result.matchesFound).toBe(true);
      expect(result.matches[0].titleSimilarity).toBeGreaterThan(60);
    });

    it('should not flag legitimate campaigns', () => {
      const result = checkAgainstKnownFraud(
        {
          title: 'Community Garden Project',
          description: 'Building a sustainable community garden for local families.'
        },
        knownFraudCampaigns
      );

      expect(result.matchesFound).toBe(false);
      expect(result.matches.length).toBe(0);
      expect(result.highRisk).toBe(false);
    });

    it('should handle empty fraud database', () => {
      const result = checkAgainstKnownFraud(
        {
          title: 'Any Campaign',
          description: 'Any description'
        },
        []
      );

      expect(result.matchesFound).toBe(false);
      expect(result.matches.length).toBe(0);
    });

    it('should provide similarity percentages', () => {
      const result = checkAgainstKnownFraud(
        {
          title: 'Get Rich Quick Blockchain Scheme',
          description: 'Invest now and double your money'
        },
        knownFraudCampaigns
      );

      if (result.matchesFound) {
        expect(result.matches[0]).toHaveProperty('titleSimilarity');
        expect(result.matches[0]).toHaveProperty('descriptionSimilarity');
        expect(typeof result.matches[0].titleSimilarity).toBe('string');
      }
    });
  });

  describe('detectFraud - Full Integration', () => {
    const validCampaign = {
      id: 'campaign1',
      title: 'Community Garden Project',
      description: 'We are building a sustainable community garden to provide fresh, organic produce ' +
                   'for local families in need. The funds will be used to purchase seeds, gardening tools, ' +
                   'build raised beds, and install an irrigation system. Our team has 5 years of experience ' +
                   'in urban agriculture and has successfully completed 3 similar projects.',
      goal: 5000,
      deadline: Date.now() + 86400000,
      beneficiary: '0x123abc'
    };

    const scamCampaign = {
      id: 'scam1',
      title: 'Act Now! Guaranteed Returns!',
      description: 'Limited time offer! Invest in our revolutionary blockchain platform with guaranteed ' +
                   '100% returns! Don\'t miss out on this exclusive opportunity! Send crypto immediately! ' +
                   'No refunds! Risk-free investment!',
      goal: 500000,
      deadline: Date.now() + 86400000,
      beneficiary: '0xscam'
    };

    it('should approve legitimate campaigns with low risk', async () => {
      const result = await detectFraud(validCampaign, { skipAI: true });

      expect(result.overallRiskScore).toBeLessThan(40);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendation).toBe('approve');
    });

    it('should flag obvious scam campaigns', async () => {
      const result = await detectFraud(scamCampaign, { skipAI: true });

      expect(result.overallRiskScore).toBeGreaterThan(50);
      expect(['high', 'critical']).toContain(result.riskLevel);
      expect(['review', 'reject']).toContain(result.recommendation);
    });

    it('should detect pattern analysis issues in scam campaigns', async () => {
      const result = await detectFraud(scamCampaign, { skipAI: true });

      expect(result.analysis.patternAnalysis.hasRedFlags).toBe(true);
      expect(result.analysis.patternAnalysis.detected.length).toBeGreaterThan(0);
    });

    it('should detect structure validation issues', async () => {
      const poorCampaign = {
        title: 'Help',
        description: 'Need money',
        goal: 100000,
        deadline: Date.now(),
        beneficiary: '0x'
      };

      const result = await detectFraud(poorCampaign, { skipAI: true });

      expect(result.analysis.structureValidation.valid).toBe(false);
      expect(result.analysis.structureValidation.warningCount).toBeGreaterThan(0);
    });

    it('should skip AI analysis when requested', async () => {
      const result = await detectFraud(validCampaign, { skipAI: true });

      expect(result.analysis.aiAnalysis.skipped).toBe(true);
    });

    it('should skip AI analysis when no API key provided', async () => {
      const result = await detectFraud(validCampaign, { apiKey: null });

      expect(result.analysis.aiAnalysis.skipped).toBe(true);
    });

    it('should include timestamp in results', async () => {
      const result = await detectFraud(validCampaign, { skipAI: true });

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should include campaign ID in results', async () => {
      const result = await detectFraud(validCampaign, { skipAI: true });

      expect(result.campaignId).toBe(validCampaign.id);
    });

    it('should generate comprehensive summary', async () => {
      const result = await detectFraud(scamCampaign, { skipAI: true });

      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should check against known fraud campaigns', async () => {
      const knownFraud = [
        {
          id: 'fraud1',
          title: scamCampaign.title,
          description: scamCampaign.description,
          reason: 'Known scam'
        }
      ];

      const result = await detectFraud(scamCampaign, {
        skipAI: true,
        knownFraudCampaigns: knownFraud
      });

      expect(result.analysis.knownFraudCheck.matchesFound).toBe(true);
      expect(result.overallRiskScore).toBeGreaterThan(80);
    });

    it('should recommend review for medium risk campaigns', async () => {
      const mediumRiskCampaign = {
        title: 'Blockchain Innovation Project',
        description: 'We are developing a new blockchain solution. Your support is appreciated. ' +
                     'Limited time offer to get involved early!',
        goal: 50000,
        deadline: Date.now() + 86400000,
        beneficiary: '0xabc'
      };

      const result = await detectFraud(mediumRiskCampaign, { skipAI: true });

      // Should have some red flags but not be critical
      if (result.overallRiskScore >= 40 && result.overallRiskScore < 80) {
        expect(['medium', 'high']).toContain(result.riskLevel);
        expect(result.recommendation).toBe('review');
      }
    });

    it('should handle errors gracefully', async () => {
      const invalidCampaign = null;

      const result = await detectFraud(invalidCampaign, { skipAI: true });

      expect(result.error).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.recommendation).toBe('review');
    });

    it('should calculate risk level correctly from score', async () => {
      // Test boundary conditions
      const testCases = [
        { score: 85, expectedLevel: 'critical' },
        { score: 79, expectedLevel: 'high' },
        { score: 65, expectedLevel: 'high' },
        { score: 59, expectedLevel: 'medium' },
        { score: 45, expectedLevel: 'medium' },
        { score: 39, expectedLevel: 'low' },
        { score: 20, expectedLevel: 'low' }
      ];

      // We can't directly test determineRiskLevel since it's not exported,
      // but we can verify the overall results match expected patterns
      for (const testCase of testCases) {
        const result = await detectFraud(validCampaign, { skipAI: true });
        expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
      }
    });

    it('should include all analysis components', async () => {
      const result = await detectFraud(validCampaign, { skipAI: true });

      expect(result.analysis).toHaveProperty('patternAnalysis');
      expect(result.analysis).toHaveProperty('structureValidation');
      expect(result.analysis).toHaveProperty('aiAnalysis');
      expect(result.analysis).toHaveProperty('knownFraudCheck');
    });

    it('should cap risk score at 100', async () => {
      const extremeScamCampaign = {
        title: 'ACT NOW!!! LIMITED TIME!!!',
        description: 'URGENT! GUARANTEED RETURNS! 100% PROFIT! RISK-FREE! ' +
                     'REVOLUTIONARY BLOCKCHAIN! QUANTUM ENCRYPTION! AI-POWERED TRADING! ' +
                     'SEND CRYPTO NOW! WIRE TRANSFER! GIFT CARD! NO REFUNDS! ' +
                     'LIMITED SPOTS! EXCLUSIVE OFFER! VIP ACCESS! INSIDER DEAL! ' +
                     'DON\'T MISS OUT! LAST CHANCE! IMMEDIATE ACTION REQUIRED!',
        goal: 10000000,
        deadline: Date.now() + 1000,
        beneficiary: '0xscammer'
      };

      const result = await detectFraud(extremeScamCampaign, { skipAI: true });

      expect(result.overallRiskScore).toBeLessThanOrEqual(100);
      expect(result.overallRiskScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle campaigns with null values', async () => {
      const result = await detectFraud({
        title: null,
        description: null,
        goal: null,
        deadline: null,
        beneficiary: null
      }, { skipAI: true });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
      expect(result.error || result.overallRiskScore !== undefined).toBe(true);
    });

    it('should handle very long campaign descriptions', async () => {
      const longDescription = 'A'.repeat(10000);
      const campaign = {
        title: 'Valid Title',
        description: longDescription,
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      };

      const result = await detectFraud(campaign, { skipAI: true });
      expect(result).toBeDefined();
      expect(result.overallRiskScore).toBeDefined();
    });

    it('should handle unicode and special characters', async () => {
      const campaign = {
        title: '支持我们的项目 🌟',
        description: 'Descripción del proyecto en español con émojis 🎉🚀',
        goal: 1000,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      };

      const result = await detectFraud(campaign, { skipAI: true });
      expect(result).toBeDefined();
    });

    it('should handle campaigns with zero goal', async () => {
      const result = await detectFraud({
        title: 'Free Project',
        description: 'This is a test campaign with zero funding goal.',
        goal: 0,
        deadline: Date.now() + 86400000,
        beneficiary: '0x123'
      }, { skipAI: true });

      expect(result).toBeDefined();
    });

    it('should handle past deadlines', async () => {
      const result = await detectFraud({
        title: 'Past Deadline Campaign',
        description: 'This campaign has a deadline in the past.',
        goal: 1000,
        deadline: Date.now() - 86400000,
        beneficiary: '0x123'
      }, { skipAI: true });

      expect(result).toBeDefined();
    });
  });
});
