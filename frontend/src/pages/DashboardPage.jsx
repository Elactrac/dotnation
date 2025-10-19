import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Progress,
  Badge,
  Image,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext';
import { formatDOT } from '../utils/formatters';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Dashboard.css';

const DashboardPage = () => {
  const { campaigns } = useCampaign();
  const { selectedAccount } = useWallet();

  const bgCard = useColorModeValue('whiteAlpha.50', 'whiteAlpha.50');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('white', 'white');
  const textSecondary = useColorModeValue('whiteAlpha.600', 'whiteAlpha.600');

  // Calculate platform stats
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised || 0n), 0n) || 0n;
  const activeCampaigns = campaigns?.filter(c => c.state === 'Active').length || 0;
  const uniqueContributors = 3456; // Mock data

  // Mock trending projects
  const trendingProjects = campaigns?.slice(0, 3).map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    creator: 'Community Builder',
    raised: campaign.raised,
    goal: campaign.goal,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200',
  })) || [];

  // Mock user contributions
  const userContributions = [
    { project: 'DeFi For Good', amount: '500 DOT', date: '2 days ago' },
    { project: 'Ocean Cleanup DAO', amount: '250 DOT', date: '1 week ago' },
    { project: 'Open Source Education', amount: '100 DOT', date: '3 weeks ago' },
  ];

  const categories = ['Technology', 'Art', 'Environment', 'Social Good', 'DeFi', 'Gaming'];

  return (
    <Box minH="100vh" py={12} position="relative">
      <AnimatedBackground />
      <Container maxW="7xl">
        <VStack align="stretch" spacing={12}>
          {/* Header */}
          <Box>
            <Heading size="2xl" color={textColor} fontWeight="bold" mb={2}>
              Dashboard
            </Heading>
            <Text fontSize="lg" color={textSecondary}>
              Overview of the DotNation ecosystem.
            </Text>
          </Box>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box
              p={6}
              bg={bgCard}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
            >
              <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
                Total Raised
              </Text>
              <Heading size="xl" color={textColor} mt={2}>
                {formatDOT(totalRaised)} DOT
              </Heading>
              <Text fontSize="sm" color="green.400" fontWeight="medium" mt={1}>
                +15.2% last 30 days
              </Text>
            </Box>

            <Box
              p={6}
              bg={bgCard}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
            >
              <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
                Active Projects
              </Text>
              <Heading size="xl" color={textColor} mt={2}>
                {activeCampaigns}
              </Heading>
              <Text fontSize="sm" color={textSecondary} fontWeight="medium" mt={1}>
                {campaigns?.length || 0} total campaigns
              </Text>
            </Box>

            <Box
              p={6}
              bg={bgCard}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
            >
              <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
                Unique Contributors
              </Text>
              <Heading size="xl" color={textColor} mt={2}>
                {uniqueContributors.toLocaleString()}
              </Heading>
              <Text fontSize="sm" color={textSecondary} fontWeight="medium" mt={1}>
                Growing daily
              </Text>
            </Box>
          </SimpleGrid>

          {/* Main Content Grid */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Left Column - Trending Projects */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color={textColor}>
                  Trending Projects
                </Heading>
                <Button
                  as={Link}
                  to="/dashboard/browse"
                  variant="link"
                  color="pink.500"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  View All
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {trendingProjects.length > 0 ? (
                  trendingProjects.map((project, index) => {
                    const percentFunded = project.goal > 0n 
                      ? Number((project.raised * 100n) / project.goal)
                      : 0;

                    return (
                      <Box
                        key={index}
                        p={4}
                        bg={bgCard}
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                        transition="all 0.3s"
                        _hover={{ bg: 'whiteAlpha.100' }}
                      >
                        <Flex gap={4} align="center">
                          <Image
                            src={project.image}
                            alt={project.title}
                            boxSize="64px"
                            borderRadius="lg"
                            objectFit="cover"
                          />

                          <Box flex="1">
                            <Heading size="md" color={textColor}>
                              {project.title}
                            </Heading>
                            <Text fontSize="sm" color={textSecondary}>
                              By {project.creator}
                            </Text>
                          </Box>

                          <VStack align="end" spacing={0}>
                            <Heading size="md" color={textColor}>
                              {formatDOT(project.raised)} DOT
                            </Heading>
                            <Text fontSize="sm" color={textSecondary}>
                              {percentFunded}% funded
                            </Text>
                          </VStack>

                          <Button
                            size="md"
                            bg="pink.500"
                            color="white"
                            opacity={0.2}
                            _hover={{ opacity: 0.3 }}
                            as={Link}
                            to={`/dashboard/campaign/${project.id}`}
                          >
                            Fund
                          </Button>
                        </Flex>
                      </Box>
                    );
                  })
                ) : (
                  <Box
                    p={8}
                    bg={bgCard}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Text color={textSecondary}>
                      No campaigns available yet. Be the first to create one!
                    </Text>
                    <Button
                      as={Link}
                      to="/dashboard/create-campaign"
                      mt={4}
                      bg="pink.500"
                      color="white"
                      _hover={{ bg: 'pink.600' }}
                    >
                      Create Campaign
                    </Button>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Right Column - Sidebar */}
            <VStack spacing={8} align="stretch">
              {/* Your Contributions */}
              <Box
                p={6}
                bg={bgCard}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
              >
                <Heading size="md" color={textColor} mb={6}>
                  Your Contributions
                </Heading>

                {selectedAccount ? (
                  <VStack spacing={4} align="stretch">
                    {userContributions.map((contrib, index) => (
                      <React.Fragment key={index}>
                        <Box>
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text color={textColor} fontWeight="medium">
                              {contrib.project}
                            </Text>
                            <Text color="pink.500" fontWeight="bold">
                              {contrib.amount}
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color={textSecondary}>
                            {contrib.date}
                          </Text>
                        </Box>
                        {index < userContributions.length - 1 && (
                          <Box h="1px" bg={borderColor} />
                        )}
                      </React.Fragment>
                    ))}

                    <Button
                      mt={2}
                      w="full"
                      bg="whiteAlpha.100"
                      color={textColor}
                      _hover={{ bg: 'whiteAlpha.200' }}
                      size="sm"
                      as={Link}
                      to="/dashboard/my-donations"
                    >
                      View History
                    </Button>
                  </VStack>
                ) : (
                  <Text color={textSecondary} textAlign="center">
                    Connect your wallet to see your contributions
                  </Text>
                )}
              </Box>

              {/* Categories */}
              <Box
                p={6}
                bg={bgCard}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
              >
                <Heading size="md" color={textColor} mb={6}>
                  Categories
                </Heading>

                <Flex flexWrap="wrap" gap={2}>
                  {categories.map((category, index) => (
                    <Badge
                      key={index}
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={index === 0 ? 'pink.500' : 'whiteAlpha.100'}
                      color={index === 0 ? 'white' : 'whiteAlpha.800'}
                      opacity={index === 0 ? 0.2 : 1}
                      fontWeight="medium"
                      fontSize="sm"
                      cursor="pointer"
                      _hover={{ opacity: 0.3 }}
                    >
                      {category}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default DashboardPage;