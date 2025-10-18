import React from 'react';
import PropTypes from 'prop-types';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
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
  StatArrow,
  StatGroup,
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext';

export const CampaignDashboard = ({ campaignId }) => {
  const { campaigns } = useCampaign();
  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return <Text>Campaign not found</Text>;
  }

  const totalRaised = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
  const progress = (totalRaised / campaign.goal) * 100;
  const donorCount = new Set(campaign.donations.map(d => d.donor)).size;
  const avgDonation = totalRaised / campaign.donations.length || 0;
  
  // Sort donations by amount (descending) to get top donors
  const topDonors = [...campaign.donations]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(donation => ({
      address: donation.donor,
      amount: donation.amount / 1_000_000_000_000, // Convert to DOT
      timestamp: new Date(donation.timestamp).toLocaleString(),
    }));

  return (
    <VStack spacing={8} width="full" align="stretch">
      <Heading size="lg">{campaign.title} - Dashboard</Heading>

      <StatGroup>
        <Stat>
          <StatLabel>Total Raised</StatLabel>
          <StatNumber>{(totalRaised / 1_000_000_000_000).toFixed(2)} DOT</StatNumber>
          <StatHelpText>
            <StatArrow type={progress >= 50 ? 'increase' : 'decrease'} />
            {progress.toFixed(1)}% of goal
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Contributors</StatLabel>
          <StatNumber>{donorCount}</StatNumber>
          <StatHelpText>unique donors</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Average Donation</StatLabel>
          <StatNumber>{(avgDonation / 1_000_000_000_000).toFixed(2)} DOT</StatNumber>
          <StatHelpText>per donation</StatHelpText>
        </Stat>
      </StatGroup>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box p={6} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={4}>Top Donors</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Address</Th>
                <Th isNumeric>Amount (DOT)</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topDonors.map((donor, index) => (
                <Tr key={index}>
                  <Td>{donor.address.slice(0, 8)}...{donor.address.slice(-6)}</Td>
                  <Td isNumeric>{donor.amount.toFixed(2)}</Td>
                  <Td>{donor.timestamp}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box p={6} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={4}>Campaign Details</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text>Status</Text>
              <Badge colorScheme={progress >= 100 ? 'green' : 'blue'}>
                {progress >= 100 ? 'Funded' : 'Active'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Category</Text>
              <Text>{campaign.category || 'Uncategorized'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Deadline</Text>
              <Text>{new Date(campaign.deadline).toLocaleDateString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Beneficiary</Text>
              <Text>{campaign.beneficiary.slice(0, 8)}...{campaign.beneficiary.slice(-6)}</Text>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

CampaignDashboard.propTypes = {
  campaignId: PropTypes.string.isRequired,
};