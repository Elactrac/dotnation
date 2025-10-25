import { useNavigate } from 'react-router-dom';
import { CreateCampaignForm } from '../components/CreateCampaignForm.jsx';

const CreateCampaignPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-gray-100">Create New Campaign</h1>
        <p className="mt-6 text-xl text-gray-300 font-body max-w-2xl mx-auto">Launch your crowdfunding campaign on the blockchain with AI assistance</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 lg:p-12 shadow-2xl">
        <CreateCampaignForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CreateCampaignPage;
