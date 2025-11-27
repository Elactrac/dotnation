import { useEffect, useState } from 'react';
import { useNft } from '../contexts/NftContext';
import { useWallet } from '../contexts/WalletContext';
import { formatBalance } from '../utils/formatters';

const LeaderboardPage = () => {
  const { getLeaderboard, getTotalDonated, nftEnabled } = useNft();
  const { selectedAccount } = useWallet();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'nftCount'

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(100); // Get top 100
        setLeaderboard(data);

        // Find user's rank if they're in the leaderboard
        if (selectedAccount) {
          const totalDonated = await getTotalDonated();
          const userIndex = data.findIndex(
            entry => entry.address.toLowerCase() === selectedAccount.address.toLowerCase()
          );
          
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
            setUserStats(data[userIndex]);
          } else {
            setUserStats({ totalDonated, nftCount: 0 });
          }
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (nftEnabled) {
      loadLeaderboard();
    }
  }, [nftEnabled, selectedAccount, getLeaderboard, getTotalDonated]);

  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'amount') {
      return b.totalDonated - a.totalDonated;
    } else {
      return b.nftCount - a.nftCount;
    }
  });

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return {
        icon: '🥇',
        color: 'from-yellow-400 to-yellow-600',
        label: '1st Place'
      };
    } else if (rank === 2) {
      return {
        icon: '🥈',
        color: 'from-gray-300 to-gray-500',
        label: '2nd Place'
      };
    } else if (rank === 3) {
      return {
        icon: '🥉',
        color: 'from-orange-400 to-orange-600',
        label: '3rd Place'
      };
    } else if (rank <= 10) {
      return {
        icon: '⭐',
        color: 'from-purple-400 to-pink-500',
        label: `${rank}th Place`
      };
    } else {
      return {
        icon: '🏅',
        color: 'from-blue-400 to-indigo-500',
        label: `${rank}th Place`
      };
    }
  };

  if (!nftEnabled) {
    return (
      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-border">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Leaderboard Not Available</h2>
            <p className="text-text-secondary">The leaderboard feature is currently disabled. Please check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-dark py-12 px-4">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Donor Leaderboard
          </h1>
          <p className="text-xl text-text-secondary">
            Top contributors to the DotNation platform
          </p>
        </div>

        {/* User Stats Card - Show if user is logged in */}
        {selectedAccount && userStats && (
          <div className="mb-8 bg-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Your Stats</h3>
                <p className="text-text-secondary text-sm font-mono">{truncateAddress(selectedAccount.address)}</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{userStats.totalDonated ? formatBalance(userStats.totalDonated) : '0'}</div>
                  <div className="text-xs text-text-muted">Total Donated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{userStats.nftCount || 0}</div>
                  <div className="text-xs text-text-muted">NFTs Collected</div>
                </div>
                {userRank && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">#{userRank}</div>
                    <div className="text-xs text-text-muted">Your Rank</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="mb-6 flex justify-end">
          <div className="bg-surface/50 backdrop-blur-xl rounded-lg p-1 inline-flex gap-1 border border-border">
            <button
              onClick={() => setSortBy('amount')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                sortBy === 'amount'
                  ? 'bg-white text-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              By Amount
            </button>
            <button
              onClick={() => setSortBy('nftCount')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                sortBy === 'nftCount'
                  ? 'bg-white text-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              By NFT Count
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-surface/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-text-primary">Loading leaderboard...</p>
            </div>
          ) : sortedLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-text-muted mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-text-primary mb-2">No Data Yet</h3>
              <p className="text-text-secondary">Be the first to make a donation!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Address</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Total Donated</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">NFT Count</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary">Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const badge = getRankBadge(rank);
                    const isCurrentUser = selectedAccount && 
                      entry.address.toLowerCase() === selectedAccount.address.toLowerCase();

                    return (
                      <tr
                        key={entry.address}
                        className={`border-b border-border/50 hover:bg-surface/50 transition-colors ${
                          isCurrentUser ? 'bg-primary/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{badge.icon}</span>
                            <span className={`font-bold ${rank <= 3 ? 'text-xl' : 'text-lg'} ${
                              rank === 1 ? 'text-yellow-400' :
                              rank === 2 ? 'text-gray-300' :
                              rank === 3 ? 'text-orange-400' :
                              'text-text-primary'
                            }`}>
                              {rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-text-primary">
                              {truncateAddress(entry.address)}
                            </span>
                            {isCurrentUser && (
                              <span className="bg-primary/20 text-text-primary px-2 py-1 rounded text-xs font-semibold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-text-primary font-semibold">
                            {formatBalance(entry.totalDonated)} DOT
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-text-primary font-semibold">
                            {entry.nftCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rank <= 10 && (
                            <div className={`inline-block bg-primary/10 text-text-primary px-3 py-1 rounded-full text-xs font-semibold border border-border`}>
                              Top {rank <= 3 ? rank : 10}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-surface/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-text-secondary text-sm leading-relaxed">
              The leaderboard updates in real-time and displays the top donors on the DotNation platform. 
              Make donations to climb the ranks and earn exclusive achievements!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
