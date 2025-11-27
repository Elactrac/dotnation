/**
 * @file Terms of Service page for DotNation
 * @exports TermsPage
 */
const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Welcome to DotNation (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using our decentralized 
              crowdfunding platform built on the Polkadot network, you agree to be bound by these Terms of Service 
              (&quot;Terms&quot;).
            </p>
            <p className="text-white/80 leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Platform. These Terms constitute a 
              legally binding agreement between you and DotNation regarding your use of the Platform.
            </p>
          </div>

          {/* Eligibility */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">2. Eligibility</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              To use the Platform, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Platform under applicable laws</li>
              <li>Have a compatible cryptocurrency wallet (e.g., Polkadot.js extension)</li>
              <li>Not be located in, or a resident of, any jurisdiction where cryptocurrency transactions are prohibited</li>
            </ul>
          </div>

          {/* Platform Description */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">3. Platform Description</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              DotNation is a decentralized crowdfunding platform that enables:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong className="text-white">Campaign Creation:</strong> Users can create fundraising campaigns with defined goals and milestones</li>
              <li><strong className="text-white">Donations:</strong> Users can contribute cryptocurrency to campaigns they wish to support</li>
              <li><strong className="text-white">Milestone-Based Funding:</strong> Funds are released based on predefined milestones verified by the community</li>
              <li><strong className="text-white">NFT Rewards:</strong> Donors may receive NFT badges as recognition for their contributions</li>
              <li><strong className="text-white">Cross-Chain Transfers:</strong> Support for multiple Polkadot parachains via XCM</li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">4. User Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 Account Security</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Maintaining the security of your wallet and private keys</li>
              <li>All activities that occur through your wallet connection</li>
              <li>Ensuring your wallet software is up-to-date and secure</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 Prohibited Activities</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Create fraudulent or misleading campaigns</li>
              <li>Use the Platform for money laundering or other illegal activities</li>
              <li>Attempt to manipulate or exploit the Platform or smart contracts</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Distribute malware or engage in phishing attempts</li>
              <li>Circumvent any security features or access restrictions</li>
            </ul>
          </div>

          {/* Campaign Guidelines */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">5. Campaign Guidelines</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Campaign Creators</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              If you create a campaign, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Provide accurate and truthful information about your project</li>
              <li>Use funds only for the stated purposes</li>
              <li>Fulfill milestones and deliver promised rewards</li>
              <li>Communicate transparently with donors about project progress</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Donors</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              If you donate to a campaign, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Donations are voluntary contributions, not investments</li>
              <li>There is no guarantee of project completion or returns</li>
              <li>You should conduct your own research before donating</li>
              <li>Refunds are subject to the campaign&apos;s terms and milestone status</li>
            </ul>
          </div>

          {/* Smart Contracts */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">6. Smart Contracts and Blockchain</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You understand and acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-3 text-white/80 ml-4">
              <li><strong className="text-white">Immutability:</strong> Blockchain transactions are permanent and cannot be reversed once confirmed</li>
              <li><strong className="text-white">Smart Contract Risks:</strong> While our smart contracts are audited, they may contain bugs or vulnerabilities</li>
              <li><strong className="text-white">Gas Fees:</strong> You are responsible for paying transaction fees (gas) for blockchain operations</li>
              <li><strong className="text-white">Network Risks:</strong> The Platform depends on the Polkadot network, which may experience congestion or downtime</li>
              <li><strong className="text-white">Price Volatility:</strong> Cryptocurrency values fluctuate, affecting the real-world value of donations</li>
            </ul>
          </div>

          {/* Fees */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">7. Fees</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              The Platform may charge the following fees:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong className="text-white">Platform Fee:</strong> A small percentage (typically 2%) of successfully funded campaigns to support protocol development</li>
              <li><strong className="text-white">Network Fees:</strong> Standard Polkadot network transaction fees (paid to validators)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              All fees are disclosed before transactions are executed. We reserve the right to modify fees with reasonable notice.
            </p>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">8. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">8.1 Platform Content</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              The Platform, including its design, code, logos, and documentation, is protected by intellectual property laws. 
              You may not copy, modify, or distribute Platform materials without permission.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">8.2 User Content</h3>
            <p className="text-white/80 leading-relaxed">
              You retain ownership of content you submit to the Platform. By creating a campaign, you grant DotNation 
              a non-exclusive license to display and promote your content on the Platform.
            </p>
          </div>

          {/* Disclaimers */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">9. Disclaimers</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-white/80 leading-relaxed">
                <strong className="text-yellow-400">THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;</strong> without 
                warranties of any kind, either express or implied.
              </p>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              We do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Uninterrupted or error-free access to the Platform</li>
              <li>The accuracy or completeness of campaign information</li>
              <li>The success of any campaign or project</li>
              <li>The security of the Polkadot network or related technologies</li>
              <li>The value or liquidity of any cryptocurrency</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">10. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              To the maximum extent permitted by law, DotNation and its affiliates shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Loss of cryptocurrency, funds, or digital assets</li>
              <li>Losses resulting from smart contract vulnerabilities</li>
              <li>Damages from unauthorized access to your wallet</li>
              <li>Failed or delayed transactions</li>
              <li>Losses from price volatility</li>
              <li>Actions of campaign creators or other users</li>
              <li>Any indirect, incidental, special, or consequential damages</li>
            </ul>
          </div>

          {/* Indemnification */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">11. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to indemnify and hold harmless DotNation, its affiliates, and their respective officers, directors, 
              employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your 
              use of the Platform, violation of these Terms, or infringement of any rights of third parties.
            </p>
          </div>

          {/* Modifications */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">12. Modifications to Terms</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Platform. 
              We will notify users of material changes through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Platform announcements</li>
              <li>Email notifications (if provided)</li>
              <li>Updated &quot;Last Updated&quot; date</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
            </p>
          </div>

          {/* Termination */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">13. Termination</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We may suspend or terminate your access to the Platform at any time for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Risk to other users or the Platform</li>
              <li>Prolonged inactivity</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Upon termination, your right to use the Platform ceases, but provisions that should survive (such as 
              limitation of liability) will remain in effect.
            </p>
          </div>

          {/* Governing Law */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">14. Governing Law and Disputes</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising 
              from these Terms or your use of the Platform shall be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong className="text-white">Informal Resolution:</strong> First attempt to resolve disputes by contacting us directly</li>
              <li><strong className="text-white">Arbitration:</strong> If informal resolution fails, disputes may be submitted to binding arbitration</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              You agree to waive any right to participate in class action lawsuits against DotNation.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">15. Contact Information</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-3 text-white/80">
              <p>
                <strong className="text-white">Email:</strong> legal@dotnation.io
              </p>
              <p>
                <strong className="text-white">GitHub:</strong> github.com/dotnation/platform/issues
              </p>
              <p>
                <strong className="text-white">Community:</strong> Join our Discord or Telegram for general inquiries
              </p>
            </div>
          </div>

          {/* Agreement Notice */}
          <div className="bg-primary/10 border-2 border-primary/30 backdrop-blur-lg rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Your Agreement</h3>
                <p className="text-white/80 leading-relaxed">
                  By connecting your wallet and using DotNation, you acknowledge that you have read, understood, and 
                  agree to be bound by these Terms of Service. If you are using the Platform on behalf of an organization, 
                  you represent that you have the authority to bind that organization to these Terms.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TermsPage;
