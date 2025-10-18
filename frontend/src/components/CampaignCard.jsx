import PropTypes from 'prop-types';
import {
  Box,
  Image,
  Heading,
  Text,
  Progress,
  Flex,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiHeart, FiUsers, FiClock, FiTrendingUp } from 'react-icons/fi';
import {
  formatDOT,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor
} from '../utils/formatters';

export const CampaignCard = ({ campaign, showStats = true, compact = false }) => {
  // Use formatter utilities
  const progress = calculateProgress(campaign.raised, campaign.goal);
  const formattedGoal = formatDOT(campaign.goal);
  const formattedRaised = formatDOT(campaign.raised);
  const deadlineStatus = getDeadlineStatus(campaign.deadline);
  const stateColor = getCampaignStateColor(campaign.state || 'Active');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        borderColor: 'blue.300'
      }}
      bg={bgColor}
      borderColor={borderColor}
      position="relative"
    >
      {/* Image Section */}
      <Box position="relative" overflow="hidden">
        <Image
          src={campaign.imageUrl || 'https://via.placeholder.com/400x200?text=Campaign+Image'}
          alt={campaign.title}
          height={{ base: compact ? "120px" : "180px", md: "200px" }}
          width="100%"
          objectFit="cover"
          transition="transform 0.3s ease"
          _hover={{ transform: 'scale(1.05)' }}
        />

        {/* Overlay badges */}
        <Flex
          position="absolute"
          top={3}
          left={3}
          right={3}
          justify="space-between"
          align="center"
        >
          <Badge
            colorScheme={deadlineStatus.color}
            fontSize={{ base: "xs", md: "sm" }}
            px={2}
            py={1}
            borderRadius="full"
            bg={`${deadlineStatus.color}.500`}
            color="white"
          >
            {deadlineStatus.message}
          </Badge>
          <Badge
            colorScheme={stateColor}
            fontSize={{ base: "xs", md: "sm" }}
            px={2}
            py={1}
            borderRadius="full"
            bg={`${stateColor}.500`}
            color="white"
          >
            {campaign.state || 'Active'}
          </Badge>
        </Flex>
      </Box>

      <Box p={{ base: 4, md: 5 }}>
        <VStack spacing={3} align="stretch">
          <Heading
            size={{ base: compact ? "sm" : "md", md: "md" }}
            noOfLines={2}
            lineHeight="tight"
            fontWeight="semibold"
          >
            {campaign.title}
          </Heading>

          {!compact && (
            <Text
              color="gray.600"
              fontSize={{ base: "sm", md: "md" }}
              noOfLines={2}
              lineHeight="short"
            >
              {campaign.description}
            </Text>
          )}

          {/* Progress Section */}
          <Box>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                {formattedRaised} raised
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
                {progress.toFixed(1)}%
              </Text>
            </Flex>
            <Progress
              value={progress}
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
              borderRadius="full"
              bg="gray.100"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Goal: {formattedGoal}
            </Text>
          </Box>

          {/* Stats */}
          {showStats && (
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={2}
            >
              <HStack spacing={1}>
                <Icon as={FiUsers} boxSize={3} color="gray.500" />
                <Text fontSize="xs" color="gray.600">
                  0 donors
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiClock} boxSize={3} color="gray.500" />
                <Text fontSize="xs" color="gray.600">
                  {deadlineStatus.message}
                </Text>
              </HStack>
            </Flex>
          )}

          {/* Action Buttons */}
          <Flex gap={2} mt={2}>
            <Button
              as={Link}
              to={`/dashboard/campaign/${campaign.id}`}
              size={{ base: "sm", md: "md" }}
              colorScheme="blue"
              variant="outline"
              flex={1}
              fontSize={{ base: "sm", md: "md" }}
            >
              View Details
            </Button>
            <Button
              size={{ base: "sm", md: "md" }}
              colorScheme="blue"
              variant="solid"
              flex={1}
              fontSize={{ base: "sm", md: "md" }}
            >
              Donate
            </Button>
          </Flex>
        </VStack>
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
    raised: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    goal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    deadline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    state: PropTypes.string,
  }).isRequired,
  showStats: PropTypes.bool,
  compact: PropTypes.bool,
};

export default CampaignCard;