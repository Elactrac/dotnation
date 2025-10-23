import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';
import { useWallet } from '../contexts/WalletContext.jsx';
import CampaignCard from '../components/CampaignCard';
import { formatDotBalance, getCampaignStatus } from '../utils/formatters';
import useCountUp from '../utils/useCountUp';

// A component for the animated numbers
const AnimatedStat = ({ value, label }) => {
    const [count, ref] = useCountUp(value);
    return (
        <div className="stat-card" ref={ref}>
            <h3>{label}</h3>
            <p>{label.includes('Raised') ? formatDotBalance(count) : count}</p>
        </div>
    );
};

AnimatedStat.propTypes = {
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
};

const CampaignStatusChart = ({ stats }) => {
    const maxStat = Math.max(...Object.values(stats));
    const chartData = [
        { label: 'Active', value: stats.Active, color: 'var(--success-color)' },
        { label: 'Successful', value: stats.Successful, color: 'var(--secondary-accent)' },
        { label: 'Ending Soon', value: stats.EndingSoon, color: 'var(--warning-color)' },
        { label: 'Failed', value: stats.Failed, color: 'var(--failed-color)' },
    ];

    return (
        <div className="stat-card">
            <h3>Campaign Status</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {chartData.map(item => (
                    <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary-text)' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                                <div style={{ 
                                    width: `${(item.value / maxStat) * 100}%`, 
                                    background: item.color, 
                                    height: '12px', 
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease-in-out'
                                }}></div>
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

CampaignStatusChart.propTypes = {
    stats: PropTypes.shape({
        Active: PropTypes.number,
        Successful: PropTypes.number,
        EndingSoon: PropTypes.number,
        Failed: PropTypes.number,
    }).isRequired,
};

const PlatformActivity = ({ campaigns }) => {
    const recentCampaigns = [...campaigns].sort((a, b) => b.id - a.id).slice(0, 3);

    return (
        <div className="stat-card">
            <h3>Recent Platform Activity</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentCampaigns.map(c => (
                    <div key={c.id} style={{ fontSize: '0.9rem', borderLeft: '2px solid var(--primary-accent)', paddingLeft: '1rem' }}>
                        A new campaign, <Link to={`/dashboard/campaign/${c.id}`} style={{ color: 'var(--secondary-accent)', fontWeight: 'bold' }}>{c.title}</Link>, was just created.
                    </div>
                ))}
            </div>
        </div>
    );
};

PlatformActivity.propTypes = {
    campaigns: PropTypes.array.isRequired,
};

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
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <main className="container">
            <div className="dashboard-header">
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary-text)', fontWeight: 500 }}>
                        Welcome back, {selectedAccount?.meta.name || 'Creator'}!
                    </h2>
                    <h1>Creator Dashboard</h1>
                </div>
                <Link to="/dashboard/create-campaign" className="btn-primary">+ Create New Campaign</Link>
            </div>

            <section className="mission-control">
                <AnimatedStat value={missionControlStats.totalRaised} label="Total Raised (DOT)" />
                <AnimatedStat value={missionControlStats.uniqueDonors} label="Total Donors" />
                <AnimatedStat value={userCampaigns.length} label="Your Campaigns" />
                <div className="stat-card" style={{ borderColor: 'var(--warning-color)' }}>
                    <h3>Attention Needed</h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--warning-color)' }}>
                        {missionControlStats.endingSoon} Campaign{missionControlStats.endingSoon !== 1 && 's'} Ending Soon
                    </p>
                </div>
            </section>

            <section className="mission-control" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <CampaignStatusChart stats={campaignStatusStats} />
                <PlatformActivity campaigns={campaigns} />
            </section>

            <section className="campaign-list">
                <h2>My Campaigns</h2>
                {userCampaigns.length > 0 ? (
                    userCampaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'var(--card-bg)', borderRadius: '12px' }}>
                        <h3>You haven&apos;t created any campaigns yet.</h3>
                        <p style={{ marginTop: '0.5rem', color: 'var(--secondary-text)' }}>Get started by creating a new one!</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default CampaignsListPage;
