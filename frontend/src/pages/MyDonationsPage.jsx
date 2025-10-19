import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiHeart,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiExternalLink
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { formatDOT, formatDateTime, shortenAddress } from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const MyDonationsPage = () => {
  const { campaigns, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Fetch donations from all campaigns
  useEffect(() => {
    const fetchAllDonations = async () => {
      if (!selectedAccount || !campaigns.length) return;

      setLoadingDonations(true);
      try {
        const allDonations = [];

        // Get detailed campaign data to access donations
        for (const campaign of campaigns) {
          try {
            // This would need to be implemented in the context to get donation history
            // For now, we'll simulate with mock data
            const mockDonations = [
              {
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                amount: 1000000000000n, // 1 DOT in plancks
                timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random time in last 30 days
                txHash: '0x' + Math.random().toString(16).substr(2, 64)
              }
            ].filter(() => Math.random() > 0.7); // 30% chance of having donated

            allDonations.push(...mockDonations);
          } catch (err) {
            console.warn(`Failed to get donations for campaign ${campaign.id}:`, err);
          }
        }

        // Sort by timestamp (newest first)
        allDonations.sort((a, b) => b.timestamp - a.timestamp);
        setDonations(allDonations);
      } catch (err) {
        console.error('Failed to fetch donations:', err);
      } finally {
        setLoadingDonations(false);
      }
    };

    fetchAllDonations();
  }, [selectedAccount, campaigns]);

  // Calculate donation statistics
  const donationStats = useMemo(() => {
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0n);
    const totalDonations = donations.length;
    const uniqueCampaigns = new Set(donations.map(d => d.campaignId)).size;
    const avgDonation = totalDonations > 0 ? totalAmount / BigInt(totalDonations) : 0n;

    return {
      totalAmount,
      totalDonations,
      uniqueCampaigns,
      avgDonation
    };
  }, [donations]);

  if (!selectedAccount) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Wallet Not Connected</Text>
            <Text>Please connect your wallet to view your donation history.</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  if (isLoading || loadingDonations) {
    return (
      <Container maxW="container.lg" py={10}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading your donation history...</Text>
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
        <VStack align="start" spacing={1}>
          <Heading size="xl">My Donations</Heading>
          <Text color="white">
            Track your impact and donation history across all campaigns
          </Text>
        </VStack>

        {/* Stats Overview */}
        {donations.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Donated</StatLabel>
                  <StatNumber color="green.500">
                    {formatDOT(donationStats.totalAmount)} DOT
                  </StatNumber>
                  <StatHelpText>
                    across {donationStats.totalDonations} donations
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Campaigns Supported</StatLabel>
                  <StatNumber color="blue.500">
                    {donationStats.uniqueCampaigns}
                  </StatNumber>
                  <StatHelpText>
                    unique campaigns
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Average Donation</StatLabel>
                  <StatNumber color="purple.500">
                    {formatDOT(donationStats.avgDonation)} DOT
                  </StatNumber>
                  <StatHelpText>
                    per campaign
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Impact Score</StatLabel>
                  <StatNumber color="orange.500">
                    {Math.floor(donationStats.totalAmount / 1000000000000n)} ⭐
                  </StatNumber>
                  <StatHelpText>
                    based on total donated
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Donations List */}
        {donations.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Icon as={FiHeart} boxSize={12} color="gray.400" />
                <Heading size="md" color="white">
                  No Donations Yet
                </Heading>
                <Text color="white" maxW="md">
                  You haven't made any donations yet. Browse campaigns and start supporting causes you care about!
                </Text>
                <Button
                  as={Link}
                  to="/dashboard"
                  leftIcon={<Icon as={FiTrendingUp} />}
                  colorScheme="blue"
                  size="lg"
                >
                  Browse Campaigns
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {donations.map((donation, index) => (
              <Card key={`${donation.campaignId}-${index}`} _hover={{ shadow: 'md' }} transition="all 0.2s">
                <CardBody>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <VStack align="start" spacing={2} flex={1} minW="200px">
                      <HStack>
                        <Icon as={FiHeart} color="red.500" />
                        <Text fontWeight="medium" noOfLines={1}>
                          {donation.campaignTitle}
                        </Text>
                      </HStack>

                      <HStack spacing={4} wrap="wrap">
                        <HStack>
                          <Icon as={FiDollarSign} boxSize={4} color="green.500" />
                          <Text fontSize="sm" color="white">
                            {formatDOT(donation.amount)} DOT
                          </Text>
                        </HStack>

                        <HStack>
                          <Icon as={FiCalendar} boxSize={4} color="blue.500" />
                          <Text fontSize="sm" color="white">
                            {formatDateTime(donation.timestamp)}
                          </Text>
                        </HStack>
                      </HStack>

                      <Text fontSize="xs" color="white" fontFamily="mono">
                        TX: {shortenAddress(donation.txHash)}
                      </Text>
                    </VStack>

                    <VStack align="end" spacing={2}>
                      <Badge colorScheme="green" variant="subtle">
                        Completed
                      </Badge>
                      <Button
                        as={Link}
                        to={`/dashboard/campaign/${donation.campaignId}`}
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={FiExternalLink} />}
                      >
                        View Campaign
                      </Button>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Call to Action */}
        {donations.length > 0 && (
          <Card bg={bgColor}>
            <CardBody textAlign="center">
              <VStack spacing={4}>
                <Icon as={FiTrendingUp} boxSize={8} color="blue.500" />
                <Heading size="md">Keep Making a Difference</Heading>
                <Text color="white">
                  Your donations have helped {donationStats.uniqueCampaigns} campaigns.
                  Discover more causes to support!
                </Text>
                <Button
                  as={Link}
                  to="/dashboard"
                  colorScheme="blue"
                  size="lg"
                >
                  Browse More Campaigns
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default () => (
  <PageErrorBoundary pageName="My Donations">
    <MyDonationsPage />
  </PageErrorBoundary>
);