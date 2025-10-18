import React from 'react';
import { Box, Image, Heading, Text, Progress, Flex, Badge, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const CampaignCard = ({ campaign }) => {
  const progress = (campaign.raised / campaign.goal) * 100;
  const formattedGoal = new Intl.NumberFormat().format(campaign.goal);
  const formattedRaised = new Intl.NumberFormat().format(campaign.raised);
  
  // Format deadline
  const deadline = new Date(campaign.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      transition="transform 0.3s"
      _hover={{ transform: 'translateY(-5px)' }}
      bg="white"
    >
      <Image
        src={campaign.imageUrl || 'https://via.placeholder.com/400x200?text=Campaign+Image'}
        alt={campaign.title}
        height="200px"
        width="100%"
        objectFit="cover"
      />
      
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={2}>
          <Badge colorScheme="blue" fontSize="0.8em">
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </Badge>
          <Badge colorScheme={progress >= 100 ? 'green' : 'orange'} fontSize="0.8em">
            {progress >= 100 ? 'Funded' : 'In Progress'}
          </Badge>
        </Flex>
        
        <Heading size="md" mb={2} noOfLines={2}>
          {campaign.title}
        </Heading>
        
        <Text fontSize="sm" color="gray.600" noOfLines={3} mb={4}>
          {campaign.description}
        </Text>
        
        <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" mb={2} />
        
        <Flex justify="space-between" mb={4}>
          <Text fontSize="sm" fontWeight="bold">
            {formattedRaised} DOT
          </Text>
          <Text fontSize="sm" color="gray.600">
            of {formattedGoal} DOT
          </Text>
        </Flex>
        
        <Button
          as={Link}
          to={`/campaign/${campaign.id}`}
          colorScheme="blue"
          size="sm"
          width="100%"
        >
          View Campaign
        </Button>
      </Box>
    </Box>
  );
};

export default CampaignCard;