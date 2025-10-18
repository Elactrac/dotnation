import React, { useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  Avatar,
  Divider,
  Button,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { CampaignCard } from './CampaignCard';

export const UserProfile = ({ address }) => {
  const { campaigns } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(address);

  // Get user's created campaigns
  const createdCampaigns = useMemo(() => 
    campaigns.filter(campaign => campaign.creator === address),
    [campaigns, address]
  );

  // Get user's donations
  const donations = useMemo(() => {
    const userDonations = [];
    campaigns.forEach(campaign => {
      campaign.donations
        .filter(donation => donation.donor === address)
        .forEach(donation => {
          userDonations.push({
            ...donation,
            campaignTitle: campaign.title,
            campaignId: campaign.id,
          });
        });
    });
    return userDonations.sort((a, b) => b.timestamp - a.timestamp);
  }, [campaigns, address]);

  // Calculate total contribution
  const totalContribution = useMemo(() => 
    donations.reduce((sum, donation) => sum + donation.amount, 0),
    [donations]
  );

  const handleCopyAddress = () => {
    onCopy();
    toast({
      title: 'Address copied!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={8} width="full" align="stretch">
      <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
        <HStack spacing={4} align="center">
          <Avatar size="xl" name={address} />
          <VStack align="start" flex={1}>
            <HStack>
              <Text fontSize="sm" color="gray.500">Address:</Text>
              <Text fontFamily="mono">{address.slice(0, 8)}...{address.slice(-6)}</Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyAddress}
                leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
              >
                {hasCopied ? 'Copied!' : 'Copy'}
              </Button>
            </HStack>
            <Badge colorScheme="blue">
              {createdCampaigns.length} Campaigns Created
            </Badge>
            <Badge colorScheme="green">
              {donations.length} Donations Made
            </Badge>
            <Text fontSize="lg" fontWeight="bold">
              Total Contributed: {(totalContribution / 1_000_000_000_000).toFixed(2)} DOT
            </Text>
          </VStack>
        </HStack>
      </Box>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Created Campaigns</Tab>
          <Tab>Donations</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {createdCampaigns.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {createdCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </SimpleGrid>
            ) : (
              <Text color="gray.500">No campaigns created yet</Text>
            )}
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              {donations.map((donation, index) => (
                <Box key={index} p={4} borderWidth={1} borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{donation.campaignTitle}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(donation.timestamp).toLocaleString()}
                      </Text>
                    </VStack>
                    <Text fontWeight="bold">
                      {(donation.amount / 1_000_000_000_000).toFixed(2)} DOT
                    </Text>
                  </HStack>
                </Box>
              ))}
              {donations.length === 0 && (
                <Text color="gray.500">No donations made yet</Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};