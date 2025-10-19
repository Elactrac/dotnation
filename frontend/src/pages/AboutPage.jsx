

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center container-padding">
      <div className="max-w-4xl mx-auto text-center space-card">
        <h1 className="text-display-xl mb-8">About DotNation</h1>
        <p className="text-body-lg mb-6 text-text-secondary">
          DotNation is a decentralized crowdfunding platform built on Polkadot, enabling transparent and secure fundraising through smart contracts.
        </p>
        <p className="text-body-lg text-text-secondary">
          Our mission is to democratize funding for visionary ideas, ensuring transparency, security, and community governance.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;