

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">About DotNation</h1>
        <p className="text-lg mb-6">
          DotNation is a decentralized crowdfunding platform built on the Polkadot ecosystem.
          We empower creators and communities to fund innovative projects through trustless, on-chain mechanisms.
        </p>
        <p className="text-lg">
          Our mission is to democratize funding for visionary ideas, ensuring transparency, security, and community governance.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;