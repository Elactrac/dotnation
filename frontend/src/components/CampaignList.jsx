import { useEffect } from 'react';
import { Box, SimpleGrid, Heading, Text, Spinner, Alert, AlertIcon, Button } from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext';
import { CampaignCard } from './CampaignCard';
import { Link } from 'react-router-dom';

export const CampaignList = () => {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaign();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading campaigns...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Error loading campaigns: {error}</Text>
      </Alert>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md">No active campaigns found</Heading>
        <Text mt={4}>Be the first to create a campaign!</Text>
        <Button
          as={Link}
          to="/create-campaign"
          colorScheme="blue"
          mt={4}
        >
          Create Campaign
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Active Campaigns</Heading>
        <Button
          as={Link}
          to="/create-campaign"
          colorScheme="blue"
          size="sm"
        >
          Create Campaign
        </Button>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CampaignList;