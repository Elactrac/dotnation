import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext';

// Reusable form components for consistent styling
const FormField = ({ label, name, error, children }) => (
    <div className="form-group">
        <label htmlFor={name} className="form-label">{label}</label>
        {children}
        {error && <p className="form-error">{error}</p>}
    </div>
);
FormField.propTypes = { label: PropTypes.string, name: PropTypes.string, error: PropTypes.string, children: PropTypes.node };

const InputField = (props) => <input {...props} className={`input-primary ${props.className || ''}`} />;
InputField.propTypes = { className: PropTypes.string };
const TextareaField = (props) => <textarea {...props} className={`input-primary ${props.className || ''}`} />;
TextareaField.propTypes = { className: PropTypes.string };


export const CreateCampaignForm = ({ onSuccess }) => {
  const { selectedAccount } = useWallet();

  console.log('CreateCampaignForm render - selectedAccount:', selectedAccount);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiary: '',
    category: '',
    imageUrl: '',
    website: '',
    socialLinks: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contractSummary, setContractSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.goal || formData.goal <= 0) newErrors.goal = 'Goal must be greater than 0';
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }
    if (!formData.beneficiary.trim()) newErrors.beneficiary = 'Beneficiary address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      toast.error('Please enter a campaign title first.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title }),
      });
      if (!response.ok) throw new Error('Failed to get a response from the AI service.');
      const data = await response.json();
      setFormData(prev => ({ ...prev, description: data.description }));
      toast.success('Description generated!');
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(`AI Generation Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContractSummary = async () => {
    setIsGeneratingSummary(true);
    console.log('Generating contract summary with data:', {
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      deadline: formData.deadline,
      beneficiary: formData.beneficiary,
    });
    try {
      const response = await fetch('http://localhost:3001/api/contract-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          goal: formData.goal,
          deadline: formData.deadline,
          beneficiary: formData.beneficiary,
        }),
      });
      console.log('API response status:', response.status);
      if (!response.ok) throw new Error(`Failed to generate contract summary: ${response.status}`);
      const data = await response.json();
      console.log('Received summary:', data.summary);
      setContractSummary(data.summary);
      setShowModal(true);
    } catch (error) {
      console.error("Contract summary generation error:", error);
      toast.error(`Summary Generation Failed: ${error.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, validating...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    console.log('Form validation passed, generating summary...');
    await handleGenerateContractSummary();
  };

  const handleConfirmCreate = async () => {
    setShowModal(false);
    setIsSubmitting(true);
    try {
      // For testing: Skip actual contract deployment
      console.log('TEST MODE: Skipping contract deployment');
      console.log('Would deploy with:', {
        title: formData.title,
        description: formData.description,
        goal: Math.floor(parseFloat(formData.goal) * 1_000_000_000_000),
        deadline: new Date(formData.deadline).getTime(),
        beneficiary: formData.beneficiary
      });

      // Simulate successful creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      toast.success('Campaign created! (Test Mode) - This was a test, no real contract deployed.');
      onSuccess();
    } catch (error) {
      toast.error(`Failed to create campaign: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
        <FormField label="Campaign Title" name="title" error={errors.title}>
          <InputField name="title" value={formData.title} onChange={handleChange} placeholder="My Awesome Project" />
        </FormField>

        <div>
           <div className="flex justify-between items-center mb-3">
             <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">Description</label>
             <button
               type="button"
               onClick={handleGenerateDescription}
               disabled={isGenerating || !formData.title}
               className="px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isGenerating ? 'Generating...' : '✨ Generate with AI'}
             </button>
           </div>
           <TextareaField
             name="description"
             value={formData.description}
             onChange={handleChange}
             placeholder="Describe your campaign, or generate one with AI after entering a title."
             rows={8}
           />
           {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <FormField label="Funding Goal (DOT)" name="goal" error={errors.goal}>
             <InputField name="goal" type="number" value={formData.goal} onChange={handleChange} placeholder="1000" />
           </FormField>
           <FormField label="Campaign Deadline" name="deadline" error={errors.deadline}>
             <InputField name="deadline" type="datetime-local" value={formData.deadline} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} />
           </FormField>
         </div>

        <FormField label="Beneficiary Address" name="beneficiary" error={errors.beneficiary}>
          <InputField name="beneficiary" value={formData.beneficiary} onChange={handleChange} placeholder="Enter the beneficiary's Polkadot address" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <FormField label="Category" name="category">
             <InputField name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Technology, Healthcare" />
           </FormField>
           <FormField label="Campaign Image URL" name="imageUrl">
             <InputField name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" />
           </FormField>
         </div>

        <FormField label="Website (Optional)" name="website">
          <InputField name="website" value={formData.website} onChange={handleChange} placeholder="https://myproject.com" />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting || isGeneratingSummary}
          className="btn-primary w-full h-12 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isGeneratingSummary ? 'Generating Summary...' : isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
        </button>
        {!selectedAccount && <p className="text-center text-orange-500 text-sm">Note: Wallet connection required for actual deployment.</p>}
      </div>

      {/* Contract Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-100">Campaign Contract Summary</h2>
              <div className="mb-6">
                <div className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800 p-4 rounded-lg border border-gray-600">
                  {contractSummary}
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-gray-100 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Confirm & Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

CreateCampaignForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};