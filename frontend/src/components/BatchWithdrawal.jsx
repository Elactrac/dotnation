import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Checkbox,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

const BatchWithdrawal = () => {
  const { withdrawFundsBatch, batchLoading, batchProgress } = useBatchOperations();
  const { campaigns, loading: campaignsLoading } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();

  const [selectedCampaigns, setSelectedCampaigns] = useState(new Set());
  const [eligibleCampaigns, setEligibleCampaigns] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!campaigns || !selectedAccount) return;

    // Filter campaigns that are eligible for withdrawal
    const eligible = campaigns.filter(campaign => {
      const isOwner = campaign.owner === selectedAccount.address;
      const isSuccessful = campaign.state === 'Successful';
      const notWithdrawn = campaign.state !== 'Withdrawn';
      const hasBalance = campaign.raised > 0;

      return isOwner && isSuccessful && notWithdrawn && hasBalance;
    });

    setEligibleCampaigns(eligible);
  }, [campaigns, selectedAccount]);

  useEffect(() => {
    // Calculate total amount from selected campaigns
    const total = eligibleCampaigns
      .filter(c => selectedCampaigns.has(c.id))
      .reduce((sum, c) => sum + BigInt(c.raised), BigInt(0));

    setTotalAmount(total);
  }, [selectedCampaigns, eligibleCampaigns]);

  const toggleCampaign = (campaignId) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const selectAll = () => {
    if (selectedCampaigns.size === eligibleCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(eligibleCampaigns.map(c => c.id)));
    }
  };

  const handleBatchWithdraw = async () => {
    if (selectedCampaigns.size === 0) {
      toast({
        title: 'No Campaigns Selected',
        description: 'Please select at least one campaign to withdraw from',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const campaignIds = Array.from(selectedCampaigns);
      const result = await withdrawFundsBatch(campaignIds);

      if (result.failed === 0) {
        // Clear selection on success
        setSelectedCampaigns(new Set());
      }
    } catch (error) {
      console.error('Batch withdrawal error:', error);
    }
  };

  const formatBalance = (balance) => {
    return (Number(balance) / 1_000_000_000_000).toFixed(4);
  };

  if (!selectedAccount) {
    return (
      <Box maxW="1200px" mx="auto" p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view and withdraw from your campaigns.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (campaignsLoading) {
    return (
      <Box maxW="1200px" mx="auto" p={6} textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading your campaigns...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Batch Withdrawal
          </Text>
          <Text color="gray.600">
            Withdraw funds from multiple successful campaigns in a single transaction
          </Text>
        </Box>

        {eligibleCampaigns.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No Eligible Campaigns</AlertTitle>
              <AlertDescription>
                You don't have any successful campaigns ready for withdrawal.
                Campaigns must reach their funding goal before funds can be withdrawn.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Eligible Campaigns</StatLabel>
                <StatNumber>{eligibleCampaigns.length}</StatNumber>
                <StatHelpText>Ready to withdraw</StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Selected</StatLabel>
                <StatNumber>{selectedCampaigns.size}</StatNumber>
                <StatHelpText>
                  {selectedCampaigns.size === 0
                    ? 'None selected'
                    : `${Math.round((selectedCampaigns.size / eligibleCampaigns.length) * 100)}% selected`}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Total Amount</StatLabel>
                <StatNumber>{formatBalance(totalAmount)} DOT</StatNumber>
                <StatHelpText>To be withdrawn</StatHelpText>
              </Stat>
            </SimpleGrid>

            <Divider />

            {batchLoading && (
              <Alert status="info">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Processing Withdrawals...</AlertTitle>
                  <AlertDescription>
                    Please wait while we process {selectedCampaigns.size} withdrawal{selectedCampaigns.size > 1 ? 's' : ''}
                  </AlertDescription>
                  <Progress
                    value={batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}
                    size="sm"
                    mt={2}
                    colorScheme="blue"
                  />
                </Box>
              </Alert>
            )}

            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Box p={4} bg="gray.50" borderBottomWidth="1px">
                <HStack justify="space-between">
                  <Checkbox
                    isChecked={selectedCampaigns.size === eligibleCampaigns.length && eligibleCampaigns.length > 0}
                    isIndeterminate={selectedCampaigns.size > 0 && selectedCampaigns.size < eligibleCampaigns.length}
                    onChange={selectAll}
                  >
                    Select All ({eligibleCampaigns.length})
                  </Checkbox>

                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={handleBatchWithdraw}
                    isLoading={batchLoading}
                    loadingText="Withdrawing..."
                    isDisabled={selectedCampaigns.size === 0}
                  >
                    Withdraw Selected ({selectedCampaigns.size})
                  </Button>
                </HStack>
              </Box>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th width="40px"></Th>
                    <Th>Campaign</Th>
                    <Th isNumeric>Raised</Th>
                    <Th isNumeric>Goal</Th>
                    <Th>Status</Th>
                    <Th>Beneficiary</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {eligibleCampaigns.map((campaign) => (
                    <Tr
                      key={campaign.id}
                      _hover={{ bg: 'gray.50' }}
                      cursor="pointer"
                      onClick={() => toggleCampaign(campaign.id)}
                    >
                      <Td>
                        <Checkbox
                          isChecked={selectedCampaigns.has(campaign.id)}
                          onChange={() => toggleCampaign(campaign.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{campaign.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          ID: {campaign.id}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="bold" color="green.600">
                          {formatBalance(campaign.raised)} DOT
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text>{formatBalance(campaign.goal)} DOT</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">Successful</Badge>
                      </Td>
                      <Td>
                        <Text fontSize="xs" fontFamily="monospace">
                          {campaign.beneficiary.slice(0, 8)}...{campaign.beneficiary.slice(-6)}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {selectedCampaigns.size > 0 && (
              <Alert status="success" variant="left-accent">
                <AlertIcon />
                <Box>
                  <AlertTitle>Gas Savings!</AlertTitle>
                  <AlertDescription>
                    Withdrawing from {selectedCampaigns.size} campaigns in batch saves approximately{' '}
                    <strong>{Math.round((selectedCampaigns.size - 1) * 15)}%</strong> on gas fees
                    compared to individual transactions.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default BatchWithdrawal;
