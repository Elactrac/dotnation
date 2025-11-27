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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-text-primary mb-6">
            Create New Campaign
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            Launch your crowdfunding campaign on the blockchain with AI-powered assistance
          </p>
        </div>

        <div className="bg-background-surface/50 backdrop-blur-glass rounded-sm border border-border-subtle p-6 md:p-10 lg:p-14 shadow-glass">
          <CreateCampaignForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
