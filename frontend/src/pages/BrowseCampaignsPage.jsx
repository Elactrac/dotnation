import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Grid,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text as ChakraText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import {
  formatDOT,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  formatDate
} from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const BrowseCampaignsPage = () => {
  const { campaigns, isLoading, error } = useCampaign();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [goalRange, setGoalRange] = useState([0, 100000]); // DOT range
  const [progressRange, setProgressRange] = useState([0, 100]); // Progress percentage
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Mock categories (in a real app, these would come from the backend)
  const availableCategories = [
    'Technology', 'Education', 'Health', 'Environment',
    'Arts', 'Community', 'Business', 'Charity'
  ];

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    let filtered = campaigns.filter(campaign => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = campaign.title.toLowerCase().includes(query);
        const matchesDescription = campaign.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && campaign.state.toLowerCase() !== statusFilter) {
        return false;
      }

      // Goal range filter (convert to plancks for comparison)
      const goalInDOT = Number(campaign.goal) / 1_000_000_000_000;
      if (goalInDOT < goalRange[0] || goalInDOT > goalRange[1]) {
        return false;
      }

      // Progress range filter
      const progress = calculateProgress(campaign.raised, campaign.goal);
      if (progress < progressRange[0] || progress > progressRange[1]) {
        return false;
      }

      // Category filter (mock implementation)
      if (selectedCategories.length > 0) {
        // In a real app, campaigns would have categories
        // For now, we'll randomly assign categories for demo
        const campaignCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        if (!selectedCategories.includes(campaignCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.deadline - a.deadline; // Newer deadlines first
        case 'oldest':
          return a.deadline - b.deadline;
        case 'goal-high':
          return Number(b.goal - a.goal);
        case 'goal-low':
          return Number(a.goal - b.goal);
        case 'progress-high':
          return calculateProgress(b.raised, b.goal) - calculateProgress(a.raised, a.goal);
        case 'progress-low':
          return calculateProgress(a.raised, a.goal) - calculateProgress(b.raised, b.goal);
        case 'raised-high':
          return Number(b.raised - a.raised);
        case 'raised-low':
          return Number(a.raised - b.raised);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchQuery, statusFilter, sortBy, goalRange, progressRange, selectedCategories]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
    setGoalRange([0, 100000]);
    setProgressRange([0, 100]);
    setSelectedCategories([]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    if (goalRange[0] !== 0 || goalRange[1] !== 100000) count++;
    if (progressRange[0] !== 0 || progressRange[1] !== 100) count++;
    if (selectedCategories.length > 0) count++;
    return count;
  }, [searchQuery, statusFilter, sortBy, goalRange, progressRange, selectedCategories]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading campaigns...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
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
          <Heading size="xl">Browse Campaigns</Heading>
          <Text color="gray.600">
            Discover and support amazing causes from around the world
          </Text>
        </VStack>

        {/* Search and Filters */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search Bar */}
              <InputGroup size="lg">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search campaigns by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              {/* Filter Toggle and Sort */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack>
                  <Button
                    leftIcon={<Icon as={FiFilter} />}
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    colorScheme={activeFiltersCount > 0 ? 'blue' : 'gray'}
                  >
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </HStack>

                <HStack>
                  <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    Sort by:
                  </Text>
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="sm" maxW="200px">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="goal-high">Highest Goal</option>
                    <option value="goal-low">Lowest Goal</option>
                    <option value="progress-high">Most Funded</option>
                    <option value="progress-low">Least Funded</option>
                    <option value="raised-high">Most Raised</option>
                    <option value="raised-low">Least Raised</option>
                  </Select>
                </HStack>
              </Flex>

              {/* Advanced Filters */}
              {showFilters && (
                <Box borderWidth="1px" borderRadius="md" p={4} bg={bgColor}>
                  <VStack spacing={6} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Advanced Filters</Heading>
                      <Button size="sm" variant="ghost" onClick={() => setShowFilters(false)}>
                        <Icon as={FiX} />
                      </Button>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {/* Status Filter */}
                      <FormControl>
                        <FormLabel fontSize="sm">Campaign Status</FormLabel>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="successful">Successful</option>
                          <option value="failed">Failed</option>
                          <option value="withdrawn">Withdrawn</option>
                        </Select>
                      </FormControl>

                      {/* Goal Range */}
                      <FormControl>
                        <FormLabel fontSize="sm">Goal Range (DOT)</FormLabel>
                        <HStack>
                          <NumberInput
                            value={goalRange[0]}
                            onChange={(value) => setGoalRange([Number(value), goalRange[1]])}
                            min={0}
                            max={goalRange[1]}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <ChakraText>to</ChakraText>
                          <NumberInput
                            value={goalRange[1]}
                            onChange={(value) => setGoalRange([goalRange[0], Number(value)])}
                            min={goalRange[0]}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </HStack>
                      </FormControl>

                      {/* Progress Range */}
                      <FormControl>
                        <FormLabel fontSize="sm">Funding Progress (%)</FormLabel>
                        <RangeSlider
                          value={progressRange}
                          onChange={setProgressRange}
                          min={0}
                          max={100}
                        >
                          <RangeSliderTrack>
                            <RangeSliderFilledTrack />
                          </RangeSliderTrack>
                          <RangeSliderThumb index={0} />
                          <RangeSliderThumb index={1} />
                        </RangeSlider>
                        <Flex justify="space-between" mt={2}>
                          <Text fontSize="xs" color="gray.600">{progressRange[0]}%</Text>
                          <Text fontSize="xs" color="gray.600">{progressRange[1]}%</Text>
                        </Flex>
                      </FormControl>
                    </SimpleGrid>

                    {/* Categories */}
                    <Box>
                      <FormLabel fontSize="sm">Categories</FormLabel>
                      <Wrap spacing={2}>
                        {availableCategories.map(category => (
                          <WrapItem key={category}>
                            <Tag
                              size="md"
                              variant={selectedCategories.includes(category) ? 'solid' : 'outline'}
                              colorScheme="blue"
                              cursor="pointer"
                              onClick={() => handleCategoryToggle(category)}
                            >
                              <TagLabel>{category}</TagLabel>
                              {selectedCategories.includes(category) && (
                                <TagCloseButton onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryToggle(category);
                                }} />
                              )}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Results Summary */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Text color="gray.600">
            Showing {filteredCampaigns.length} of {campaigns?.length || 0} campaigns
          </Text>
          {activeFiltersCount > 0 && (
            <Badge colorScheme="blue" variant="subtle">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </Flex>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Icon as={FiSearch} boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.600">
                  No Campaigns Found
                </Heading>
                <Text color="gray.500" maxW="md">
                  {activeFiltersCount > 0
                    ? "Try adjusting your filters or search terms to find more campaigns."
                    : "There are no campaigns available at the moment. Check back later!"
                  }
                </Text>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {filteredCampaigns.map((campaign) => {
              const progress = calculateProgress(campaign.raised, campaign.goal);
              const deadlineStatus = getDeadlineStatus(campaign.deadline);
              const stateColor = getCampaignStateColor(campaign.state);

              return (
                <Card key={campaign.id} _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Badge colorScheme={stateColor} fontSize="xs">
                        {campaign.state}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        #{campaign.id}
                      </Text>
                    </Flex>
                    <Heading size="md" noOfLines={2}>
                      {campaign.title}
                    </Heading>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {campaign.description}
                      </Text>

                      <Box>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDOT(campaign.raised)} DOT raised
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {progress.toFixed(1)}%
                          </Text>
                        </Flex>
                        <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Goal: {formatDOT(campaign.goal)} DOT
                        </Text>
                      </Box>

                      <Flex justify="space-between" fontSize="xs" color="gray.600">
                        <HStack>
                          <Icon as={FiClock} />
                          <Text>{deadlineStatus.message}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiUsers} />
                          <Text>0 donors</Text>
                        </HStack>
                      </Flex>
                    </VStack>
                  </CardBody>

                  <CardFooter pt={0}>
                    <Button
                      as={Link}
                      to={`/dashboard/campaign/${campaign.id}`}
                      colorScheme="blue"
                      size="sm"
                      width="100%"
                    >
                      View Campaign
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </Grid>
        )}
      </VStack>
    </Container>
  );
};

export default () => (
  <PageErrorBoundary pageName="Browse Campaigns">
    <BrowseCampaignsPage />
  </PageErrorBoundary>
);