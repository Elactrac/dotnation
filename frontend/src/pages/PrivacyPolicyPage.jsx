/**
 * @file Privacy Policy page for DotNation
 * @exports PrivacyPolicyPage
 */
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Privacy Policy
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
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Introduction</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Welcome to DotNation. We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized 
              crowdfunding platform built on the Polkadot network.
            </p>
            <p className="text-white/80 leading-relaxed">
              By using DotNation, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our platform.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">1. Blockchain Data</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              As a decentralized application, DotNation interacts with the Polkadot blockchain. The following information is stored on-chain:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Your wallet address (public key)</li>
              <li>Campaign creation data (title, description, funding goals, deadlines)</li>
              <li>Transaction history (donations, withdrawals)</li>
              <li>Campaign status and milestones</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              <strong className="text-white">Important:</strong> Blockchain data is public, permanent, and immutable. 
              Anyone can view transactions associated with your wallet address on the Polkadot network.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2. Wallet Connection</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              When you connect your wallet (e.g., Polkadot.js extension), we access:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Your wallet address</li>
              <li>Account balance (read-only)</li>
              <li>Network connection status</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              We never store your private keys or seed phrases. Your wallet credentials remain secure in your browser extension.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">3. Usage Data</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              We may collect anonymous usage data to improve our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Interaction with features</li>
              <li>Error logs and performance metrics</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">How We Use Your Information</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-3 text-white/80 ml-4">
              <li><strong className="text-white">Platform Operation:</strong> To enable core functionality including campaign creation, donations, and withdrawals</li>
              <li><strong className="text-white">Transaction Processing:</strong> To facilitate blockchain transactions through smart contracts</li>
              <li><strong className="text-white">User Experience:</strong> To personalize and improve your experience on the platform</li>
              <li><strong className="text-white">Security:</strong> To detect, prevent, and address technical issues, fraud, and security vulnerabilities</li>
              <li><strong className="text-white">Analytics:</strong> To understand how users interact with our platform and improve our services</li>
              <li><strong className="text-white">Communication:</strong> To send important updates, security alerts, and platform notifications</li>
            </ul>
          </div>

          {/* Data Sharing and Disclosure */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Public Blockchain Data</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              All blockchain transactions are public by design. Anyone can view:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Campaign information you create</li>
              <li>Donation amounts and wallet addresses</li>
              <li>Campaign updates and milestones</li>
              <li>Withdrawal transactions</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Third-Party Services</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              We may share data with trusted third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li><strong className="text-white">Analytics Providers:</strong> For usage statistics and platform improvements</li>
              <li><strong className="text-white">Infrastructure Providers:</strong> For hosting and content delivery</li>
              <li><strong className="text-white">Error Tracking:</strong> For monitoring and fixing technical issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Legal Requirements</h3>
            <p className="text-white/80 leading-relaxed">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities 
              (e.g., a court or government agency).
            </p>
          </div>

          {/* Data Security */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Data Security</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure HTTPS connections</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Smart contract audits to prevent exploits</li>
              <li>No storage of private keys or sensitive wallet data</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Rights and Choices */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Your Rights and Choices</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You have the following rights regarding your information:
            </p>
            <ul className="list-disc list-inside space-y-3 text-white/80 ml-4">
              <li><strong className="text-white">Wallet Control:</strong> You can disconnect your wallet at any time through your browser extension</li>
              <li><strong className="text-white">Data Access:</strong> You can view all your on-chain data through blockchain explorers</li>
              <li><strong className="text-white">Usage Data:</strong> You can opt out of analytics tracking by using browser privacy tools</li>
              <li><strong className="text-white">Account Deletion:</strong> You can stop using the platform at any time (note: blockchain data is permanent)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <strong className="text-yellow-400">Important:</strong> Due to the immutable nature of blockchain technology, 
              we cannot delete or modify data that has been recorded on the Polkadot blockchain.
            </p>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Cookies and Tracking Technologies</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Maintain your session state</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features.
            </p>
          </div>

          {/* Third-Party Links */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Third-Party Links</h2>
            <p className="text-white/80 leading-relaxed">
              Our platform may contain links to third-party websites or services (e.g., Polkadot explorers, documentation). 
              We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Children&apos;s Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              DotNation is not intended for use by individuals under the age of 18. We do not knowingly collect personal information 
              from children. If you are a parent or guardian and believe your child has provided us with personal information, 
              please contact us immediately.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Changes to This Privacy Policy</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify users of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
              <li>Updating the &quot;Last Updated&quot; date at the top of this policy</li>
              <li>Posting a notice on our platform</li>
              <li>Sending notifications to connected wallets (for significant changes)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Your continued use of DotNation after any changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold font-display mb-4 text-white">Contact Us</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-3 text-white/80">
              <p>
                <strong className="text-white">Email:</strong> privacy@dotnation.io
              </p>
              <p>
                <strong className="text-white">GitHub:</strong> github.com/dotnation/platform/issues
              </p>
              <p>
                <strong className="text-white">Community:</strong> Join our Discord or Telegram for general inquiries
              </p>
            </div>
          </div>

          {/* Blockchain Transparency Notice */}
          <div className="bg-primary/10 border-2 border-primary/30 backdrop-blur-lg rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Blockchain Transparency</h3>
                <p className="text-white/80 leading-relaxed">
                  DotNation operates on public blockchain infrastructure. All campaign data, transactions, and smart contract 
                  interactions are permanently recorded on the Polkadot network and are publicly accessible. This transparency 
                  is fundamental to building trust in decentralized crowdfunding, but it means that on-chain activities cannot 
                  be made private or deleted after they occur.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
