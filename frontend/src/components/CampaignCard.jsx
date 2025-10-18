import PropTypes from 'prop-types';
import { Box, Image, Heading, Text, Progress, Flex, Badge, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { 
  formatDOT, 
  calculateProgress, 
  getDeadlineStatus, 
  getCampaignStateColor 
} from '../utils/formatters';

export const CampaignCard = ({ campaign }) => {
  // Use formatter utilities
  const progress = calculateProgress(campaign.raised, campaign.goal);
  const formattedGoal = formatDOT(campaign.goal);
  const formattedRaised = formatDOT(campaign.raised);
  const deadlineStatus = getDeadlineStatus(campaign.deadline);
  const stateColor = getCampaignStateColor(campaign.state || 'Active');
  
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
          <Badge colorScheme={deadlineStatus.color} fontSize="0.8em">
            {deadlineStatus.message}
          </Badge>
          <Badge colorScheme={stateColor} fontSize="0.8em">
            {campaign.state || 'Active'}
          </Badge>
        </Flex>
        
        <Heading size="md" mb={2} noOfLines={2}>
          {campaign.title}
        </Heading>
        
        <Text fontSize="sm" color="gray.600" noOfLines={3} mb={4}>
          {campaign.description}
        </Text>
        
        <Progress 
          value={progress} 
          colorScheme={progress >= 100 ? 'green' : 'blue'} 
          size="sm" 
          borderRadius="full" 
          mb={2} 
        />
        
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
          to={`/dashboard/campaign/${campaign.id}`}
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

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    raised: PropTypes.number.isRequired,
    goal: PropTypes.number.isRequired,
    deadline: PropTypes.number.isRequired,
    state: PropTypes.string,
  }).isRequired,
};

export default CampaignCard;