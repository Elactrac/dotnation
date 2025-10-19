import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export const CreateCampaignForm = ({ onSuccess }) => {
  const { createCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();
  
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.goal || formData.goal <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = 'Beneficiary address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      toast({
        title: 'Please enter a campaign title first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: formData.title }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the AI service.');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, description: data.description }));
      toast({
        title: 'Description generated!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: 'AI Generation Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const deadlineTimestamp = new Date(formData.deadline).getTime();
      const goalAmount = Math.floor(parseFloat(formData.goal) * 1_000_000_000_000); // Convert to femto DOT

      await createCampaign({
        ...formData,
        goal: goalAmount,
        deadline: deadlineTimestamp,
      });

      toast({
        title: 'Campaign created!',
        description: 'Your fundraising campaign has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Failed to create campaign',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isInvalid={errors.title}>
          <FormLabel>Campaign Title</FormLabel>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter campaign title"
          />
          <FormErrorMessage>{errors.title}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.description}>
          <HStack justifyContent="space-between" w="full">
            <FormLabel>Description</FormLabel>
            <Button 
              size="xs" 
              onClick={handleGenerateDescription} 
              isLoading={isGenerating}
              loadingText="Generating..."
              disabled={!formData.title}
            >
              ✨ Generate with AI
            </Button>
          </HStack>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your campaign, or generate one with AI after entering a title."
            rows={6}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.goal}>
          <FormLabel>Funding Goal (DOT)</FormLabel>
          <NumberInput min={0}>
            <NumberInputField
              name="goal"
              value={formData.goal}
              onChange={(value) => handleChange({ target: { name: 'goal', value } })}
              placeholder="0.00"
            />
          </NumberInput>
          <FormErrorMessage>{errors.goal}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.deadline}>
          <FormLabel>Campaign Deadline</FormLabel>
          <Input
            name="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
          />
          <FormErrorMessage>{errors.deadline}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.beneficiary}>
          <FormLabel>Beneficiary Address</FormLabel>
          <Input
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleChange}
            placeholder="Enter the beneficiary's Polkadot address"
          />
          <FormErrorMessage>{errors.beneficiary}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Category</FormLabel>
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Technology, Healthcare, Education"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Campaign Image URL</FormLabel>
          <Input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter URL for campaign image"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Website</FormLabel>
          <Input
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Campaign or organization website"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Social Links</FormLabel>
          <Input
            name="socialLinks"
            value={formData.socialLinks}
            onChange={handleChange}
            placeholder="Comma-separated social media links"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          mt={4}
          isLoading={isSubmitting}
          loadingText="Creating..."
          disabled={!selectedAccount}
        >
          Create Campaign
        </Button>
      </VStack>
    </form>
  );
};

CreateCampaignForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};