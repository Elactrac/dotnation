import { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  List,
  ListItem,
  ListIcon,
  CloseButton,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { getVersionInfo, formatVersion } from '../utils/contractVersion';

const VersionBanner = () => {
  const { getContractVersion, isBatchOperationsAvailable } = useBatchOperations();
  const toast = useToast();
  
  const [version, setVersion] = useState(null);
  const [batchAvailable, setBatchAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const isDismissed = localStorage.getItem('versionBannerDismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }

    // Detect contract version
    const detectVersion = async () => {
      try {
        const detectedVersion = await getContractVersion();
        setVersion(detectedVersion);
        
        const batchOpsAvailable = await isBatchOperationsAvailable();
        setBatchAvailable(batchOpsAvailable);
      } catch (error) {
        console.error('Error detecting version:', error);
        // Default to V1 if detection fails
        setVersion(1);
        setBatchAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    detectVersion();
  }, [getContractVersion, isBatchOperationsAvailable]);

  const handleDismiss = () => {
    localStorage.setItem('versionBannerDismissed', 'true');
    setDismissed(true);
    toast({
      title: 'Banner Dismissed',
      description: 'You can always find batch operations in the dashboard menu',
      status: 'info',
      duration: 3000,
    });
  };

  if (loading || dismissed || !batchAvailable || version < 2) {
    return null;
  }

  const versionInfo = getVersionInfo(version);

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="banner"
      bg="blue.50"
      borderBottomWidth="1px"
      borderColor="blue.200"
    >
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="start"
        justifyContent="center"
        textAlign="left"
        py={4}
        px={6}
      >
        <HStack width="100%" justify="space-between" mb={3}>
          <HStack>
            <AlertIcon boxSize="24px" />
            <AlertTitle mr={2} fontSize="lg">
              🎉 New Features Available! <Badge ml={2} colorScheme="blue">{formatVersion(version)}</Badge>
            </AlertTitle>
          </HStack>
          <CloseButton onClick={handleDismiss} />
        </HStack>

        <AlertDescription maxWidth="100%">
          <VStack align="start" spacing={4}>
            <Text fontSize="md">
              DotNation has been upgraded with powerful batch operations and scalability improvements!
            </Text>

            <Box>
              <Text fontWeight="bold" mb={2}>What&apos;s New:</Text>
              <List spacing={2}>
                {versionInfo.improvements.map((improvement, index) => (
                  <ListItem key={index} fontSize="sm">
                    <ListIcon as={CheckCircleIcon} color="blue.500" />
                    {improvement}
                  </ListItem>
                ))}
              </List>
            </Box>

            <HStack spacing={3}>
              <Button
                as={Link}
                to="/batch-create"
                colorScheme="blue"
                size="sm"
              >
                Try Batch Campaign Creator
              </Button>
              <Button
                as={Link}
                to="/batch-withdraw"
                colorScheme="green"
                size="sm"
              >
                Batch Withdraw Funds
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </HStack>
          </VStack>
        </AlertDescription>
      </Alert>
    </Box>
  );
};

export default VersionBanner;
