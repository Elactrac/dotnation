import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext.jsx';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { parseDOT, isValidAddress, isValidPositiveNumber } from '../utils/formatters';
import { asyncHandler } from '../utils/errorHandler';

const CreateCampaignPage = () => {
  const { selectedAccount } = useWallet();
  const { createCampaign } = useCampaign();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiary: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.goal) {
      newErrors.goal = 'Goal amount is required';
    } else if (!isValidPositiveNumber(formData.goal)) {
      newErrors.goal = 'Goal must be a positive number';
    } else if (parseFloat(formData.goal) < 1) {
      newErrors.goal = 'Goal must be at least 1 DOT';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      if (deadlineDate <= minDate) {
        newErrors.deadline = 'Deadline must be at least 24 hours from now';
      }
    }

    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = 'Beneficiary address is required';
    } else if (!isValidAddress(formData.beneficiary)) {
      newErrors.beneficiary = 'Invalid Polkadot address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = asyncHandler(async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error('Please connect your wallet to create a campaign');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating campaign...');

    try {
      const goalInPlanck = parseDOT(formData.goal);
      const deadlineInMs = new Date(formData.deadline).getTime();

      await createCampaign(
        formData.title,
        formData.description,
        goalInPlanck,
        deadlineInMs,
        formData.beneficiary
      );

      toast.success('Campaign created successfully!', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error(error.message || 'Failed to create campaign', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white">Create New Campaign</h1>
        <p className="mt-4 text-lg text-white/60 font-body">Launch your crowdfunding campaign on the blockchain</p>
      </div>

      <div className="p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-2">Campaign Title</label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Enter a compelling campaign title"
                      value={formData.title}
                      onChange={handleChange('title')}
                      className={`w-full bg-white/5 border ${errors.title ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:outline-none`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">Description</label>
                    <textarea
                      id="description"
                      placeholder="Describe your campaign and what you plan to achieve"
                      value={formData.description}
                      onChange={handleChange('description')}
                      rows={6}
                      className={`w-full bg-white/5 border ${errors.description ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:outline-none resize-vertical`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
                  </div>

                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-white/80 mb-2">Funding Goal (DOT)</label>
                    <input
                      id="goal"
                      type="number"
                      placeholder="100"
                      value={formData.goal}
                      onChange={handleChange('goal')}
                      step="0.01"
                      min="1"
                      className={`w-full bg-white/5 border ${errors.goal ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:outline-none`}
                    />
                    {errors.goal && <p className="text-red-500 text-sm mt-2">{errors.goal}</p>}
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-white/80 mb-2">Campaign Deadline</label>
                    <input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={handleChange('deadline')}
                      className={`w-full bg-white/5 border ${errors.deadline ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:outline-none`}
                    />
                    {errors.deadline && <p className="text-red-500 text-sm mt-2">{errors.deadline}</p>}
                  </div>

                  <div>
                    <label htmlFor="beneficiary" className="block text-sm font-medium text-white/80 mb-2">Beneficiary Address</label>
                    <input
                      id="beneficiary"
                      placeholder="5GrwvaEF5zXb26Fz9rc..."
                      value={formData.beneficiary}
                      onChange={handleChange('beneficiary')}
                      className={`w-full bg-white/5 border ${errors.beneficiary ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-white/40 font-mono focus:ring-2 focus:ring-primary focus:outline-none`}
                    />
                    {errors.beneficiary && <p className="text-red-500 text-sm mt-2">{errors.beneficiary}</p>}
                    <p className="text-xs text-white/50 mt-2">Enter the Polkadot address that will receive the funds</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center rounded-full h-12 px-6 bg-primary text-white text-base font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
                  </button>
                </form>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
