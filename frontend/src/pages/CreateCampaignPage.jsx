import { useNavigate } from 'react-router-dom';
import { CreateCampaignForm } from '../components/CreateCampaignForm.jsx';

const CreateCampaignPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white">Create New Campaign</h1>
        <p className="mt-4 text-lg text-white/60 font-body">Launch your crowdfunding campaign on the blockchain with AI assistance</p>
      </div>

      <div className="p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <CreateCampaignForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreateCampaignPage;
