import React, { useState, useEffect } from 'react';
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
  useToast
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { DonationInterface } from '../components/DonationInterface.jsx';

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

  const progress = (campaign.raised / campaign.goal) * 100;
  const formattedGoal = new Intl.NumberFormat().format(campaign.goal);
  const formattedRaised = new Intl.NumberFormat().format(campaign.raised);
  
  // Format deadline
  const deadline = new Date(campaign.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
  
  // Check if user is campaign owner or admin
  const isOwnerOrAdmin = selectedAccount && 
    (selectedAccount.address === campaign.owner || selectedAccount.address === campaign.admin);
  
  // Check if campaign is successful and not withdrawn
  const canWithdraw = isOwnerOrAdmin && 
    (campaign.state === 'Successful' || (campaign.state === 'Active' && daysLeft === 0)) && 
    campaign.state !== 'Withdrawn';

  return (
    <Container maxW="container.lg" py={10}>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <GridItem>
          <Image
            src={campaign.imageUrl || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
            alt={campaign.title}
            borderRadius="lg"
            width="100%"
            height="400px"
            objectFit="cover"
            mb={6}
          />
          
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="xl">{campaign.title}</Heading>
            <Badge 
              colorScheme={campaign.state === 'Successful' ? 'green' : 
                         campaign.state === 'Withdrawn' ? 'purple' : 
                         campaign.state === 'Failed' ? 'red' : 'blue'}
              p={2}
              fontSize="md"
            >
              {campaign.state}
            </Badge>
          </Flex>
          
          <Flex justify="space-between" mb={4}>
            <Text>Created by: {campaign.owner.substring(0, 8)}...{campaign.owner.substring(campaign.owner.length - 8)}</Text>
            <Text>Beneficiary: {campaign.beneficiary.substring(0, 8)}...{campaign.beneficiary.substring(campaign.beneficiary.length - 8)}</Text>
          </Flex>
          
          <Box mb={6}>
            <Progress value={progress} colorScheme="blue" size="md" borderRadius="full" mb={2} />
            <Flex justify="space-between">
              <Text fontSize="xl" fontWeight="bold">
                {formattedRaised} DOT raised
              </Text>
              <Text fontSize="xl">
                of {formattedGoal} DOT goal
              </Text>
            </Flex>
          </Box>
          
          <Flex justify="space-between" mb={6}>
            <Badge colorScheme={daysLeft > 0 ? 'green' : 'red'} p={2}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
            </Badge>
            <Text>Deadline: {deadline.toLocaleDateString()}</Text>
          </Flex>
          
          <Divider mb={6} />
          
          <Box mb={8}>
            <Heading size="md" mb={4}>About this campaign</Heading>
            <Text whiteSpace="pre-wrap">{campaign.description}</Text>
          </Box>
          
          {canWithdraw && (
            <Button
              colorScheme="green"
              size="lg"
              width="100%"
              mb={8}
              onClick={handleWithdraw}
              isLoading={isWithdrawing}
              loadingText="Processing withdrawal..."
            >
              Withdraw Funds
            </Button>
          )}
          
          {donations.length > 0 && (
            <Box mb={8}>
              <Heading size="md" mb={4}>Recent Donations</Heading>
              {donations.map((donation, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={2}>
                  <Flex justify="space-between">
                    <Text>
                      {donation.donor.substring(0, 8)}...{donation.donor.substring(donation.donor.length - 8)}
                    </Text>
                    <Text fontWeight="bold">{donation.amount} DOT</Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(donation.timestamp).toLocaleString()}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </GridItem>
        
        <GridItem>
          <Box position="sticky" top="20px">
            <DonationInterface campaignId={id} />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default CampaignDetailsPage;