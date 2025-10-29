import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiChevronRight, FiGlobe, FiDollarSign, FiBell, FiLock, FiShield, FiInfo } from 'react-icons/fi';
import MouseFollower from '../components/MouseFollower.jsx';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    newCampaigns: false,
    contributions: true,
  });

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display text-gray-100">
          {title}
        </h2>
      </div>
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );

  SettingSection.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    children: PropTypes.node.isRequired,
  };

  const SettingRow = ({ title, description, children, showDivider = true }) => (
    <div>
      <div className="flex justify-between items-center p-6 hover:bg-gray-800/30 transition-colors duration-200">
        <div className="flex-1 pr-4">
          <p className="font-medium font-body text-gray-100 mb-1">
            {title}
          </p>
          <p className="text-sm text-gray-400 font-body">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0">
          {children}
        </div>
      </div>
      {showDivider && <div className="h-px bg-gray-700 mx-6" />}
    </div>
  );

  SettingRow.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    showDivider: PropTypes.bool,
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 ${
        checked ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  ToggleSwitch.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  return (
    <div className="min-h-screen py-12">
      <MouseFollower />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-body">
            Customize your DotNation experience
          </p>
        </div>

        <div className="space-y-8">
          {/* App Preferences */}
          <SettingSection title="App Preferences" icon={FiGlobe}>
            <SettingRow
              title="Language"
              description="Choose your preferred language for the app interface."
            >
              <button className="flex items-center gap-2 text-gray-100 hover:text-primary transition-colors font-body">
                <span>English</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </SettingRow>
            <SettingRow
              title="Currency"
              description="Select your preferred currency for displaying amounts."
              showDivider={false}
            >
              <button className="flex items-center gap-2 text-gray-100 hover:text-primary transition-colors font-body">
                <FiDollarSign className="w-4 h-4" />
                <span>USD</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </SettingRow>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications" icon={FiBell}>
            <SettingRow
              title="Campaign Updates"
              description="Receive notifications for campaign updates and milestones."
            >
              <ToggleSwitch
                checked={notifications.campaignUpdates}
                onChange={(value) =>
                  setNotifications({
                    ...notifications,
                    campaignUpdates: value,
                  })
                }
              />
            </SettingRow>
            <SettingRow
              title="New Campaigns"
              description="Get notified about new campaigns and trending projects."
            >
              <ToggleSwitch
                checked={notifications.newCampaigns}
                onChange={(value) =>
                  setNotifications({
                    ...notifications,
                    newCampaigns: value,
                  })
                }
              />
            </SettingRow>
            <SettingRow
              title="Contributions & Rewards"
              description="Receive alerts for contributions and rewards."
              showDivider={false}
            >
              <ToggleSwitch
                checked={notifications.contributions}
                onChange={(value) =>
                  setNotifications({
                    ...notifications,
                    contributions: value,
                  })
                }
              />
            </SettingRow>
          </SettingSection>

          {/* Privacy */}
          <SettingSection title="Privacy" icon={FiLock}>
            <SettingRow
              title="Profile Visibility"
              description="Control who can view your profile and activity."
            >
              <button className="flex items-center gap-2 text-gray-100 hover:text-primary transition-colors font-body">
                <span>Public</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </SettingRow>
            <SettingRow
              title="Data Management"
              description="Manage your data and privacy settings."
              showDivider={false}
            >
              <button className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium">
                Manage
              </button>
            </SettingRow>
          </SettingSection>

          {/* Security */}
          <SettingSection title="Security" icon={FiShield}>
            <SettingRow
              title="Change Password"
              description="Change your password to keep your account secure."
            >
              <button className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium">
                Change
              </button>
            </SettingRow>
            <SettingRow
              title="Two-Factor Authentication"
              description="Enable two-factor authentication for added security."
              showDivider={false}
            >
              <ToggleSwitch
                checked={twoFactorAuth}
                onChange={setTwoFactorAuth}
              />
            </SettingRow>
          </SettingSection>

          {/* About */}
          <SettingSection title="About" icon={FiInfo}>
            <SettingRow
              title="Terms & Privacy"
              description="View the terms of service and privacy policy."
            >
              <button className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium">
                View
              </button>
            </SettingRow>
            <SettingRow
              title="About DotNation"
              description="Learn more about the DotNation platform."
              showDivider={false}
            >
              <button className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 rounded-xl transition-all duration-200 font-body font-medium">
                Learn More
              </button>
            </SettingRow>
          </SettingSection>

          {/* Danger Zone */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-display text-red-400">
                Danger Zone
              </h2>
            </div>
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl rounded-2xl border-2 border-red-500/30 p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-4">
                  <p className="font-medium font-body text-gray-100 mb-1">
                    Delete Account
                  </p>
                  <p className="text-sm text-gray-400 font-body">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200 font-body font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
