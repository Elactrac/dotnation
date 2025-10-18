
import { Link } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Button, 
  Grid, 
  Spinner, 
  Text, 
  VStack,
  HStack,
  Icon,
  Container
} from '@chakra-ui/react';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import CampaignCard from '../components/CampaignCard';

const CampaignsListPage = () => {
  const { campaigns, isLoading, error } = useCampaign();

  if (isLoading) {
    return (
      <VStack spacing={8} py={20}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Loading campaigns...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} py={20}>
        <Icon as={FiAlertCircle} boxSize={16} color="red.500" />
        <Heading size="md" color="red.600">Error Loading Campaigns</Heading>
        <Text color="gray.600">{error}</Text>
        <Button 
          colorScheme="blue" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </VStack>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <HStack justify="space-between" align="center" flexWrap="wrap">
          <Box>
            <Heading size="xl" mb={2}>All Campaigns</Heading>
            <Text color="gray.600">
              {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} active
            </Text>
          </Box>
          <Button
            as={Link}
            to="/dashboard/create-campaign"
            colorScheme="blue"
            size="lg"
            leftIcon={<Icon as={FiPlus} />}
          >
            Create Campaign
          </Button>
        </HStack>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <VStack spacing={6} py={20}>
            <Icon as={FiAlertCircle} boxSize={16} color="gray.400" />
            <Heading size="md" color="gray.600">No Campaigns Yet</Heading>
            <Text color="gray.500" textAlign="center">
              Be the first to create a campaign and start raising funds!
            </Text>
            <Button
              as={Link}
              to="/dashboard/create-campaign"
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FiPlus} />}
            >
              Create Your First Campaign
            </Button>
          </VStack>
        ) : (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </Grid>
        )}
      </VStack>
    </Container>
  );
};

export default CampaignsListPage;