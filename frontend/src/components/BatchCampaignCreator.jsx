import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  IconButton,
  Text,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { useWallet } from '../contexts/WalletContext';

const BatchCampaignCreator = () => {
  const { createCampaignsBatch, batchLoading, batchProgress, getMaxBatchSize } = useBatchOperations();
  const { selectedAccount } = useWallet();
  const toast = useToast();

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: '',
      description: '',
      goal: '',
      deadline: '',
      beneficiary: selectedAccount?.address || '',
      errors: {},
    },
  ]);

  const [maxBatchSize, setMaxBatchSize] = useState(50);

  // Load max batch size on mount
  React.useEffect(() => {
    getMaxBatchSize().then(setMaxBatchSize).catch(() => setMaxBatchSize(50));
  }, [getMaxBatchSize]);

  const addCampaign = () => {
    if (campaigns.length >= maxBatchSize) {
      toast({
        title: 'Maximum Batch Size Reached',
        description: `You can only create ${maxBatchSize} campaigns at once`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setCampaigns([
      ...campaigns,
      {
        id: Date.now(),
        title: '',
        description: '',
        goal: '',
        deadline: '',
        beneficiary: selectedAccount?.address || '',
        errors: {},
      },
    ]);
  };

  const removeCampaign = (id) => {
    if (campaigns.length === 1) {
      toast({
        title: 'Cannot Remove',
        description: 'You must have at least one campaign',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const updateCampaign = (id, field, value) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, [field]: value, errors: { ...c.errors, [field]: null } } : c
    ));
  };

  const validateCampaign = (campaign) => {
    const errors = {};

    if (!campaign.title || campaign.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (campaign.title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (campaign.description.length > 1000) {
      errors.description = 'Description must be 1000 characters or less';
    }

    const goalNum = parseFloat(campaign.goal);
    if (!campaign.goal || isNaN(goalNum) || goalNum <= 0) {
      errors.goal = 'Goal must be a positive number';
    }

    if (!campaign.deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(campaign.deadline);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      if (deadlineDate <= oneHourFromNow) {
        errors.deadline = 'Deadline must be at least 1 hour from now';
      } else if (deadlineDate > oneYearFromNow) {
        errors.deadline = 'Deadline cannot be more than 1 year from now';
      }
    }

    if (!campaign.beneficiary || campaign.beneficiary.length === 0) {
      errors.beneficiary = 'Beneficiary address is required';
    }

    return errors;
  };

  const validateAllCampaigns = () => {
    let hasErrors = false;
    const updatedCampaigns = campaigns.map(campaign => {
      const errors = validateCampaign(campaign);
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      }
      return { ...campaign, errors };
    });

    setCampaigns(updatedCampaigns);
    return !hasErrors;
  };

  const handleBatchCreate = async () => {
    if (!selectedAccount) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!validateAllCampaigns()) {
      toast({
        title: 'Validation Failed',
        description: 'Please fix the errors in your campaigns',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Format campaigns for the contract
      const formattedCampaigns = campaigns.map(campaign => ({
        title: campaign.title.trim(),
        description: campaign.description.trim(),
        goal: BigInt(parseFloat(campaign.goal) * 1_000_000_000_000), // Convert DOT to plancks
        deadline: new Date(campaign.deadline).getTime(),
        beneficiary: campaign.beneficiary,
      }));

      const result = await createCampaignsBatch(formattedCampaigns);

      if (result.failed === 0) {
        // Reset form on complete success
        setCampaigns([
          {
            id: Date.now(),
            title: '',
            description: '',
            goal: '',
            deadline: '',
            beneficiary: selectedAccount?.address || '',
            errors: {},
          },
        ]);
      }
    } catch (error) {
      console.error('Batch creation error:', error);
    }
  };

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              Batch Campaign Creator
            </Text>
            <Text color="gray.600">
              Create multiple campaigns in a single transaction (up to {maxBatchSize})
            </Text>
          </Box>
          <Badge colorScheme="blue" fontSize="md" p={2}>
            {campaigns.length} / {maxBatchSize} Campaigns
          </Badge>
        </HStack>

        {batchLoading && (
          <Alert status="info">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Creating Campaigns...</AlertTitle>
              <AlertDescription>
                Processing {batchProgress.current} of {batchProgress.total} campaigns
              </AlertDescription>
              <Progress
                value={(batchProgress.current / batchProgress.total) * 100}
                size="sm"
                mt={2}
                colorScheme="blue"
              />
            </Box>
          </Alert>
        )}

        {campaigns.map((campaign, index) => (
          <Box key={campaign.id} p={6} borderWidth="1px" borderRadius="lg" position="relative">
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="bold" fontSize="lg">
                Campaign #{index + 1}
              </Text>
              {campaigns.length > 1 && (
                <IconButton
                  aria-label="Remove campaign"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCampaign(campaign.id)}
                />
              )}
            </HStack>

            <VStack spacing={4}>
              <FormControl isInvalid={campaign.errors.title}>
                <FormLabel>Campaign Title</FormLabel>
                <Input
                  placeholder="Enter campaign title (max 100 characters)"
                  value={campaign.title}
                  onChange={(e) => updateCampaign(campaign.id, 'title', e.target.value)}
                  maxLength={100}
                />
                <FormErrorMessage>{campaign.errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={campaign.errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter campaign description (max 1000 characters)"
                  value={campaign.description}
                  onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
                <FormErrorMessage>{campaign.errors.description}</FormErrorMessage>
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl isInvalid={campaign.errors.goal}>
                  <FormLabel>Funding Goal (DOT)</FormLabel>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={campaign.goal}
                    onChange={(e) => updateCampaign(campaign.id, 'goal', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <FormErrorMessage>{campaign.errors.goal}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={campaign.errors.deadline}>
                  <FormLabel>Deadline</FormLabel>
                  <Input
                    type="datetime-local"
                    value={campaign.deadline}
                    onChange={(e) => updateCampaign(campaign.id, 'deadline', e.target.value)}
                  />
                  <FormErrorMessage>{campaign.errors.deadline}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isInvalid={campaign.errors.beneficiary}>
                <FormLabel>Beneficiary Address</FormLabel>
                <Input
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  value={campaign.beneficiary}
                  onChange={(e) => updateCampaign(campaign.id, 'beneficiary', e.target.value)}
                  fontFamily="monospace"
                  fontSize="sm"
                />
                <FormErrorMessage>{campaign.errors.beneficiary}</FormErrorMessage>
              </FormControl>
            </VStack>
          </Box>
        ))}

        <Divider />

        <HStack justify="space-between">
          <Button
            leftIcon={<AddIcon />}
            onClick={addCampaign}
            isDisabled={campaigns.length >= maxBatchSize || batchLoading}
            variant="outline"
            colorScheme="blue"
          >
            Add Another Campaign
          </Button>

          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleBatchCreate}
            isLoading={batchLoading}
            loadingText="Creating Campaigns..."
            isDisabled={!selectedAccount || campaigns.length === 0}
          >
            Create {campaigns.length} Campaign{campaigns.length > 1 ? 's' : ''}
          </Button>
        </HStack>

        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>Gas Savings!</AlertTitle>
            <AlertDescription>
              Creating {campaigns.length} campaigns in batch saves approximately{' '}
              <strong>{Math.round((campaigns.length - 1) * 20)}%</strong> on gas fees
              compared to individual transactions.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

export default BatchCampaignCreator;
