import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  FormErrorMessage,
  Text,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext.jsx';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { parseDOT, isValidAddress, isValidPositiveNumber } from '../utils/formatters';
import { asyncHandler } from '../utils/errorHandler';

const CreateCampaignPage = () => {
  const { selectedAccount } = useWallet();
  const { createCampaign } = useCampaign();
  const navigate = useNavigate();
  const toast = useToast();

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
    // Clear error when user starts typing
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
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a campaign',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

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

      toast({
        title: 'Campaign Created!',
        description: 'Your campaign has been created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to campaigns list
      navigate('/dashboard');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create campaign',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="xl" mb={2}>Create New Campaign</Heading>
              <Text color="gray.600">
                Launch your crowdfunding campaign on the blockchain
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={!!errors.title} isRequired>
                  <FormLabel>Campaign Title</FormLabel>
                  <Input
                    placeholder="Enter a compelling campaign title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    size="lg"
                  />
                  <FormErrorMessage>{errors.title}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description} isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Describe your campaign and what you plan to achieve"
                    value={formData.description}
                    onChange={handleChange('description')}
                    rows={6}
                    resize="vertical"
                  />
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.goal} isRequired>
                  <FormLabel>Funding Goal (DOT)</FormLabel>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.goal}
                    onChange={handleChange('goal')}
                    step="0.01"
                    min="1"
                  />
                  <FormErrorMessage>{errors.goal}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.deadline} isRequired>
                  <FormLabel>Campaign Deadline</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={handleChange('deadline')}
                  />
                  <FormErrorMessage>{errors.deadline}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.beneficiary} isRequired>
                  <FormLabel>Beneficiary Address</FormLabel>
                  <Input
                    placeholder="5GrwvaEF5zXb26Fz9rc..."
                    value={formData.beneficiary}
                    onChange={handleChange('beneficiary')}
                    fontFamily="monospace"
                  />
                  <FormErrorMessage>{errors.beneficiary}</FormErrorMessage>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Enter the Polkadot address that will receive the funds
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isSubmitting}
                  loadingText="Creating Campaign..."
                  mt={4}
                >
                  Create Campaign
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CreateCampaignPage;
