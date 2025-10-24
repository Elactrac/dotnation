import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Button,
  Textarea,
  IconButton,
  Divider,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export const CampaignUpdates = ({ campaignId }) => {
  const { campaigns, addCampaignUpdate, deleteCampaignUpdate } = useCampaign();
  const { selectedAccount } = useWallet();
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const campaign = campaigns.find(c => c.id === campaignId);
  const isCreator = campaign?.creator === selectedAccount?.address;

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    setIsSubmitting(true);
    try {
      await addCampaignUpdate(campaignId, {
        content: newUpdate.trim(),
        timestamp: Date.now(),
        author: selectedAccount.address,
      });

      setNewUpdate('');
      toast({
        title: 'Update posted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await deleteCampaignUpdate(campaignId, updateId);
      toast({
        title: 'Update deleted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!campaign) return null;

  return (
    <VStack spacing={6} width="full" align="stretch">
      <Heading size="md">Campaign Updates</Heading>

      {isCreator && (
        <Box p={4} borderWidth={1} borderRadius="lg">
          <VStack spacing={3} align="stretch">
            <Textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Share an update about your campaign..."
              rows={4}
            />
            <Button
              colorScheme="blue"
              onClick={handleAddUpdate}
              isLoading={isSubmitting}
              loadingText="Posting..."
              disabled={!newUpdate.trim() || isSubmitting}
              alignSelf="flex-end"
            >
              Post Update
            </Button>
          </VStack>
        </Box>
      )}

      <VStack spacing={4} align="stretch">
        {campaign.updates?.map((update, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius="lg">
            <HStack justify="space-between" mb={2}>
              <HStack>
                <Avatar size="sm" name={update.author} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {update.author.slice(0, 8)}...{update.author.slice(-6)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(update.timestamp).toLocaleString()}
                  </Text>
                </VStack>
              </HStack>
              {isCreator && (
                <IconButton
                  icon={<DeleteIcon />}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDeleteUpdate(index)}
                  aria-label="Delete update"
                />
              )}
            </HStack>
            <Divider my={2} />
            <Text whiteSpace="pre-wrap">{update.content}</Text>
          </Box>
        ))}
        {(!campaign.updates || campaign.updates.length === 0) && (
          <Text color="gray.500" textAlign="center">
            No updates yet
          </Text>
        )}
      </VStack>
    </VStack>
  );
};

CampaignUpdates.propTypes = {
  campaignId: PropTypes.number.isRequired,
};