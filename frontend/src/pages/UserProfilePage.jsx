import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { formatDOT, shortenAddress } from '../utils/formatters';

const UserProfilePage = () => {
  const { selectedAccount, balance } = useWallet();
  const { campaigns } = useCampaign();

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
  const [activeTab, setActiveTab] = useState('contributions');

  // Mock contributions data
  const contributions = [
    { project: 'DeFi For Good', amount: '500 DOT', date: '2024-01-15', status: 'Completed' },
    { project: 'Ocean Cleanup DAO', amount: '250 DOT', date: '2024-02-20', status: 'Completed' },
    { project: 'Open Source Education', amount: '100 DOT', date: '2024-03-25', status: 'Completed' },
    { project: 'Community Garden', amount: '75 DOT', date: '2024-04-10', status: 'Active' },
  ];

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!selectedAccount || !campaigns) return null;

    const myCampaigns = campaigns.filter(c => c.owner === selectedAccount.address);
    const totalRaised = myCampaigns.reduce((sum, c) => sum + (c.raised || 0n), 0n);
    const totalGoal = myCampaigns.reduce((sum, c) => sum + (c.goal || 0n), 0n);
    const successfulCampaigns = myCampaigns.filter(c => c.state === 'Successful').length;
    const activeCampaigns = myCampaigns.filter(c => c.state === 'Active').length;

    // Mock donation stats
    const totalDonated = 925n * 1000000000000n; // 925 DOT
    const campaignsSupported = 4;

    return {
      campaignsCreated: myCampaigns.length,
      totalRaised,
      totalGoal,
      successfulCampaigns,
      activeCampaigns,
      successRate: myCampaigns.length > 0 ? (successfulCampaigns / myCampaigns.length) * 100 : 0,
      totalDonated,
      campaignsSupported,
      accountAge: 45,
      reputation: 4.8
    };
  }, [selectedAccount, campaigns]);

  // Load profile data
  useEffect(() => {
    if (selectedAccount) {
      const mockProfile = {
        displayName: `User ${shortenAddress(selectedAccount.address)}`,
        bio: 'Passionate about supporting innovative projects and making a positive impact in the Polkadot ecosystem.',
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border-2 border-orange-500/30 p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold font-display text-gray-100 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-300 font-body">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
          My Profile
        </h1>
        <p className="text-lg md:text-xl text-gray-300 font-body">
          Manage your account and view your impact on the ecosystem
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-gray-700 p-8 mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold font-display text-white ring-4 ring-primary/30">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-gray-900">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold font-display text-gray-100 mb-2">{profile.displayName}</h2>
            <p className="text-sm font-mono text-gray-400 mb-3 bg-gray-800/50 inline-block px-3 py-1 rounded-lg border border-gray-700">
              {shortenAddress(selectedAccount.address)}
            </p>
            {profile.bio && (
              <p className="text-gray-300 font-body mb-4">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full text-sm font-body text-green-400">
                <span>⭐</span>
                <span>{userStats?.reputation}/5 Reputation</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full text-sm font-body text-blue-400">
                <span>📅</span>
                <span>{userStats?.accountAge} days active</span>
              </span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400 font-body mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold font-display text-green-400">
              {balance ? formatDOT(BigInt(balance) * 1000000000000n) : '0'} DOT
            </p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium"
            >
              {isEditing ? '✏️ Editing...' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-primary/50 transition-all duration-300">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-2">
            Campaigns Created
          </p>
          <p className="text-4xl font-bold font-display text-primary mb-1">
            {userStats?.campaignsCreated || 0}
          </p>
          <p className="text-sm text-gray-400 font-body">
            {userStats?.activeCampaigns || 0} active
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-green-500/50 transition-all duration-300">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-2">
            Total Raised
          </p>
          <p className="text-4xl font-bold font-display text-green-400 mb-1">
            {formatDOT(userStats?.totalRaised || 0n)}
          </p>
          <p className="text-sm text-gray-400 font-body">
            DOT from campaigns
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-purple-500/50 transition-all duration-300">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-2">
            Success Rate
          </p>
          <p className="text-4xl font-bold font-display text-purple-400 mb-1">
            {userStats?.successRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400 font-body">
            {userStats?.successfulCampaigns || 0} successful
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 p-6 hover:border-secondary/50 transition-all duration-300">
          <p className="text-sm font-bold font-display text-gray-400 uppercase tracking-wider mb-2">
            Total Donated
          </p>
          <p className="text-4xl font-bold font-display text-secondary mb-1">
            {formatDOT(userStats?.totalDonated || 0n)}
          </p>
          <p className="text-sm text-gray-400 font-body">
            to {userStats?.campaignsSupported || 0} campaigns
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-gray-700 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-700">
          <nav className="flex gap-8 px-8">
            <button
              onClick={() => setActiveTab('contributions')}
              className={`py-4 px-1 border-b-2 transition-colors font-body font-medium ${
                activeTab === 'contributions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              📊 Contributions
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 transition-colors font-body font-medium ${
                activeTab === 'projects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              🚀 My Projects
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 transition-colors font-body font-medium ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Contributions Tab */}
          {activeTab === 'contributions' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold font-display text-gray-100 mb-6">Your Contributions</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-6 text-xs font-bold font-display text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold font-display text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold font-display text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold font-display text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {contributions.map((contrib, index) => (
                      <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-body font-medium text-gray-100">
                          {contrib.project}
                        </td>
                        <td className="py-4 px-6 text-sm font-body text-primary font-bold">
                          {contrib.amount}
                        </td>
                        <td className="py-4 px-6 text-sm font-body text-gray-400">
                          {new Date(contrib.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium ${
                            contrib.status === 'Completed' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {contrib.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold font-display text-gray-100 mb-6">Your Campaigns</h3>
              
              {campaigns?.filter(c => c.owner === selectedAccount.address).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.filter(c => c.owner === selectedAccount.address).map((campaign, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-primary/50 transition-all">
                      <h4 className="text-xl font-bold font-display text-gray-100 mb-2">{campaign.title}</h4>
                      <p className="text-sm text-gray-400 font-body mb-4 line-clamp-2">{campaign.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-body font-bold">{formatDOT(campaign.raised || 0n)} DOT</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${
                          campaign.state === 'Active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {campaign.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400 font-body mb-6">You haven't created any campaigns yet</p>
                  <a
                    href="/dashboard/create-campaign"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200"
                  >
                    Create Your First Campaign
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold font-display text-gray-100 mb-6">Profile Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold font-display text-gray-100 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold font-display text-gray-100 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold font-display text-gray-100 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-gray-100 font-body placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none disabled:opacity-50"
                    />
                  </div>

                  {isEditing && (
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200 disabled:opacity-50"
                    >
                      {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-700"></div>

              <div>
                <h3 className="text-2xl font-bold font-display text-gray-100 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 font-body font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400 font-body">Receive email updates about your campaigns and donations</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('emailNotifications', !profile.emailNotifications)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profile.emailNotifications ? 'bg-primary' : 'bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profile.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-gray-700"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 font-body font-medium">Campaign Updates</p>
                      <p className="text-sm text-gray-400 font-body">Get notified when your campaigns receive donations</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('campaignUpdates', !profile.campaignUpdates)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profile.campaignUpdates ? 'bg-primary' : 'bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profile.campaignUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-gray-700"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 font-body font-medium">Donation Alerts</p>
                      <p className="text-sm text-gray-400 font-body">Receive notifications for successful donations</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('donationAlerts', !profile.donationAlerts)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profile.donationAlerts ? 'bg-primary' : 'bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profile.donationAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
