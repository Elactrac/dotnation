import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import CampaignCard from '../components/CampaignCard';
import { formatDotBalance, getCampaignStatus } from '../utils/formatters';

const CampaignsListPage = () => {
    const { campaigns, isLoading, error } = useCampaign();
    const { selectedAccount } = useWallet();

    const userCampaigns = useMemo(() => {
        if (!selectedAccount) return [];
        return campaigns.filter(c => c.owner === selectedAccount.address);
    }, [campaigns, selectedAccount]);

    const missionControlStats = useMemo(() => {
        const totalRaised = userCampaigns.reduce((acc, c) => acc + BigInt(c.raised), 0n);
        const uniqueDonors = new Set(userCampaigns.flatMap(c => c.donations?.map(d => d.donor) || [])).size;
        const endingSoon = userCampaigns.filter(c => getCampaignStatus(c).className === 'status-ending-soon').length;
        return { totalRaised: Number(totalRaised), uniqueDonors, endingSoon };
    }, [userCampaigns]);

    const campaignStatusStats = useMemo(() => {
        const stats = { Active: 0, Successful: 0, Failed: 0, EndingSoon: 0 };
        userCampaigns.forEach(c => {
            const status = getCampaignStatus(c);
            if (status.className === 'status-ending-soon') stats.EndingSoon++;
            else if (status.text in stats) stats[status.text]++;
        });
        return stats;
    }, [userCampaigns]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-white/60">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
                        <p className="text-white/60">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-white">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px] opacity-10"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px] opacity-10"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-start mb-12 flex-wrap gap-4">
                    <div>
                        <h2 className="text-lg text-white/60 font-medium mb-2">
                            Welcome back, {selectedAccount?.meta.name || 'Creator'}!
                        </h2>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Creator Dashboard</h1>
                    </div>
                    <Link to="/create-campaign" className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        + Create New Campaign
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                        <h3 className="text-sm font-medium text-white/60 mb-2">Total Raised (DOT)</h3>
                        <p className="text-3xl font-bold text-white">{formatDotBalance(missionControlStats.totalRaised)}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                        <h3 className="text-sm font-medium text-white/60 mb-2">Total Donors</h3>
                        <p className="text-3xl font-bold text-white">{missionControlStats.uniqueDonors}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                        <h3 className="text-sm font-medium text-white/60 mb-2">Your Campaigns</h3>
                        <p className="text-3xl font-bold text-white">{userCampaigns.length}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                        <h3 className="text-sm font-medium text-white/60 mb-2">Attention Needed</h3>
                        <p className="text-3xl font-bold text-white">
                            {missionControlStats.endingSoon}
                        </p>
                        <p className="text-sm text-white/60 mt-1">Campaign{missionControlStats.endingSoon !== 1 && 's'} Ending Soon</p>
                    </div>
                </div>

                {/* Campaign Status & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Campaign Status</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Active', value: campaignStatusStats.Active, color: '#A7F3D0' },
                                { label: 'Successful', value: campaignStatusStats.Successful, color: '#FFFFFF' },
                                { label: 'Ending Soon', value: campaignStatusStats.EndingSoon, color: '#FDE68A' },
                                { label: 'Failed', value: campaignStatusStats.Failed, color: '#FECACA' },
                            ].map(item => {
                                const maxStat = Math.max(...Object.values(campaignStatusStats));
                                return (
                                    <div key={item.label} className="grid grid-cols-[100px_1fr] items-center gap-4">
                                        <span className="text-sm text-white/60">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-white/10 rounded-full h-3">
                                                <div 
                                                    className="h-3 rounded-full transition-all duration-500" 
                                                    style={{ 
                                                        width: `${(item.value / maxStat) * 100}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-white min-w-[2rem]">{item.value}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Recent Platform Activity</h3>
                        <div className="space-y-3">
                            {[...campaigns].sort((a, b) => b.id - a.id).slice(0, 3).map(c => (
                                <div key={c.id} className="text-sm border-l-2 border-white/20 pl-4 py-2 hover:border-white/40 transition-colors">
                                    A new campaign, <Link to={`/campaign/${c.id}`} className="text-white font-semibold hover:underline">{c.title}</Link>, was just created.
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* My Campaigns Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">My Campaigns</h2>
                    {userCampaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userCampaigns.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-2">You haven&apos;t created any campaigns yet.</h3>
                            <p className="text-white/60 mb-6">Get started by creating a new one!</p>
                            <Link to="/create-campaign" className="inline-block px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                Create Your First Campaign
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CampaignsListPage;
