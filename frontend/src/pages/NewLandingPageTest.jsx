import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const NewLandingPageTest = () => {
  const { connectWallet } = useWallet();

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark">
      <div className="text-white text-center p-8">
        <h1 className="text-4xl font-bold">Test Landing Page</h1>
        <p>If you see this, the basic structure works</p>
        <button onClick={connectWallet} className="mt-4 px-6 py-2 bg-primary text-white rounded">
          Connect Wallet
        </button>
        <Link to="/dashboard" className="block mt-4 text-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default NewLandingPageTest;
