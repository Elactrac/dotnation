import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  useColorModeValue
} from '@chakra-ui/react';

/**
 * Campaign Card Skeleton Loader
 */
export const CampaignCardSkeleton = ({ count = 1 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          bg={bgColor}
          borderColor={borderColor}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
        >
          <CardHeader p={0}>
            <Skeleton height="200px" width="100%" borderRadius="none" />
          </CardHeader>

          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Skeleton height="20px" width="80px" borderRadius="full" />
                <Skeleton height="20px" width="60px" borderRadius="full" />
              </HStack>

              <Skeleton height="24px" width="100%" />
              <Skeleton height="16px" width="90%" />
              <Skeleton height="16px" width="70%" />

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Skeleton height="14px" width="100px" />
                  <Skeleton height="14px" width="50px" />
                </HStack>
                <Skeleton height="8px" width="100%" borderRadius="full" />
                <Skeleton height="12px" width="80px" mt={1} />
              </Box>

              <HStack spacing={3}>
                <Skeleton height="12px" width="60px" />
                <Skeleton height="12px" width="80px" />
              </HStack>
            </VStack>
          </CardBody>

          <CardFooter pt={0}>
            <HStack spacing={2} width="100%">
              <Skeleton height="32px" flex={1} borderRadius="md" />
              <Skeleton height="32px" flex={1} borderRadius="md" />
            </HStack>
          </CardFooter>
        </Card>
      ))}
    </SimpleGrid>
  );
};

/**
 * Campaign List Skeleton Loader
 */
export const CampaignListSkeleton = ({ count = 5 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <VStack spacing={4} align="stretch">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} bg={bgColor}>
          <CardBody>
            <HStack spacing={4} align="start">
              <Skeleton height="80px" width="80px" borderRadius="md" />

              <VStack flex={1} spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Skeleton height="20px" width="120px" />
                  <Skeleton height="20px" width="80px" borderRadius="full" />
                </HStack>

                <Skeleton height="18px" width="100%" />
                <Skeleton height="14px" width="80%" />

                <HStack spacing={4}>
                  <Skeleton height="12px" width="60px" />
                  <Skeleton height="12px" width="70px" />
                  <Skeleton height="12px" width="50px" />
                </HStack>

                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Skeleton height="12px" width="80px" />
                    <Skeleton height="12px" width="40px" />
                  </HStack>
                  <Skeleton height="6px" width="100%" borderRadius="full" />
                </Box>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};

/**
 * Stats Card Skeleton Loader
 */
export const StatsCardSkeleton = ({ count = 4 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: count }} spacing={6}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} bg={bgColor}>
          <CardBody>
            <VStack spacing={3} align="center" textAlign="center">
              <SkeletonCircle size="40px" />
              <Skeleton height="16px" width="80px" />
              <Skeleton height="24px" width="60px" />
              <Skeleton height="12px" width="100px" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

/**
 * Profile Page Skeleton Loader
 */
export const ProfileSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <VStack spacing={8} align="stretch">
      {/* Header Section */}
      <Card bg={bgColor}>
        <CardBody>
          <HStack spacing={6} align="start">
            <SkeletonCircle size="100px" />
            <VStack flex={1} spacing={4} align="stretch">
              <Skeleton height="32px" width="200px" />
              <Skeleton height="16px" width="150px" />
              <HStack spacing={4}>
                <Skeleton height="20px" width="80px" borderRadius="full" />
                <Skeleton height="20px" width="100px" borderRadius="full" />
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Stats Section */}
      <StatsCardSkeleton count={3} />

      {/* Content Tabs */}
      <Card bg={bgColor}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack spacing={4}>
              <Skeleton height="32px" width="100px" borderRadius="md" />
              <Skeleton height="32px" width="120px" borderRadius="md" />
              <Skeleton height="32px" width="80px" borderRadius="md" />
            </HStack>

            <VStack spacing={4} align="stretch">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} size="sm">
                  <CardBody>
                    <HStack spacing={4}>
                      <Skeleton height="60px" width="60px" borderRadius="md" />
                      <VStack flex={1} spacing={2} align="stretch">
                        <Skeleton height="18px" width="100%" />
                        <Skeleton height="14px" width="80%" />
                        <Skeleton height="12px" width="60%" />
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

/**
 * Donation Interface Skeleton Loader
 */
export const DonationSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Card bg={bgColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} align="center" textAlign="center">
            <Skeleton height="24px" width="150px" />
            <Skeleton height="16px" width="200px" />
          </VStack>

          <Box>
            <Skeleton height="16px" width="100px" mb={2} />
            <Skeleton height="40px" width="100%" borderRadius="md" />
          </Box>

          <Box>
            <Skeleton height="16px" width="120px" mb={2} />
            <Skeleton height="100px" width="100%" borderRadius="md" />
          </Box>

          <HStack spacing={4}>
            <Skeleton height="40px" flex={1} borderRadius="md" />
            <Skeleton height="40px" width="100px" borderRadius="md" />
          </HStack>

          <VStack spacing={2} align="stretch">
            <Skeleton height="14px" width="100%" />
            <Skeleton height="14px" width="90%" />
            <Skeleton height="14px" width="80%" />
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Generic Table Skeleton Loader
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Card bg={bgColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Table Header */}
          <HStack spacing={4}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} height="16px" flex={1} />
            ))}
          </HStack>

          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <HStack key={rowIndex} spacing={4}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="14px" flex={1} />
              ))}
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Search Results Skeleton Loader
 */
export const SearchSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <VStack spacing={6} align="stretch">
      {/* Search Bar */}
      <Skeleton height="48px" width="100%" borderRadius="md" />

      {/* Filters */}
      <HStack spacing={4}>
        <Skeleton height="32px" width="120px" borderRadius="md" />
        <Skeleton height="32px" width="100px" borderRadius="md" />
        <Skeleton height="32px" width="80px" borderRadius="md" />
      </HStack>

      {/* Results Count */}
      <Skeleton height="16px" width="150px" />

      {/* Results Grid */}
      <CampaignCardSkeleton count={6} />
    </VStack>
  );
};

CampaignCardSkeleton.propTypes = {
  count: PropTypes.number
};

CampaignListSkeleton.propTypes = {
  count: PropTypes.number
};

StatsCardSkeleton.propTypes = {
  count: PropTypes.number
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

export default {
  CampaignCardSkeleton,
  CampaignListSkeleton,
  StatsCardSkeleton,
  ProfileSkeleton,
  DonationSkeleton,
  TableSkeleton,
  SearchSkeleton
};