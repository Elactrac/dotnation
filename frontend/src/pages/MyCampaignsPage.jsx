import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Flex,
  Grid
} from '@chakra-ui/react';
import {
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiEdit,
  FiEye
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import {
  formatDOT,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  formatDate
} from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const MyCampaignsPage = () => {
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaign();
  const { selectedAccount } = useWallet();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);



  // Filter campaigns created by the current user
  const myCampaigns = useMemo(() => {
    if (!selectedAccount || !campaigns) return [];
    return campaigns.filter(campaign => campaign.owner === selectedAccount.address);
  }, [campaigns, selectedAccount]);

  // Calculate stats for user's campaigns
  const campaignStats = useMemo(() => {
    const totalRaised = myCampaigns.reduce((sum, campaign) => sum + campaign.raised, 0n);
    const totalGoal = myCampaigns.reduce((sum, campaign) => sum + campaign.goal, 0n);
    const activeCampaigns = myCampaigns.filter(c => c.state === 'Active').length;
    const successfulCampaigns = myCampaigns.filter(c => c.state === 'Successful').length;

    return {
      totalCampaigns: myCampaigns.length,
      totalRaised,
      totalGoal,
      activeCampaigns,
      successfulCampaigns,
      successRate: myCampaigns.length > 0 ? (successfulCampaigns / myCampaigns.length) * 100 : 0
    };
  }, [myCampaigns]);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await refreshCampaigns();
    } finally {
      setLocalLoading(false);
    }
  };

  if (!selectedAccount) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Wallet Not Connected</Text>
            <Text>Please connect your wallet to view your campaigns.</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading your campaigns...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Error loading campaigns: {error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="xl">My Campaigns</Heading>
            <Text color="gray.600">
              Manage and track your crowdfunding campaigns
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={FiTrendingUp} />}
              onClick={handleRefresh}
              isLoading={localLoading}
              variant="outline"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              onClick={() => navigate('/dashboard/create-campaign')}
            >
              Create Campaign
            </Button>
          </HStack>
        </Flex>

        {/* Stats Overview */}
        {myCampaigns.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Campaigns</StatLabel>
                  <StatNumber>{campaignStats.totalCampaigns}</StatNumber>
                  <StatHelpText>
                    {campaignStats.activeCampaigns} active
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Raised</StatLabel>
                  <StatNumber color="green.500">
                    {formatDOT(campaignStats.totalRaised)} DOT
                  </StatNumber>
                  <StatHelpText>
                    of {formatDOT(campaignStats.totalGoal)} DOT goal
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Success Rate</StatLabel>
                  <StatNumber color="blue.500">
                    {campaignStats.successRate.toFixed(1)}%
                  </StatNumber>
                  <StatHelpText>
                    {campaignStats.successfulCampaigns} successful
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Average Progress</StatLabel>
                  <StatNumber>
                    {myCampaigns.length > 0
                      ? (myCampaigns.reduce((sum, c) => sum + calculateProgress(c.raised, c.goal), 0) / myCampaigns.length).toFixed(1)
                      : 0}%
                  </StatNumber>
                  <StatHelpText>
                    across all campaigns
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Campaigns Grid */}
        {myCampaigns.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Icon as={FiPlus} boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.600">
                  No Campaigns Yet
                </Heading>
                <Text color="gray.500" maxW="md">
                  You haven't created any campaigns yet. Start your first crowdfunding campaign to make a difference!
                </Text>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => navigate('/dashboard/create-campaign')}
                >
                  Create Your First Campaign
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {myCampaigns.map((campaign) => {
              const progress = calculateProgress(campaign.raised, campaign.goal);
              const deadlineStatus = getDeadlineStatus(campaign.deadline);
              const stateColor = getCampaignStateColor(campaign.state);

              return (
                <Card key={campaign.id} _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
                  <CardHeader pb={2}>
                    <VStack align="start" spacing={2} w="100%">
                      <Flex justify="space-between" align="center" w="100%">
                        <Badge colorScheme={stateColor} fontSize="xs">
                          {campaign.state}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          ID: {campaign.id}
                        </Text>
                      </Flex>
                      <Heading size="md" noOfLines={2}>
                        {campaign.title}
                      </Heading>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {/* Progress */}
                      <Box>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDOT(campaign.raised)} DOT raised
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {progress.toFixed(1)}%
                          </Text>
                        </Flex>
                        <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Goal: {formatDOT(campaign.goal)} DOT
                        </Text>
                      </Box>

                      {/* Stats */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Icon as={FiUsers} boxSize={3} color="gray.500" />
                            <Text fontSize="xs" color="gray.600">Donors</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium">0</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Icon as={FiClock} boxSize={3} color="gray.500" />
                            <Text fontSize="xs" color="gray.600">Time Left</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium" color={deadlineStatus.color}>
                            {deadlineStatus.message}
                          </Text>
                        </VStack>
                      </SimpleGrid>

                      {/* Deadline */}
                      <Text fontSize="xs" color="gray.500">
                        Deadline: {formatDate(campaign.deadline)}
                      </Text>
                    </VStack>
                  </CardBody>

                  <CardFooter pt={0}>
                    <HStack spacing={2} w="100%">
                      <Button
                        as={Link}
                        to={`/dashboard/campaign/${campaign.id}`}
                        leftIcon={<Icon as={FiEye} />}
                        size="sm"
                        variant="outline"
                        flex={1}
                      >
                        View
                      </Button>
                      {campaign.state === 'Active' && (
                        <Button
                          leftIcon={<Icon as={FiEdit} />}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          flex={1}
                          onClick={() => navigate(`/dashboard/campaign/${campaign.id}/edit`)}
                        >
                          Edit
                        </Button>
                      )}
                    </HStack>
                  </CardFooter>
                </Card>
              );
            })}
          </Grid>
        )}
      </VStack>
    </Container>
  );
};

export default () => (
  <PageErrorBoundary pageName="My Campaigns">
    <MyCampaignsPage />
  </PageErrorBoundary>
);