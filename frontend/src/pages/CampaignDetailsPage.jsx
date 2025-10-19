import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Progress,
  Flex,
  Badge,
  Divider,
  Grid,
  GridItem,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useToast,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Avatar,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import {
  FiHeart,
  FiUsers,
  FiTrendingUp,
  FiMessageSquare,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiCopy
} from 'react-icons/fi';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { DonationInterface } from '../components/DonationInterface.jsx';
import {
  formatDOT,
  formatDate,
  formatDateTime,
  shortenAddress,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor
} from '../utils/formatters';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { getCampaignDetails, withdrawFunds, isLoading, error } = useCampaign();
  const { selectedAccount } = useWallet();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const details = await getCampaignDetails(id);
        if (details) {
          setCampaign(details.campaign);
          setDonations(details.donations || []);
        }
      } catch (err) {
        toast({
          title: 'Error fetching campaign',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (id) {
      fetchCampaignDetails();
    }
  }, [id, getCampaignDetails, toast]);

  const handleWithdraw = async () => {
    if (!campaign || !selectedAccount) return;

    setIsWithdrawing(true);
    try {
      await withdrawFunds(id);
      toast({
        title: 'Funds withdrawn successfully',
        description: 'The campaign funds have been transferred to the beneficiary address.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Refresh campaign details
      const details = await getCampaignDetails(id);
      setCampaign(details.campaign);
    } catch (err) {
      toast({
        title: 'Withdrawal failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = campaign ? `Support ${campaign.title} on DotNation!` : 'Check out this campaign on DotNation!';


    try {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast({
            title: 'Link copied!',
            description: 'Campaign link has been copied to clipboard',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          break;
        default:
          break;
      }
    } catch (err) {
      toast({
        title: 'Share failed',
        description: 'Unable to share this campaign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const campaignStats = useMemo(() => {
    if (!campaign) return null;

    const progress = calculateProgress(campaign.raised, campaign.goal);
    const deadlineStatus = getDeadlineStatus(campaign.deadline);
    const stateColor = getCampaignStateColor(campaign.state);

    return {
      progress,
      deadlineStatus,
      stateColor,
      formattedGoal: formatDOT(campaign.goal),
      formattedRaised: formatDOT(campaign.raised),
      isOwner: selectedAccount && selectedAccount.address === campaign.owner,
      canWithdraw: selectedAccount && campaign.owner === selectedAccount.address &&
        (campaign.state === 'Successful' || (campaign.state === 'Active' && deadlineStatus.daysLeft === 0)) &&
        campaign.state !== 'Withdrawn'
    };
  }, [campaign, selectedAccount]);

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading campaign details...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Error loading campaign: {error}</Text>
        </Alert>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text>Campaign not found</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <GridItem>
          {/* Campaign Header */}
          <VStack spacing={6} align="stretch">
            <Image
              src={campaign.imageUrl || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
              alt={campaign.title}
              borderRadius="lg"
              width="100%"
              height="400px"
              objectFit="cover"
            />

            <Flex justify="space-between" align="center">
              <Heading size="xl">{campaign.title}</Heading>
              <HStack>
                <Badge
                  colorScheme={campaignStats?.stateColor}
                  p={2}
                  fontSize="md"
                >
                  {campaign.state}
                </Badge>
                <HStack spacing={1}>
                  <Tooltip label="Share on Twitter">
                    <IconButton
                      icon={<FiTwitter />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare('twitter')}
                      aria-label="Share on Twitter"
                    />
                  </Tooltip>
                  <Tooltip label="Share on Facebook">
                    <IconButton
                      icon={<FiFacebook />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare('facebook')}
                      aria-label="Share on Facebook"
                    />
                  </Tooltip>
                  <Tooltip label="Share on LinkedIn">
                    <IconButton
                      icon={<FiLinkedin />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare('linkedin')}
                      aria-label="Share on LinkedIn"
                    />
                  </Tooltip>
                  <Tooltip label="Copy link">
                    <IconButton
                      icon={<FiCopy />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare('copy')}
                      aria-label="Copy link"
                    />
                  </Tooltip>
                </HStack>
              </HStack>
            </Flex>

            {/* Campaign Stats */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Funds Raised</StatLabel>
                <StatNumber color="green.500">{campaignStats?.formattedRaised} DOT</StatNumber>
                <StatHelpText>of {campaignStats?.formattedGoal} DOT goal</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Progress</StatLabel>
                <StatNumber>{campaignStats?.progress.toFixed(1)}%</StatNumber>
                <Progress value={campaignStats?.progress} colorScheme="blue" size="sm" mt={2} />
              </Stat>
              <Stat>
                <StatLabel>Time Left</StatLabel>
                <StatNumber color={campaignStats?.deadlineStatus.color}>
                  {campaignStats?.deadlineStatus.message}
                </StatNumber>
                <StatHelpText>Deadline: {formatDate(campaign.deadline)}</StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Campaign Details */}
            <Flex justify="space-between" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="white">Created by</Text>
                <Text fontWeight="medium">{shortenAddress(campaign.owner)}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="white">Beneficiary</Text>
                <Text fontWeight="medium">{shortenAddress(campaign.beneficiary)}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="white">Total Donors</Text>
                <HStack>
                  <Icon as={FiUsers} />
                  <Text fontWeight="medium">{donations.length}</Text>
                </HStack>
              </VStack>
            </Flex>

            <Divider />

            {/* Campaign Content Tabs */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab><Icon as={FiHeart} mr={2} />About</Tab>
                <Tab><Icon as={FiTrendingUp} mr={2} />Updates</Tab>
                <Tab><Icon as={FiMessageSquare} mr={2} />Discussion</Tab>
                <Tab><Icon as={FiUsers} mr={2} />Donors ({donations.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Box>
                    <Heading size="md" mb={4}>About this campaign</Heading>
                    <Text whiteSpace="pre-wrap" lineHeight="tall">{campaign.description}</Text>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Campaign Updates</Heading>
                    <Text color="white" fontStyle="italic">
                      No updates yet. Campaign updates will appear here as the creator shares progress.
                    </Text>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Discussion</Heading>
                    <Text color="white" fontStyle="italic">
                      Comments and discussion feature coming soon. Stay tuned!
                    </Text>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Recent Donations</Heading>
                    {donations.length > 0 ? (
                      donations.slice(0, 10).map((donation, index) => (
                        <Card key={index} size="sm">
                          <CardBody>
                            <Flex justify="space-between" align="center">
                              <HStack>
                                <Avatar size="sm" name={shortenAddress(donation.donor)} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{shortenAddress(donation.donor)}</Text>
                                  <Text fontSize="sm" color="white">
                                    {formatDateTime(donation.timestamp)}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge colorScheme="green" fontSize="md" p={2}>
                                {formatDOT(donation.amount)} DOT
                              </Badge>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <Text color="white" fontStyle="italic" textAlign="center" py={8}>
                        No donations yet. Be the first to support this campaign!
                      </Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Withdraw Button for Campaign Owner */}
            {campaignStats?.canWithdraw && (
              <Button
                colorScheme="green"
                size="lg"
                width="100%"
                onClick={handleWithdraw}
                isLoading={isWithdrawing}
                loadingText="Processing withdrawal..."
                leftIcon={<Icon as={FiTrendingUp} />}
              >
                Withdraw Funds
              </Button>
            )}
          </VStack>
        </GridItem>

        <GridItem>
          <Box position="sticky" top="20px">
            <DonationInterface campaignId={id} campaign={campaign} />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default CampaignDetailsPage;