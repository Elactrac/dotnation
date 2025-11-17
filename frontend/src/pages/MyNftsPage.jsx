import { useEffect, useState } from 'react';
import { useNft } from '../contexts/NftContext';
import { useWallet } from '../contexts/WalletContext';
import { formatBalance } from '../utils/formatters';
import TransferNftModal from '../components/TransferNftModal';
import AchievementsDisplay from '../components/AchievementsDisplay';

const MyNftsPage = () => {
  const { 
    userNfts, 
    loading, 
    fetchUserNfts, 
    getDonationStats, 
    nftEnabled,
    getRarityDistribution,
    getAchievements,
    areTransfersEnabled
  } = useNft();
  const { activeAccount } = useWallet();
  const [stats, setStats] = useState({ totalDonations: 0, totalAmount: 0 });
  const [selectedNft, setSelectedNft] = useState(null);
  const [rarityFilter, setRarityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'rarity', 'amount'
  const [rarityDistribution, setRarityDistribution] = useState({ Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 });
  const [achievements, setAchievements] = useState([]);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [nftToTransfer, setNftToTransfer] = useState(null);
  const [transfersEnabled, setTransfersEnabled] = useState(true);

  const loadStats = async () => {
    const donationStats = await getDonationStats();
    setStats(donationStats);
  };

  const loadRarityDistribution = async () => {
    const distribution = await getRarityDistribution();
    setRarityDistribution(distribution);
  };

  const loadAchievements = async () => {
    const userAchievements = await getAchievements();
    setAchievements(userAchievements);
  };

  const checkTransfersEnabled = async () => {
    const enabled = await areTransfersEnabled();
    setTransfersEnabled(enabled);
  };

  useEffect(() => {
    if (activeAccount && nftEnabled) {
      fetchUserNfts();
      loadStats();
      loadRarityDistribution();
      loadAchievements();
      checkTransfersEnabled();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount, nftEnabled]);

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rarity color mapping
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'from-yellow-400 to-orange-500';
      case 'Epic':
        return 'from-purple-400 to-pink-500';
      case 'Rare':
        return 'from-blue-400 to-indigo-500';
      case 'Uncommon':
        return 'from-green-400 to-teal-500';
      case 'Common':
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  const getRarityValue = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 5;
      case 'Epic': return 4;
      case 'Rare': return 3;
      case 'Uncommon': return 2;
      case 'Common': return 1;
      default: return 0;
    }
  };

  // Filter and sort NFTs
  const filteredAndSortedNfts = userNfts
    .filter(nft => rarityFilter === 'All' || nft.rarity === rarityFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return Number(b.metadata?.timestamp || 0) - Number(a.metadata?.timestamp || 0);
      } else if (sortBy === 'rarity') {
        return getRarityValue(b.rarity) - getRarityValue(a.rarity);
      } else if (sortBy === 'amount') {
        return (b.metadata?.amount || 0) - (a.metadata?.amount || 0);
      }
      return 0;
    });

  const handleTransferClick = (nft) => {
    setNftToTransfer(nft);
    setTransferModalOpen(true);
  };

  const handleTransferClose = () => {
    setTransferModalOpen(false);
    setNftToTransfer(null);
    // Refresh NFTs after transfer
    fetchUserNfts();
    loadStats();
    loadRarityDistribution();
  };

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">Please connect your wallet to view your donation NFT receipts.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!nftEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">NFT Feature Not Available</h2>
            <p className="text-gray-300">The NFT donation receipt feature is currently disabled. Please check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My Donation NFTs
          </h1>
          <p className="text-xl text-gray-300">
            Your collection of donation receipt NFTs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-gray-300 mb-2">Total NFTs</div>
            <div className="text-3xl font-bold text-white">{userNfts.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-gray-300 mb-2">Total Donations</div>
            <div className="text-3xl font-bold text-white">{stats.totalDonations}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-gray-300 mb-2">Total Amount</div>
            <div className="text-3xl font-bold text-white">
              {formatBalance(stats.totalAmount)} PAS
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-gray-300 mb-2">Achievements</div>
            <div className="text-3xl font-bold text-white">{achievements.length}</div>
          </div>
        </div>

        {/* Rarity Distribution */}
        {userNfts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-lg font-bold text-white mb-4 font-display">Rarity Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(rarityDistribution).map(([rarity, count]) => (
                <div key={rarity} className="text-center">
                  <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${getRarityColor(rarity)} text-white font-semibold mb-2`}>
                    {count}
                  </div>
                  <div className="text-sm text-gray-300">{rarity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <AchievementsDisplay achievements={achievements} />
          </div>
        )}

        {/* Filter and Sort Controls */}
        {userNfts.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-semibold">Filter by Rarity:</label>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="All">All</option>
                <option value="Legendary">Legendary</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Common">Common</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-semibold">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="date">Date</option>
                <option value="rarity">Rarity</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading your NFTs...</p>
          </div>
        ) : userNfts.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">No NFTs Yet</h3>
            <p className="text-gray-300 mb-6">
              Make your first donation to receive an NFT receipt!
            </p>
            <a
              href="/browse-campaigns"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Browse Campaigns
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedNfts.map((nft) => {
              const rarityColor = getRarityColor(nft.rarity || 'Common');
              return (
                <div
                  key={nft.tokenId}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all cursor-pointer transform hover:scale-105"
                  onClick={() => setSelectedNft(nft)}
                >
                  {/* NFT Visual */}
                  <div className={`bg-gradient-to-br ${rarityColor} h-48 flex items-center justify-center relative`}>
                    <div className="text-center">
                      <svg
                        className="mx-auto h-20 w-20 text-white opacity-80"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                      </svg>
                      <div className="text-white font-bold text-lg mt-2">
                        #{nft.tokenId}
                      </div>
                    </div>
                    {/* Rarity Badge */}
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white font-semibold">
                      {nft.rarity || 'Common'}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white font-semibold">
                      RECEIPT
                    </div>
                  </div>

                  {/* NFT Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 truncate">
                      {nft.metadata?.campaignTitle || 'Unknown Campaign'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Amount:</span>
                        <span className="font-semibold text-white">
                          {formatBalance(nft.metadata?.amount || 0)} PAS
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Date:</span>
                        <span className="font-semibold text-white">
                          {formatDate(nft.metadata?.timestamp || Date.now())}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Campaign ID:</span>
                        <span className="font-semibold text-white">
                          #{nft.metadata?.campaignId || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NFT Detail Modal */}
        {selectedNft && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNft(null)}
          >
            <div
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-2xl w-full p-8 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white">NFT Details</h2>
                <button
                  onClick={() => setSelectedNft(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl h-64 flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg className="mx-auto h-32 w-32 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  <div className="text-white font-bold text-2xl mt-4">
                    Token #{selectedNft.tokenId}
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-white">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Rarity</div>
                  <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${getRarityColor(selectedNft.rarity || 'Common')} text-white font-semibold`}>
                    {selectedNft.rarity || 'Common'}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Campaign</div>
                  <div className="font-semibold">{selectedNft.metadata?.campaignTitle || 'Unknown'}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Donation Amount</div>
                  <div className="font-semibold">{formatBalance(selectedNft.metadata?.amount || 0)} PAS</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Date</div>
                  <div className="font-semibold">{formatDate(selectedNft.metadata?.timestamp || Date.now())}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Campaign ID</div>
                  <div className="font-semibold">#{selectedNft.metadata?.campaignId || 0}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-1">Donor Address</div>
                  <div className="font-mono text-xs break-all">{selectedNft.metadata?.donor || activeAccount?.address}</div>
                </div>
                {selectedNft.metadata?.transferCount > 0 && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-gray-300 mb-1">Transfer Count</div>
                    <div className="font-semibold">{selectedNft.metadata.transferCount}</div>
                  </div>
                )}
              </div>

              {/* Transfer Button */}
              {transfersEnabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNft(null);
                    handleTransferClick(selectedNft);
                  }}
                  className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transfer NFT
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transfer NFT Modal */}
        <TransferNftModal
          isOpen={transferModalOpen}
          onClose={handleTransferClose}
          nft={nftToTransfer}
        />
      </div>
    </div>
  );
};

export default MyNftsPage;
