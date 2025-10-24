import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Icon,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import { parseDOT, formatDOT, isValidPositiveNumber } from '../utils/formatters';
import { asyncHandler } from '../utils/errorHandler';

export const DonationInterface = memo(({ campaignId, campaign }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { donateToCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();

  // Suggested donation amounts
  const suggestedAmounts = [10, 25, 50, 100];

  const validateAmount = (value) => {
    if (!value || value === '') {
      return 'Amount is required';
    }
    if (!isValidPositiveNumber(value)) {
      return 'Please enter a valid positive number';
    }
    const numValue = parseFloat(value);
    if (numValue < 0.1) {
      return 'Minimum donation is 0.1 DOT';
    }
    if (numValue > 100000) {
      return 'Maximum donation is 100,000 DOT';
    }
    return '';
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    const validationError = value ? validateAmount(value) : '';
    setError(validationError);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setError('');
  };

  const handleDonate = asyncHandler(async () => {
    if (!selectedAccount) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make a donation',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      toast({
        title: 'Invalid Amount',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const amountInPlancks = parseDOT(amount);
      await donateToCampaign(campaignId, amountInPlancks);
      
      toast({
        title: 'Donation Successful! 🎉',
        description: `You donated ${amount} DOT to this campaign. Thank you for your support!`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
      
      setAmount(''); // Reset amount after successful donation
      setError('');
    } catch (err) {
      toast({
        title: 'Donation Failed',
        description: err.message || 'Failed to process donation. Please try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  // Calculate if campaign is active
  const isActive = campaign?.state === 'Active';
  const hasEnded = campaign?.deadline ? new Date(campaign.deadline) < new Date() : false;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      boxShadow="lg"
      bg="white"
    >
      <VStack spacing={5} align="stretch">
        {/* Header */}
        <HStack spacing={3}>
          <Icon as={FiHeart} boxSize={6} color="red.500" />
          <Text fontSize="2xl" fontWeight="bold">
            Support This Campaign
          </Text>
        </HStack>

        {/* Campaign Stats */}
        {campaign && (
          <Box bg="gray.50" p={4} borderRadius="md">
            <VStack spacing={3} align="stretch">
              <Stat>
                <StatLabel>Current Progress</StatLabel>
                <StatNumber>{formatDOT(campaign.raised)} DOT</StatNumber>
                <StatHelpText>of {formatDOT(campaign.goal)} DOT goal</StatHelpText>
              </Stat>
            </VStack>
          </Box>
        )}

        <Divider />

        {/* Wallet Warning */}
        {!selectedAccount && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Wallet Not Connected</Text>
              <Text fontSize="sm">Connect your wallet to make a donation</Text>
            </VStack>
          </Alert>
        )}

        {/* Campaign Ended Warning */}
        {!isActive && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Campaign Ended</Text>
              <Text fontSize="sm">
                {hasEnded ? 'This campaign has reached its deadline' : 'This campaign is no longer accepting donations'}
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Quick Amount Buttons */}
        <Box>
          <FormLabel mb={2}>Quick Select</FormLabel>
          <HStack spacing={2} flexWrap="wrap">
            {suggestedAmounts.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={amount === value.toString() ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => handleQuickAmount(value)}
                isDisabled={!selectedAccount || !isActive}
              >
                {value} DOT
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Amount Input */}
        <FormControl isInvalid={!!error}>
          <FormLabel>Custom Amount (DOT)</FormLabel>
          <NumberInput
            min={0.1}
            step={0.1}
            value={amount}
            onChange={handleAmountChange}
            precision={4}
            isDisabled={!selectedAccount || !isActive}
          >
            <NumberInputField placeholder="Enter donation amount" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        {/* Donate Button */}
        <Button
          colorScheme="blue"
          size="lg"
          width="100%"
          onClick={handleDonate}
          isLoading={isSubmitting}
          loadingText="Processing Donation..."
          isDisabled={!selectedAccount || !isActive || !!error || !amount}
          leftIcon={<Icon as={FiHeart} />}
        >
          {!selectedAccount 
            ? 'Connect Wallet to Donate' 
            : !isActive 
            ? 'Campaign Ended' 
            : amount 
            ? `Donate ${amount} DOT` 
            : 'Enter Amount'}
        </Button>

        {/* Helper Text */}
        <Text fontSize="xs" color="gray.600" textAlign="center">
          Your donation will be sent directly to the campaign beneficiary on the blockchain
        </Text>
      </VStack>
    </Box>
  );
});

DonationInterface.displayName = 'DonationInterface';

DonationInterface.propTypes = {
  campaignId: PropTypes.string.isRequired,
  campaign: PropTypes.shape({
    state: PropTypes.string,
    deadline: PropTypes.number,
    raised: PropTypes.number,
    goal: PropTypes.number,
  }),
};

export default DonationInterface;