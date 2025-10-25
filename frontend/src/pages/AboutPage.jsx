
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About DotNation
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Empowering innovation through decentralized crowdfunding on the Polkadot network
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display mb-6 text-white">Our Mission</h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                At DotNation, we believe that great ideas shouldn&apos;t be limited by traditional funding barriers.
                We&apos;re building a transparent, secure, and community-driven crowdfunding platform that empowers
                creators, innovators, and changemakers to bring their visions to life.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                By leveraging the power of blockchain technology and smart contracts, we ensure that every
                contribution is tracked, every project is accountable, and every success story is celebrated
                by the community that made it possible.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Transparency First</h3>
                    <p className="text-white/70">Every transaction is recorded on the blockchain, ensuring complete transparency and accountability.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Security by Design</h3>
                    <p className="text-white/70">Smart contracts ensure funds are only released when campaign goals are met, protecting both creators and contributors.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
                    <p className="text-white/70">Decisions are made by the community, ensuring the platform evolves according to user needs and values.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4 text-white">How It Works</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our platform combines the best of traditional crowdfunding with the security and transparency of blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Your Campaign</h3>
              <p className="text-white/70">
                Set your funding goal, timeline, and project details. Our AI assistant helps craft compelling campaign descriptions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Support</h3>
              <p className="text-white/70">
                Share your vision with the community. Receive contributions directly to your smart contract wallet.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Launch Your Project</h3>
              <p className="text-white/70">
                If your campaign succeeds, funds are automatically released. If not, all contributions are safely returned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display mb-6 text-white">Built on Polkadot</h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                DotNation leverages the Polkadot ecosystem to provide unparalleled security, scalability, and interoperability.
                Our smart contracts are deployed on parachains, ensuring fast transactions and low fees.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-white/80">Substrate-based smart contracts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-white/80">Cross-chain compatibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Decentralized governance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white/80">Community-driven development</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Technical Features</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/80">Smart Contract Language</span>
                  <span className="text-primary font-medium">ink!</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/80">Blockchain</span>
                  <span className="text-secondary font-medium">Polkadot</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/80">Wallet Integration</span>
                  <span className="text-green-400 font-medium">Polkadot.js</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/80">Frontend Framework</span>
                  <span className="text-purple-400 font-medium">React + Vite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-6 text-white">Join Our Community</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            DotNation is more than a platform—it&apos;s a community of innovators, supporters, and blockchain enthusiasts
            working together to fund the future.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Discord Community</h3>
              <p className="text-white/70 text-sm">Join discussions, get support, and connect with fellow innovators.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GitHub</h3>
              <p className="text-white/70 text-sm">Contribute to the codebase and help shape the future of crowdfunding.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Newsletter</h3>
              <p className="text-white/70 text-sm">Stay updated with the latest features and community news.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-6 text-white">Get In Touch</h2>
          <p className="text-lg text-white/80 mb-8">
            Have questions, feedback, or want to contribute? We&apos;d love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
              <p className="text-white/70 mb-4">Need help with your campaign or account?</p>
              <a href="mailto:support@dotnation.io" className="text-primary hover:text-primary/80 transition-colors">
                support@dotnation.io
              </a>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Partnerships</h3>
              <p className="text-white/70 mb-4">Interested in collaborating with us?</p>
              <a href="mailto:partnerships@dotnation.io" className="text-secondary hover:text-secondary/80 transition-colors">
                partnerships@dotnation.io
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;