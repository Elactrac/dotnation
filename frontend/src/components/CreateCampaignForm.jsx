import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useCampaign } from '../contexts/CampaignContext';
import { useApi } from '../contexts/ApiContext';
import {
  validateCampaignTitle,
  validateCampaignDescription,
  validateSubstrateAddress,
  validateGoalAmount,
} from '../utils/validation';
import { generateDescription, generateTitles, detectFraud, generateContractSummary } from '../utils/aiApi';

// Reusable form components for consistent styling
const FormField = ({ label, name, error, children, required }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-bold font-display text-gray-100">
          {label}
          {required && <span className="text-primary ml-1" aria-label="required">*</span>}
        </label>
        {children}
        {error && (
          <p 
            className="text-red-400 text-sm mt-1 font-body" 
            id={`${name}-error`}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
    </div>
);
FormField.propTypes = { label: PropTypes.string, name: PropTypes.string, error: PropTypes.string, children: PropTypes.node, required: PropTypes.bool };

const InputField = (props) => {
  const hasError = props['aria-invalid'] === 'true';
  return (
    <input 
      {...props} 
      aria-describedby={hasError && props.name ? `${props.name}-error` : props['aria-describedby']}
      className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${hasError ? 'border-red-500' : 'border-gray-700'} rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-600 ${props.className || ''}`} 
    />
  );
};
InputField.propTypes = { className: PropTypes.string, name: PropTypes.string, 'aria-invalid': PropTypes.string, 'aria-describedby': PropTypes.string };

const TextareaField = (props) => {
  const hasError = props['aria-invalid'] === 'true';
  return (
    <textarea 
      {...props} 
      aria-describedby={hasError && props.name ? `${props.name}-error` : props['aria-describedby']}
      className={`w-full px-4 py-3 bg-gray-800/50 border-2 ${hasError ? 'border-red-500' : 'border-gray-700'} rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-600 resize-none ${props.className || ''}`} 
    />
  );
};
TextareaField.propTypes = { className: PropTypes.string, name: PropTypes.string, 'aria-invalid': PropTypes.string, 'aria-describedby': PropTypes.string };

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
  const { createCampaign, refreshCampaigns } = useCampaign();
  const { contract, api } = useApi();

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
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [fraudCheckResult, setFraudCheckResult] = useState(null);
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);

  const validateForm = () => {
    console.log('[CreateCampaignForm] Validating form...');
    const newErrors = {};
    
    // Title validation
    try {
      validateCampaignTitle(formData.title);
    } catch (validationError) {
      newErrors.title = validationError.message;
    }
    
    // Description validation
    try {
      validateCampaignDescription(formData.description);
      if (formData.description.length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }
    } catch (validationError) {
      newErrors.description = validationError.message;
    }
    
    // Goal validation
    try {
      validateGoalAmount(formData.goal);
    } catch (validationError) {
      newErrors.goal = validationError.message;
    }
    
    // Deadline validation
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      if (deadlineDate <= oneHourFromNow) {
        newErrors.deadline = 'Deadline must be at least 1 hour in the future';
      } else if (deadlineDate > oneYearFromNow) {
        newErrors.deadline = 'Deadline must be within 1 year';
      }
    }
    
    // Beneficiary validation
    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = 'Beneficiary address is required';
    } else if (!validateSubstrateAddress(formData.beneficiary)) {
      newErrors.beneficiary = 'Invalid Polkadot address format';
    }
    
    console.log('[CreateCampaignForm] Validation errors:', newErrors);
    console.log('[CreateCampaignForm] Has errors:', Object.keys(newErrors).length > 0);
    
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
      const data = await generateDescription(formData.title);
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

  const handleGenerateTitles = async () => {
    setIsGenerating(true);
    try {
      const keywords = formData.title || formData.category || 'help community';
      const data = await generateTitles(keywords, formData.category);
      setTitleSuggestions(data.titles);
      setShowTitleSuggestions(true);
      toast.success('Title suggestions generated!');
    } catch (error) {
      console.error("Title generation error:", error);
      toast.error(`Title Generation Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectTitle = (title) => {
    setFormData(prev => ({ ...prev, title }));
    setShowTitleSuggestions(false);
    setErrors(prev => ({ ...prev, title: undefined }));
  };

  const handleFraudCheck = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please enter a title and description first.');
      return;
    }
    setIsCheckingFraud(true);
    try {
      const result = await detectFraud({
        title: formData.title,
        description: formData.description,
        goal: parseFloat(formData.goal),
        beneficiary: formData.beneficiary,
        category: formData.category,
      });
      setFraudCheckResult(result);
      const statusType = result.riskLevel === 'low' ? 'success' : result.riskLevel === 'high' ? 'error' : 'warning';
      toast[statusType === 'error' ? 'error' : statusType === 'warning' ? 'error' : 'success'](
        `Risk Level: ${result.riskLevel.toUpperCase()} (Score: ${result.riskScore}/100)`
      );
    } catch (error) {
      console.error("Fraud check error:", error);
      toast.error(`Fraud Check Failed: ${error.message}`);
    } finally {
      setIsCheckingFraud(false);
    }
  };

  const handleGenerateContractSummary = async () => {
    console.log('[CreateCampaignForm] Starting contract summary generation...');
    console.log('[CreateCampaignForm] Generating contract summary with data:', {
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      deadline: formData.deadline,
      beneficiary: formData.beneficiary,
    });
    
    try {
      const data = await generateContractSummary({
        title: formData.title,
        description: formData.description,
        goal: parseFloat(formData.goal),
        deadline: formData.deadline,
        beneficiary: formData.beneficiary,
      });
      
      console.log('[CreateCampaignForm] ✅ Received summary data:', data);
      
      // Use AI summary or fallback
      const summary = data.summary || `
Campaign Overview:
Title: ${formData.title}
Description: ${formData.description.substring(0, 100)}...
Goal: ${formData.goal} DOT
Deadline: ${new Date(formData.deadline).toLocaleDateString()}
Beneficiary: ${formData.beneficiary.substring(0, 10)}...

By confirming, you will create this campaign on the blockchain.
      `.trim();
      
      setContractSummary(summary);
      console.log('[CreateCampaignForm] Contract summary set, opening modal...');
      
      // Use setTimeout to ensure state is updated before showing modal
      setTimeout(() => {
        setShowModal(true);
        console.log('[CreateCampaignForm] Modal state set to true');
      }, 100);
      
    } catch (error) {
      console.error('[CreateCampaignForm] ❌ Contract summary generation error:', error);
      console.error('[CreateCampaignForm] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Show user-friendly error with fallback option
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Use fallback summary even on error
      const fallbackSummary = `
Campaign Overview:
Title: ${formData.title}
Description: ${formData.description.substring(0, 100)}...
Goal: ${formData.goal} DOT
Deadline: ${new Date(formData.deadline).toLocaleDateString()}
Beneficiary: ${formData.beneficiary.substring(0, 10)}...

By confirming, you will create this campaign on the blockchain.
      `.trim();
      
      setContractSummary(fallbackSummary);
      
      // Show warning but still open modal
      toast.error(`AI summary unavailable: ${errorMessage}. Using basic summary.`, { duration: 5000 });
      
      setTimeout(() => {
        setShowModal(true);
        console.log('[CreateCampaignForm] Modal opened with fallback summary');
      }, 100);
      
    } finally {
      console.log('[CreateCampaignForm] Summary generation complete, setting isGeneratingSummary to false');
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CreateCampaignForm] 🚀 Form submitted');
    console.log('[CreateCampaignForm] Form data:', formData);
    console.log('[CreateCampaignForm] Selected account:', selectedAccount);
    
    // Prevent double submission
    if (isSubmitting || isGeneratingSummary) {
      console.log('[CreateCampaignForm] ⚠️  Already submitting, ignoring duplicate submission');
      return;
    }
    
    // Validate form first
    console.log('[CreateCampaignForm] Validating form...');
    const isValid = validateForm();
    console.log('[CreateCampaignForm] Validation result:', isValid);
    
    if (!isValid) {
      console.log('[CreateCampaignForm] ❌ Form validation failed');
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    console.log('[CreateCampaignForm] ✅ Form validation passed, generating AI summary...');
    
    try {
      await handleGenerateContractSummary();
      console.log('[CreateCampaignForm] ✅ Summary generation completed successfully');
    } catch (error) {
      console.error('[CreateCampaignForm] ❌ Error in handleSubmit:', error);
      // Error is already handled and shown in handleGenerateContractSummary
    }
  };

  const handleConfirmCreate = async () => {
    if (!selectedAccount) {
      toast.error('Please connect your wallet to create a campaign');
      setShowModal(false);
      return;
    }

    setShowModal(false);
    setIsSubmitting(true);
    
    try {
      // Prepare campaign data for contract
      const campaignData = {
        title: formData.title,
        description: formData.description,
        goal: formData.goal,
        deadline: new Date(formData.deadline).getTime(),
        beneficiary: formData.beneficiary,
      };

      console.log('Creating campaign with data:', campaignData);

      // Call the createCampaign function from CampaignContext
      const result = await createCampaign(campaignData);

      // Check if we're in mock mode (no contract)
      if (!contract) {
        // Mock mode - campaign created successfully
        console.log('Campaign created in mock mode:', result);
        toast.success('Campaign created successfully!');
        
        // Refresh campaigns list
        await refreshCampaigns();
        
        setIsSubmitting(false);
        onSuccess();
        return;
      }

      // Real blockchain mode - sign and send transaction
      const injector = await import('@polkadot/extension-dapp').then(m => m.web3FromAddress(selectedAccount.address));
      const signer = (await injector).signer;

      await result.signAndSend(selectedAccount.address, { signer }, ({ status, events }) => {
        if (status.isInBlock) {
          console.log(`Transaction included in block hash: ${status.asInBlock.toHex()}`);
        } else if (status.isFinalized) {
          console.log(`Transaction finalized in block hash: ${status.asFinalized.toHex()}`);
          
          // Check for success event
          let success = false;
          events.forEach(({ event }) => {
            if (event.method === 'ExtrinsicSuccess') {
              success = true;
            } else if (event.method === 'ExtrinsicFailed') {
              // Parse the dispatch error
              const [dispatchError] = event.data;
              let errorMessage = 'Campaign creation failed';
              
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
                console.error('Module error:', decoded);
              } else {
                errorMessage = dispatchError.toString();
              }
              
              console.error('Extrinsic failed:', errorMessage);
              toast.error(errorMessage);
              setIsSubmitting(false);
            }
          });
          
          if (success) {
            toast.success('Campaign created successfully!');
            
            // Refresh campaigns list
            refreshCampaigns();
            
            onSuccess();
          }
          
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
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
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto" aria-label="Create campaign form">
      <div className="space-y-6">
        {/* Fraud Check Result Banner */}
        <AnimatePresence>
          {fraudCheckResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl border ${
                fraudCheckResult.riskLevel === 'low'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : fraudCheckResult.riskLevel === 'medium'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-lg">
                  AI Fraud Analysis: {fraudCheckResult.riskLevel.toUpperCase()} Risk ({fraudCheckResult.riskScore}/100)
                </div>
                <button
                  onClick={() => setFraudCheckResult(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  type="button"
                  aria-label="Dismiss fraud analysis result"
                >
                  ×
                </button>
              </div>
              {fraudCheckResult.flags.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold text-sm mb-1">Red Flags:</div>
                  <ul className="text-xs space-y-1 ml-4">
                    {fraudCheckResult.flags.map((flag, idx) => (
                      <li key={idx} className="list-disc">{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {fraudCheckResult.recommendations.length > 0 && (
                <div>
                  <div className="font-semibold text-sm mb-1">Recommendations:</div>
                  <ul className="text-xs space-y-1 ml-4">
                    {fraudCheckResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="list-disc">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <FormField label="Campaign Title" name="title" error={errors.title} required>
          <div className="space-y-2">
            <div className="flex gap-2">
              <InputField 
                id="title"
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Enter a compelling campaign title" 
                className="flex-1"
                maxLength={100}
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-required="true"
              />
              <button
                type="button"
                onClick={handleGenerateTitles}
                disabled={isGenerating}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                aria-label="Generate AI title suggestions"
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✨</span>
                    <span>AI Titles</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {formData.title.length}/100 characters
            </div>
            
            {/* Title Suggestions */}
            <AnimatePresence>
              {showTitleSuggestions && titleSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                  role="region"
                  aria-label="AI title suggestions"
                  aria-live="polite"
                >
                  <div className="text-sm text-gray-400 font-semibold">AI Suggestions (click to use):</div>
                  {titleSuggestions.map((title, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => selectTitle(title)}
                      className="w-full text-left px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-gray-300 transition-colors"
                      aria-label={`Use suggestion: ${title}`}
                    >
                      {title}
                    </motion.button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowTitleSuggestions(false)}
                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                    aria-label="Close title suggestions"
                  >
                    Close suggestions
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormField>

        {/* Description with AI */}
        <FormField label="Description" name="description" error={errors.description} required>
          <div className="relative">
            <TextareaField
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell your story... or use AI to generate a compelling description based on your title"
              rows={8}
              className="pr-32"
              maxLength={1000}
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-required="true"
            />
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !formData.title}
              className="absolute bottom-3 right-3 px-4 py-2 text-sm font-body bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Generate AI description from title"
            >
              <span aria-hidden="true">{isGenerating ? '⏳' : '✨'}</span>
              {isGenerating ? 'Generating...' : 'Generate AI'}
            </button>
          </div>
          <div className="text-xs text-gray-400 text-right mt-1">
            {formData.description.length}/1000 characters
          </div>
        </FormField>

        {/* Goal and Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField label="Funding Goal (DOT)" name="goal" error={errors.goal} required>
             <InputField 
               id="goal"
               name="goal" 
               type="number" 
               value={formData.goal} 
               onChange={handleChange} 
               placeholder="1000" 
               step="0.01"
               min="0"
               aria-invalid={errors.goal ? 'true' : 'false'}
               aria-required="true"
             />
           </FormField>
           <FormField label="Campaign Deadline" name="deadline" error={errors.deadline} required>
             <InputField 
               id="deadline"
               name="deadline" 
               type="datetime-local" 
               value={formData.deadline} 
               onChange={handleChange} 
               min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
               max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
               aria-invalid={errors.deadline ? 'true' : 'false'}
               aria-required="true"
               aria-describedby="deadline-help"
             />
             <p className="text-xs text-gray-400 font-body mt-1" id="deadline-help">
               Must be between 1 hour and 1 year from now
             </p>
           </FormField>
         </div>

        {/* Beneficiary */}
        <FormField label="Beneficiary Address" name="beneficiary" error={errors.beneficiary} required>
          <div className="space-y-2">
            <div className="flex gap-2">
              <InputField 
                id="beneficiary"
                name="beneficiary" 
                value={formData.beneficiary} 
                onChange={handleChange} 
                placeholder="Enter the beneficiary's Polkadot address"
                className="flex-1"
                aria-invalid={errors.beneficiary ? 'true' : 'false'}
                aria-required="true"
                aria-describedby="beneficiary-help"
              />
              {selectedAccount && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, beneficiary: selectedAccount.address }));
                    setErrors(prev => ({ ...prev, beneficiary: undefined }));
                  }}
                  className="px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium whitespace-nowrap"
                  aria-label="Use my wallet address as beneficiary"
                >
                  Use My Address
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 font-body" id="beneficiary-help">
              The Polkadot address that will receive the funds when the goal is reached
            </p>
          </div>
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

        {/* AI Fraud Check Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleFraudCheck}
            disabled={isCheckingFraud || !formData.title || !formData.description}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Run AI fraud detection analysis"
            aria-describedby="fraud-check-help"
          >
            {isCheckingFraud ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                <span>Analyzing Campaign...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Run AI Fraud Detection</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2" id="fraud-check-help">
            AI will analyze your campaign for potential fraud indicators before submission
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGeneratingSummary}
          className="w-full h-14 text-lg font-bold font-display bg-gradient-to-r from-primary to-secondary hover:shadow-glow text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none hover:scale-[1.02] active:scale-[0.98]"
          aria-label={isGeneratingSummary ? 'Generating campaign summary' : isSubmitting ? 'Creating campaign on blockchain' : 'Create campaign'}
        >
          {isGeneratingSummary ? '⏳ Generating Summary...' : isSubmitting ? '🚀 Creating Campaign...' : '✨ Create Campaign'}
        </button>
        {!selectedAccount && (
          <div className="text-center">
            <p className="text-orange-400 text-sm font-body bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3" role="alert">
              ⚠️ Wallet connection required for actual deployment
            </p>
          </div>
        )}
      </div>

      {/* Contract Summary Modal */}
      {console.log('[CreateCampaignForm] Modal render check - showModal:', showModal, 'contractSummary:', contractSummary?.substring(0, 50))}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-gray-900/95 border-2 border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-lg animate-scale-in">
            <div className="p-8">
              <h2 
                id="modal-title"
                className="text-2xl font-bold font-display mb-6 text-gray-100 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
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
                  aria-label="Cancel campaign creation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                  aria-label="Confirm and create campaign on blockchain"
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