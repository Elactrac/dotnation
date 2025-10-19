import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  VStack,
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Box,
  Badge,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { useCampaign } from '../contexts/CampaignContext';

export const CampaignSearch = ({ onFilteredCampaigns }) => {
  const { campaigns } = useCampaign();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [progressRange, setProgressRange] = useState([0, 100]);
  const [activeFilters, setActiveFilters] = useState([]);

  // Get unique categories from campaigns
  const categories = [...new Set(campaigns.map(c => c.category).filter(Boolean))];

  const applyFilters = useCallback(() => {
    let filtered = [...campaigns];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(campaign => {
        const progress = (campaign.totalRaised / campaign.goal) * 100;
        const isActive = new Date(campaign.deadline) > new Date();
        
        switch (selectedStatus) {
          case 'active':
            return isActive;
          case 'completed':
            return progress >= 100;
          case 'expired':
            return !isActive;
          default:
            return true;
        }
      });
    }

    // Apply progress range filter
    filtered = filtered.filter(campaign => {
      const progress = (campaign.totalRaised / campaign.goal) * 100;
      return progress >= progressRange[0] && progress <= progressRange[1];
    });

    onFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, selectedCategory, selectedStatus, progressRange, onFilteredCampaigns]);

  // Update active filters display
  useEffect(() => {
    const newFilters = [];
    if (searchTerm) newFilters.push({ type: 'search', value: searchTerm });
    if (selectedCategory) newFilters.push({ type: 'category', value: selectedCategory });
    if (selectedStatus) newFilters.push({ type: 'status', value: selectedStatus });
    if (progressRange[0] !== 0 || progressRange[1] !== 100) {
      newFilters.push({ type: 'progress', value: `${progressRange[0]}%-${progressRange[1]}%` });
    }
    setActiveFilters(newFilters);
  }, [searchTerm, selectedCategory, selectedStatus, progressRange]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'status':
        setSelectedStatus('');
        break;
      case 'progress':
        setProgressRange([0, 100]);
        break;
    }
  };

  return (
    <VStack spacing={4} width="full">
      <HStack width="full" spacing={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          placeholder="Select category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </Select>
      </HStack>

      <Box width="full">
        <Text mb={2}>Progress Range: {progressRange[0]}% - {progressRange[1]}%</Text>
        <RangeSlider
          value={progressRange}
          onChange={setProgressRange}
          min={0}
          max={100}
          step={5}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
      </Box>

      {activeFilters.length > 0 && (
        <Wrap spacing={2}>
          {activeFilters.map((filter, index) => (
            <WrapItem key={index}>
              <Badge
                borderRadius="full"
                px={3}
                py={1}
                colorScheme="blue"
                display="flex"
                alignItems="center"
              >
                {filter.type}: {filter.value}
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  ml={1}
                  variant="ghost"
                  onClick={() => removeFilter(filter.type)}
                  aria-label={`Remove ${filter.type} filter`}
                />
              </Badge>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </VStack>
  );
};

CampaignSearch.propTypes = {
  onFilteredCampaigns: PropTypes.func.isRequired,
};