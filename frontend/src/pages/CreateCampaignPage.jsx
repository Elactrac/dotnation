import { useNavigate } from 'react-router-dom';
import { CreateCampaignForm } from '../components/CreateCampaignForm.jsx';
import { useCampaign } from '../contexts/CampaignContext';

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { refreshCampaigns } = useCampaign();

  const handleSuccess = async () => {
    // Ensure campaigns are refreshed before navigating
    await refreshCampaigns();
    navigate('/dashboard');
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-6">
            Create New Campaign
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-body max-w-3xl mx-auto">
            Launch your crowdfunding campaign on the blockchain with AI-powered assistance
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-gray-700 p-6 md:p-10 lg:p-14 shadow-2xl hover:border-primary/50 transition-all duration-500">
          <CreateCampaignForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
