import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Switch,
  Button,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import MouseFollower from '../components/MouseFollower.jsx';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    newCampaigns: false,
    contributions: true,
  });

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const bgCard = useColorModeValue('whiteAlpha.50', 'whiteAlpha.50');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('white', 'white');
  const textSecondary = useColorModeValue('whiteAlpha.600', 'whiteAlpha.600');

  const SettingSection = ({ title, children }) => (
    <Box mb={12}>
      <Heading size="lg" mb={6} color={textColor}>
        {title}
      </Heading>
      <Box
        bg={bgCard}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
      >
        {children}
      </Box>
    </Box>
  );

  const SettingRow = ({ title, description, children, showDivider = true }) => (
    <>
      <Flex justify="space-between" align="center" py={4}>
        <Box flex="1">
          <Text fontWeight="medium" color={textColor}>
            {title}
          </Text>
          <Text fontSize="sm" color={textSecondary} mt={1}>
            {description}
          </Text>
        </Box>
        <Box ml={4}>{children}</Box>
      </Flex>
      {showDivider && <Box h="1px" bg={borderColor} />}
    </>
  );

  return (
    <Box minH="100vh" py={16}>
      <MouseFollower />
      <Container maxW="4xl">
        <Heading size="2xl" mb={12} color={textColor}>
          Settings
        </Heading>

        <VStack align="stretch" spacing={8}>
          {/* App Preferences */}
          <SettingSection title="App Preferences">
            <SettingRow
              title="Language"
              description="Choose your preferred language for the app interface."
            >
              <HStack color={textColor} cursor="pointer">
                <Text>English</Text>
                <Icon as={ChevronRightIcon} color={textSecondary} />
              </HStack>
            </SettingRow>
            <SettingRow
              title="Currency"
              description="Select your preferred currency for displaying amounts."
              showDivider={false}
            >
              <HStack color={textColor} cursor="pointer">
                <Text>USD</Text>
                <Icon as={ChevronRightIcon} color={textSecondary} />
              </HStack>
            </SettingRow>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications">
            <SettingRow
              title="Campaign Updates"
              description="Receive notifications for campaign updates and milestones."
            >
              <Switch
                isChecked={notifications.campaignUpdates}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    campaignUpdates: e.target.checked,
                  })
                }
                colorScheme="pink"
                size="lg"
              />
            </SettingRow>
            <SettingRow
              title="New Campaigns"
              description="Get notified about new campaigns and trending projects."
            >
              <Switch
                isChecked={notifications.newCampaigns}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    newCampaigns: e.target.checked,
                  })
                }
                colorScheme="pink"
                size="lg"
              />
            </SettingRow>
            <SettingRow
              title="Contributions & Rewards"
              description="Receive alerts for contributions and rewards."
              showDivider={false}
            >
              <Switch
                isChecked={notifications.contributions}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    contributions: e.target.checked,
                  })
                }
                colorScheme="pink"
                size="lg"
              />
            </SettingRow>
          </SettingSection>

          {/* Privacy */}
          <SettingSection title="Privacy">
            <SettingRow
              title="Profile Visibility"
              description="Control who can view your profile and activity."
            >
              <HStack color={textColor} cursor="pointer">
                <Text>Public</Text>
                <Icon as={ChevronRightIcon} color={textSecondary} />
              </HStack>
            </SettingRow>
            <SettingRow
              title="Data Management"
              description="Manage your data and privacy settings."
              showDivider={false}
            >
              <Button
                size="sm"
                bg="pink.500"
                color="white"
                opacity={0.2}
                _hover={{ bg: 'pink.600', opacity: 0.3 }}
              >
                Manage
              </Button>
            </SettingRow>
          </SettingSection>

          {/* Security */}
          <SettingSection title="Security">
            <SettingRow
              title="Change Password"
              description="Change your password to keep your account secure."
            >
              <Button
                size="sm"
                bg="pink.500"
                color="white"
                opacity={0.2}
                _hover={{ bg: 'pink.600', opacity: 0.3 }}
              >
                Change
              </Button>
            </SettingRow>
            <SettingRow
              title="Two-Factor Authentication"
              description="Enable two-factor authentication for added security."
              showDivider={false}
            >
              <Switch
                isChecked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                colorScheme="pink"
                size="lg"
              />
            </SettingRow>
          </SettingSection>

          {/* About */}
          <SettingSection title="About">
            <SettingRow
              title="Terms & Privacy"
              description="View the terms of service and privacy policy."
            >
              <Button
                size="sm"
                bg="pink.500"
                color="white"
                opacity={0.2}
                _hover={{ bg: 'pink.600', opacity: 0.3 }}
              >
                View
              </Button>
            </SettingRow>
            <SettingRow
              title="About DotNation"
              description="Learn more about the DotNation platform."
              showDivider={false}
            >
              <Button
                size="sm"
                bg="pink.500"
                color="white"
                opacity={0.2}
                _hover={{ bg: 'pink.600', opacity: 0.3 }}
              >
                Learn More
              </Button>
            </SettingRow>
          </SettingSection>
        </VStack>
      </Container>
    </Box>
  );
};

export default SettingsPage;
