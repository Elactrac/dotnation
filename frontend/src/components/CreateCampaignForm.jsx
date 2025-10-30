import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext';

// Reusable form components for consistent styling
const FormField = ({ label, name, error, children, required }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-bold font-display text-gray-100">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
        {children}
        {error && <p className="text-red-400 text-sm mt-1 font-body">{error}</p>}
    </div>
);
FormField.propTypes = { label: PropTypes.string, name: PropTypes.string, error: PropTypes.string, children: PropTypes.node, required: PropTypes.bool };

const InputField = (props) => <input {...props} className={`w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-600 ${props.className || ''}`} />;
InputField.propTypes = { className: PropTypes.string };
const TextareaField = (props) => <textarea {...props} className={`w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-600 resize-none ${props.className || ''}`} />;
TextareaField.propTypes = { className: PropTypes.string };

/**
 * A comprehensive form for creating a new fundraising campaign.
 *
 * This component provides a user interface for inputting all the necessary details
 * for a new campaign, such as title, description, funding goal, and beneficiary.
 * It includes features like AI-powered description generation and a final summary
 * confirmation step before submission.
 *
 * @param {object} props - The component props.
 * @param {function} props.onSuccess - A callback function to be executed upon
 *   successful campaign creation.
 * @returns {JSX.Element} The rendered campaign creation form.
 */
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
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

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
      console.log('AI response:', data);
      setFormData(prev => {
        const newFormData = { ...prev, description: data.description };
        console.log('New form data:', newFormData);
        return newFormData;
      });
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

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmedTag = tagInput.trim().toLowerCase();
      if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
        setTagInput('');
      } else if (formData.tags.length >= 5) {
        toast.error('Maximum 5 tags allowed');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Title */}
        <FormField label="Campaign Title" name="title" error={errors.title} required>
          <InputField 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Enter a compelling campaign title" 
          />
        </FormField>

        {/* Description with AI */}
        <FormField label="Description" name="description" error={errors.description} required>
          <div className="relative">
            <TextareaField
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell your story... or use AI to generate a compelling description based on your title"
              rows={8}
              className="pr-32"
            />
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !formData.title}
              className="absolute bottom-3 right-3 px-4 py-2 text-sm font-body bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isGenerating ? '⏳' : '✨'}</span>
              {isGenerating ? 'Generating...' : 'Generate AI'}
            </button>
          </div>
        </FormField>

        {/* Goal and Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField label="Funding Goal (DOT)" name="goal" error={errors.goal} required>
             <InputField 
               name="goal" 
               type="number" 
               value={formData.goal} 
               onChange={handleChange} 
               placeholder="1000" 
               step="0.01"
               min="0"
             />
           </FormField>
           <FormField label="Campaign Deadline" name="deadline" error={errors.deadline} required>
             <InputField 
               name="deadline" 
               type="datetime-local" 
               value={formData.deadline} 
               onChange={handleChange} 
               min={new Date().toISOString().slice(0, 16)} 
             />
           </FormField>
         </div>

        {/* Beneficiary */}
        <FormField label="Beneficiary Address" name="beneficiary" error={errors.beneficiary} required>
          <InputField 
            name="beneficiary" 
            value={formData.beneficiary} 
            onChange={handleChange} 
            placeholder="Enter the beneficiary's Polkadot address" 
          />
        </FormField>

        {/* Category and Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField label="Category" name="category">
             <InputField 
               name="category" 
               value={formData.category} 
               onChange={handleChange} 
               placeholder="e.g., Technology, Healthcare" 
             />
           </FormField>
           <FormField label="Campaign Image URL" name="imageUrl">
             <InputField 
               name="imageUrl" 
               value={formData.imageUrl} 
               onChange={handleChange} 
               placeholder="https://example.com/image.png" 
             />
           </FormField>
         </div>

        {/* Tags */}
        <FormField label="Tags" name="tags">
          <div className="space-y-3">
            <div className="flex gap-2">
              <InputField
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full text-sm font-body text-gray-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 font-body">Add up to 5 tags to help people discover your campaign</p>
          </div>
        </FormField>

        {/* Website */}
        <FormField label="Website" name="website">
          <InputField 
            name="website" 
            value={formData.website} 
            onChange={handleChange} 
            placeholder="https://myproject.com" 
          />
        </FormField>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGeneratingSummary}
          className="w-full h-14 text-lg font-bold font-display bg-gradient-to-r from-primary to-secondary hover:shadow-glow text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGeneratingSummary ? '⏳ Generating Summary...' : isSubmitting ? '🚀 Creating Campaign...' : '✨ Create Campaign'}
        </button>
        {!selectedAccount && (
          <div className="text-center">
            <p className="text-orange-400 text-sm font-body bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
              ⚠️ Wallet connection required for actual deployment
            </p>
          </div>
        )}
      </div>

      {/* Contract Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 border-2 border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-lg animate-scale-in">
            <div className="p-8">
              <h2 className="text-2xl font-bold font-display mb-6 text-gray-100 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Campaign Contract Summary
              </h2>
              <div className="mb-8">
                <div className="whitespace-pre-wrap text-sm font-body text-gray-300 bg-gray-800/70 p-6 rounded-xl border border-gray-600">
                  {contractSummary}
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-600 rounded-xl text-gray-300 font-body font-medium hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? '⏳ Creating...' : '✅ Confirm & Create Campaign'}
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