const NewSettingsPage = () => {
  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="mb-12 text-4xl font-bold tracking-tighter text-white font-display">Settings</h1>
      
      <div className="space-y-12">
        {/* App Preferences */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-white font-display">App Preferences</h2>
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 glassmorphism">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Language</h3>
                <p className="text-sm text-white/50">Choose your preferred language for the app interface.</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span>English</span>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="h-px bg-white/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Currency</h3>
                <p className="text-sm text-white/50">Select your preferred currency for displaying amounts.</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span>USD</span>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-white font-display">Notifications</h2>
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 glassmorphism">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Campaign Updates</h3>
                <p className="text-sm text-white/50">Receive notifications for campaign updates and milestones.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="h-px bg-white/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Donation Confirmations</h3>
                <p className="text-sm text-white/50">Get notified when your donations are confirmed on-chain.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="h-px bg-white/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Marketing Emails</h3>
                <p className="text-sm text-white/50">Receive updates about new features and platform news.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-white font-display">Privacy & Security</h2>
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 glassmorphism">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Profile Visibility</h3>
                <p className="text-sm text-white/50">Control who can see your campaign and donation history.</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span>Public</span>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="h-px bg-white/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-white/50">Add an extra layer of security to your wallet connection.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                Enable
              </button>
            </div>
          </div>
        </section>

        {/* Network Settings */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-white font-display">Network Settings</h2>
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 glassmorphism">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Connected Network</h3>
                <p className="text-sm text-white/50">Currently connected to Polkadot network.</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Polkadot</span>
              </div>
            </div>
            
            <div className="h-px bg-white/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">RPC Endpoint</h3>
                <p className="text-sm text-white/50 font-mono">ws://127.0.0.1:9944</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                Change
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-red-400 font-display">Danger Zone</h2>
          <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-6 glassmorphism">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Clear Cache</h3>
                <p className="text-sm text-white/50">Remove all cached data and refresh from blockchain.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                Clear
              </button>
            </div>
            
            <div className="h-px bg-red-500/10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-400">Disconnect Wallet</h3>
                <p className="text-sm text-white/50">Disconnect your current wallet from the application.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors">
                Disconnect
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewSettingsPage;
