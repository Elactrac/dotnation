import { useNavigate } from 'react-router-dom';
import { CreateCampaignForm } from '../components/CreateCampaignForm.jsx';

const CreateCampaignPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,116,255,0.04)_0%,transparent_50%)] animate-pulse-slow" />
        <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(0,234,211,0.03)_0%,transparent_50%)] animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="fixed top-10 right-20 w-72 h-72 opacity-15 animate-float-slow pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" className="text-primary"/>
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2" className="text-secondary"/>
          <circle cx="100" cy="100" r="30" fill="currentColor" className="text-primary/30"/>
        </svg>
      </div>
      
      <div className="fixed bottom-10 left-20 w-64 h-64 opacity-10 animate-float-slower pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20L180 100L100 180L20 100Z" stroke="currentColor" strokeWidth="2" className="text-secondary"/>
          <path d="M100 50L150 100L100 150L50 100Z" fill="currentColor" className="text-secondary/20"/>
        </svg>
      </div>

      <div className="fixed top-1/2 left-10 w-48 h-48 opacity-10 animate-float-slow pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="50" width="100" height="100" stroke="currentColor" strokeWidth="2" className="text-primary" transform="rotate(45 100 100)"/>
          <circle cx="100" cy="100" r="20" fill="currentColor" className="text-secondary/30"/>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 mx-auto">
        <div className="mb-12 text-center fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-6">
            Create New Campaign
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-body max-w-3xl mx-auto">
            Launch your crowdfunding campaign on the blockchain with AI-powered assistance
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-gray-700 p-6 md:p-10 lg:p-14 shadow-2xl hover:border-primary/50 transition-all duration-500 scale-in">
          <CreateCampaignForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
