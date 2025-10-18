import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Progress,
  Button,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  List,
  ListItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import {
  formatDOT,
  formatDate,
  formatRelativeTime,
  shortenAddress,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  parseDOT,
} from '../utils/formatters';

export const CampaignDetails = () => {
  const { id } = useParams();
  const { campaigns, donateToCampaign } = useCampaign();
  const { selectedAccount } = useWallet();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [donationAmount, setDonationAmount] = useState('');
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    const foundCampaign = campaigns.find(c => c.id === parseInt(id));
    setCampaign(foundCampaign);
  }, [campaigns, id]);

  if (!campaign) {
    return <Text>Campaign not found</Text>;
  }

  const progress = calculateProgress(campaign.raised || campaign.fundsRaised, campaign.goal);
  const deadlineStatus = getDeadlineStatus(campaign.deadline);
  const stateColor = getCampaignStateColor(campaign.state || 'Active');

  const handleDonate = async () => {
    try {
      if (!selectedAccount) {
        throw new Error('Please connect your wallet first');
      }

      const amountInPlancks = parseDOT(donationAmount);
      await donateToCampaign(campaign.id, amountInPlancks);
      
      toast({
        title: 'Donation Successful! 🎉',
        description: `You donated ${donationAmount} DOT to ${campaign.title}`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
      
      onClose();
      setDonationAmount('');
    } catch (error) {
      toast({
        title: 'Donation Failed',
        description: error.message || 'Failed to process donation',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Badge colorScheme={deadlineStatus.color} mb={2}>
            {deadlineStatus.message}
          </Badge>
          <Badge colorScheme={stateColor} ml={2} mb={2}>
            {campaign.state || 'Active'}
          </Badge>
          <Heading size="xl" mb={2}>{campaign.title}</Heading>
          <Text color="gray.600" fontSize="lg">{campaign.description}</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Created {formatRelativeTime(campaign.createdAt || Date.now())}
          </Text>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <StatGroup>
            <Stat>
              <StatLabel>Raised</StatLabel>
              <StatNumber>{formatDOT(campaign.raised || campaign.fundsRaised)} DOT</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Goal</StatLabel>
              <StatNumber>{formatDOT(campaign.goal)} DOT</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Progress</StatLabel>
              <StatNumber>{progress.toFixed(1)}%</StatNumber>
            </Stat>
          </StatGroup>
          <Progress value={progress} colorScheme={progress >= 100 ? 'green' : 'blue'} size="lg" mt={4} />
        </Box>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4}>Campaign Details</Heading>
              <List spacing={3}>
                <ListItem>
                  <Text><strong>Owner:</strong> {shortenAddress(campaign.owner)}</Text>
                </ListItem>
                <ListItem>
                  <Text><strong>Beneficiary:</strong> {shortenAddress(campaign.beneficiary)}</Text>
                </ListItem>
                <ListItem>
                  <Text><strong>Deadline:</strong> {formatDate(campaign.deadline)}</Text>
                </ListItem>
                <ListItem>
                  <Text><strong>Status:</strong> {campaign.state || 'Active'}</Text>
                </ListItem>
              </List>
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4}>Support this Campaign</Heading>
              <Text mb={4}>Your contribution helps make this campaign successful.</Text>
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                onClick={onOpen}
                isDisabled={deadlineStatus.isEnded || campaign.state !== 'Active'}
              >
                {deadlineStatus.isEnded ? 'Campaign Ended' : 'Donate Now'}
              </Button>
            </Box>
          </GridItem>
        </Grid>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Donate to {campaign.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount (DOT)</FormLabel>
              <Input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              onClick={handleDonate}
              isDisabled={!donationAmount || !selectedAccount}
              width="full"
            >
              Confirm Donation
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};