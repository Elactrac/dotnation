import React, { useState, useEffect } from 'react';
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

const formatBalance = (balance) => {
  return (balance / 1_000_000_000_000).toFixed(2); // Convert from femto to DOT
};

const calculateTimeLeft = (deadline) => {
  const now = Date.now();
  const timeLeft = deadline - now;
  
  if (timeLeft <= 0) return 'Ended';
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h left`;
};

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

  const progress = (campaign.fundsRaised / campaign.goal) * 100;
  const timeLeft = calculateTimeLeft(campaign.deadline);

  const handleDonate = async () => {
    try {
      if (!selectedAccount) {
        throw new Error('Please connect your wallet first');
      }

      const amount = parseFloat(donationAmount) * 1_000_000_000_000; // Convert to femto
      await donateToCampaign(campaign.id, amount);
      
      toast({
        title: 'Donation successful!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      setDonationAmount('');
    } catch (error) {
      toast({
        title: 'Donation failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Badge colorScheme={timeLeft === 'Ended' ? 'red' : 'green'} mb={2}>
            {timeLeft}
          </Badge>
          <Heading size="xl" mb={2}>{campaign.title}</Heading>
          <Text color="gray.600" fontSize="lg">{campaign.description}</Text>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <StatGroup>
            <Stat>
              <StatLabel>Raised</StatLabel>
              <StatNumber>{formatBalance(campaign.fundsRaised)} DOT</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Goal</StatLabel>
              <StatNumber>{formatBalance(campaign.goal)} DOT</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Progress</StatLabel>
              <StatNumber>{progress.toFixed(1)}%</StatNumber>
            </Stat>
          </StatGroup>
          <Progress value={progress} colorScheme="blue" size="lg" mt={4} />
        </Box>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <Heading size="md" mb={4}>Campaign Details</Heading>
              <List spacing={3}>
                <ListItem>
                  <Text><strong>Owner:</strong> {campaign.owner}</Text>
                </ListItem>
                <ListItem>
                  <Text><strong>Beneficiary:</strong> {campaign.beneficiary}</Text>
                </ListItem>
                <ListItem>
                  <Text><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</Text>
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
                isDisabled={timeLeft === 'Ended'}
              >
                Donate Now
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