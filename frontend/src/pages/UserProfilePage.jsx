import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Flex,
  Alert,
  AlertIcon,
  Button,
  Avatar,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Divider
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import {
  FiUser,
  FiTrendingUp,
  FiHeart,
  FiSettings,
  FiSave,
  FiEdit,
  FiAward,
  FiTarget,
  FiUsers,
  FiCalendar
} from 'react-icons/fi';
import { useWallet } from '../contexts/WalletContext';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { formatDOT, shortenAddress } from '../utils/formatters';
import PageErrorBoundary from '../components/PageErrorBoundary';

const UserProfilePage = () => {
  const { selectedAccount, balance } = useWallet();
  const { campaigns } = useCampaign();
  const toast = useToast();

  // Profile state
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    avatar: null,
    emailNotifications: true,
    campaignUpdates: true,
    donationAlerts: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);



  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!selectedAccount || !campaigns) return null;

    const myCampaigns = campaigns.filter(c => c.owner === selectedAccount.address);
    const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raised, 0n);
    const totalGoal = myCampaigns.reduce((sum, c) => sum + c.goal, 0n);
    const successfulCampaigns = myCampaigns.filter(c => c.state === 'Successful').length;
    const activeCampaigns = myCampaigns.filter(c => c.state === 'Active').length;

    // Mock donation stats (in real app, this would come from API)
    const totalDonated = 5000000000000n; // 5 DOT
    const campaignsSupported = 3;

    return {
      campaignsCreated: myCampaigns.length,
      totalRaised,
      totalGoal,
      successfulCampaigns,
      activeCampaigns,
      successRate: myCampaigns.length > 0 ? (successfulCampaigns / myCampaigns.length) * 100 : 0,
      totalDonated,
      campaignsSupported,
      accountAge: 45, // days since first transaction
      reputation: 4.8 // out of 5
    };
  }, [selectedAccount, campaigns]);

  // Load profile data (mock implementation)
  useEffect(() => {
    if (selectedAccount) {
      // In a real app, this would fetch from API
      const mockProfile = {
        displayName: `User ${shortenAddress(selectedAccount.address)}`,
        bio: 'Passionate about supporting innovative projects and making a positive impact in the community.',
        website: '',
        twitter: '',
        avatar: null,
        emailNotifications: true,
        campaignUpdates: true,
        donationAlerts: false
      };
      setProfile(mockProfile);
    }
  }, [selectedAccount]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!selectedAccount) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Wallet Not Connected</Text>
            <Text>Please connect your wallet to view your profile.</Text>
          </VStack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack align="start" spacing={1}>
          <Heading size="xl">My Profile</Heading>
          <Text color="white">
            Manage your account settings and view your impact
          </Text>
        </VStack>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><Icon as={FiUser} mr={2} />Overview</Tab>
            <Tab><Icon as={FiSettings} mr={2} />Settings</Tab>
            <Tab><Icon as={FiAward} mr={2} />Achievements</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Profile Header */}
                <Card>
                  <CardBody>
                    <Flex align="center" gap={6} wrap="wrap">
                      <Avatar
                        size="xl"
                        name={profile.displayName}
                        src={profile.avatar}
                        bg="blue.500"
                      />
                      <VStack align="start" spacing={2} flex={1} minW="200px">
                        <Heading size="lg">{profile.displayName}</Heading>
                        <Text color="gray.600" fontFamily="mono" fontSize="sm">
                          {shortenAddress(selectedAccount.address)}
                        </Text>
                        {profile.bio && (
                          <Text color="gray.700">{profile.bio}</Text>
                        )}
                        <HStack>
                          <Badge colorScheme="green" variant="subtle">
                            <Icon as={FiAward} mr={1} />
                            {userStats?.reputation}/5 Reputation
                          </Badge>
                          <Badge colorScheme="blue" variant="subtle">
                            <Icon as={FiCalendar} mr={1} />
                            {userStats?.accountAge} days active
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack align="end">
                        <Text fontSize="sm" color="gray.600">Wallet Balance</Text>
                        <Text fontSize="xl" fontWeight="bold" color="green.500">
                          {balance ? formatDOT(BigInt(balance) * 1000000000000n) : '0'} DOT
                        </Text>
                      </VStack>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Statistics Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Campaigns Created</StatLabel>
                        <StatNumber color="blue.500">{userStats?.campaignsCreated || 0}</StatNumber>
                        <StatHelpText>
                          {userStats?.activeCampaigns || 0} active
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Raised</StatLabel>
                        <StatNumber color="green.500">
                          {formatDOT(userStats?.totalRaised || 0n)} DOT
                        </StatNumber>
                        <StatHelpText>
                          from {userStats?.campaignsCreated || 0} campaigns
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Success Rate</StatLabel>
                        <StatNumber color="purple.500">
                          {userStats?.successRate.toFixed(1)}%
                        </StatNumber>
                        <StatHelpText>
                          {userStats?.successfulCampaigns || 0} successful
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Donations Made</StatLabel>
                        <StatNumber color="orange.500">
                          {formatDOT(userStats?.totalDonated || 0n)} DOT
                        </StatNumber>
                        <StatHelpText>
                          to {userStats?.campaignsSupported || 0} campaigns
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Recent Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiTrendingUp} color="blue.500" />
                          <Text>Created campaign "Community Garden Project"</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">2 days ago</Text>
                      </HStack>

                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiHeart} color="red.500" />
                          <Text>Donated to "Education for All"</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">1 week ago</Text>
                      </HStack>

                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiTarget} color="green.500" />
                          <Text>Campaign "Tech Startup" reached goal</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">2 weeks ago</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Profile Information</Heading>
                      <Button
                        leftIcon={<Icon as={isEditing ? FiSave : FiEdit} />}
                        colorScheme={isEditing ? 'green' : 'blue'}
                        variant={isEditing ? 'solid' : 'outline'}
                        onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                        isLoading={isSaving}
                        loadingText="Saving..."
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Display Name</FormLabel>
                        <Input
                          value={profile.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Website</FormLabel>
                        <Input
                          value={profile.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                          isDisabled={!isEditing}
                        />
                      </FormControl>

                      <FormControl gridColumn={{ md: 'span 2' }}>
                        <FormLabel>Bio</FormLabel>
                        <Textarea
                          value={profile.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          isDisabled={!isEditing}
                          rows={3}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Notification Preferences</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Email Notifications</Text>
                          <Text fontSize="sm" color="gray.600">
                            Receive email updates about your campaigns and donations
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={profile.emailNotifications}
                          onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                          isDisabled={!isEditing}
                        />
                      </Flex>

                      <Divider />

                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Campaign Updates</Text>
                          <Text fontSize="sm" color="gray.600">
                            Get notified when your campaigns receive donations
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={profile.campaignUpdates}
                          onChange={(e) => handleInputChange('campaignUpdates', e.target.checked)}
                          isDisabled={!isEditing}
                        />
                      </Flex>

                      <Divider />

                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Donation Alerts</Text>
                          <Text fontSize="sm" color="gray.600">
                            Receive notifications for successful donations
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={profile.donationAlerts}
                          onChange={(e) => handleInputChange('donationAlerts', e.target.checked)}
                          isDisabled={!isEditing}
                        />
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Achievements Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Achievements & Badges</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      <Card variant="outline" borderColor="green.200">
                        <CardBody textAlign="center">
                          <Icon as={FiTarget} boxSize={8} color="green.500" mb={2} />
                          <Text fontWeight="bold">First Campaign</Text>
                          <Text fontSize="sm" color="gray.600">Created your first crowdfunding campaign</Text>
                          <Badge colorScheme="green" mt={2}>Earned</Badge>
                        </CardBody>
                      </Card>

                      <Card variant="outline" borderColor="blue.200">
                        <CardBody textAlign="center">
                          <Icon as={FiHeart} boxSize={8} color="blue.500" mb={2} />
                          <Text fontWeight="bold">Generous Donor</Text>
                          <Text fontSize="sm" color="gray.600">Donated to 5+ campaigns</Text>
                          <Badge colorScheme="blue" mt={2}>Earned</Badge>
                        </CardBody>
                      </Card>

                      <Card variant="outline" borderColor="purple.200">
                        <CardBody textAlign="center">
                          <Icon as={FiTrendingUp} boxSize={8} color="purple.500" mb={2} />
                          <Text fontWeight="bold">Campaign Success</Text>
                          <Text fontSize="sm" color="gray.600">Successfully funded a campaign</Text>
                          <Badge colorScheme="gray" mt={2} variant="outline">In Progress</Badge>
                        </CardBody>
                      </Card>

                      <Card variant="outline" borderColor="gray.300" opacity={0.6}>
                        <CardBody textAlign="center">
                          <Icon as={FiAward} boxSize={8} color="gray.500" mb={2} />
                          <Text fontWeight="bold">Top Supporter</Text>
                          <Text fontSize="sm" color="gray.600">Donated $1000+ total</Text>
                          <Badge colorScheme="gray" mt={2} variant="outline">Locked</Badge>
                        </CardBody>
                      </Card>

                      <Card variant="outline" borderColor="gray.300" opacity={0.6}>
                        <CardBody textAlign="center">
                          <Icon as={FiUsers} boxSize={8} color="gray.500" mb={2} />
                          <Text fontWeight="bold">Community Builder</Text>
                          <Text fontSize="sm" color="gray.600">Created 10+ campaigns</Text>
                          <Badge colorScheme="gray" mt={2} variant="outline">Locked</Badge>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Impact Statistics</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      <VStack>
                        <Progress value={75} colorScheme="green" size="lg" width="100%" />
                        <Text fontSize="sm" textAlign="center">
                          75% of your campaigns reach at least 50% funding
                        </Text>
                      </VStack>

                      <VStack>
                        <Progress value={60} colorScheme="blue" size="lg" width="100%" />
                        <Text fontSize="sm" textAlign="center">
                          60% campaign success rate (above average)
                        </Text>
                      </VStack>

                      <VStack>
                        <Progress value={85} colorScheme="purple" size="lg" width="100%" />
                        <Text fontSize="sm" textAlign="center">
                          85% of donations come within first week
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default () => (
  <PageErrorBoundary pageName="User Profile">
    <UserProfilePage />
  </PageErrorBoundary>
);