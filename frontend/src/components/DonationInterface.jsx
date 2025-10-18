import React, { useState } from 'react';
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
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';

export const DonationInterface = ({ campaignId }) => {
  const [amount, setAmount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { donateToCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();

  const handleDonate = async () => {
    if (!selectedAccount) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to make a donation',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a positive donation amount',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await donateToCampaign(campaignId, amount);
      toast({
        title: 'Donation successful!',
        description: `You have successfully donated ${amount} DOT to this campaign.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setAmount(1); // Reset amount after successful donation
    } catch (error) {
      toast({
        title: 'Donation failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      boxShadow="md"
      bg="white"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Support this campaign
      </Text>

      {!selectedAccount && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          Please connect your wallet to make a donation
        </Alert>
      )}

      <FormControl mb={4}>
        <FormLabel>Donation Amount (DOT)</FormLabel>
        <NumberInput
          min={0.1}
          step={0.1}
          value={amount}
          onChange={(valueString) => setAmount(parseFloat(valueString))}
          precision={2}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        onClick={handleDonate}
        isLoading={isSubmitting}
        loadingText="Processing..."
        isDisabled={!selectedAccount || amount <= 0}
      >
        Donate Now
      </Button>
    </Box>
  );
};

export default DonationInterface;