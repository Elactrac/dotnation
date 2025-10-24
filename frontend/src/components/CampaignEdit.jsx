import { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export const CampaignEdit = ({ campaignId, onSuccess, onCancel }) => {
  const { campaigns, updateCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiary: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        goal: (campaign.goal / 1_000_000_000_000).toString(), // Convert from femto DOT
        deadline: new Date(campaign.deadline).toISOString().slice(0, 16),
        beneficiary: campaign.beneficiary,
      });
    }
  }, [campaignId, campaigns]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const deadlineTimestamp = new Date(formData.deadline).getTime();
      const goalAmount = Math.floor(parseFloat(formData.goal) * 1_000_000_000_000); // Convert to femto DOT

      await updateCampaign(campaignId, {
        ...formData,
        goal: goalAmount,
        deadline: deadlineTimestamp,
      });

      toast({
        title: 'Success',
        description: 'Your campaign has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
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

  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return (
      <Alert status="error">
        <AlertIcon />
        Campaign not found
      </Alert>
    );
  }

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
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your campaign"
            rows={4}
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

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          mt={4}
          isLoading={isSubmitting}
          loadingText="Updating..."
          disabled={!selectedAccount}
        >
          Update Campaign
        </Button>
        
        <Button
          onClick={onCancel}
          width="full"
          variant="outline"
        >
          Cancel
        </Button>
      </VStack>
    </form>
  );
};

CampaignEdit.propTypes = {
  campaignId: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};