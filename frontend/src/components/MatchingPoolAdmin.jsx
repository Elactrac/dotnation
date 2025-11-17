import { useState, useEffect } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { formatDotBalance } from '../utils/formatters';

/**
 * Admin component for managing the quadratic funding matching pool.
 * Allows funding the pool, creating rounds, and distributing matching.
 */
const MatchingPoolAdmin = () => {
  const { 
    fundMatchingPool, 
    createMatchingRound, 
    distributeMatching,
    getMatchingPoolBalance,
    getCurrentRound,
    getRoundDetails,
    contract 
  } = useCampaign();
  
  const { selectedAccount } = useWallet();
  
  const [poolBalance, setPoolBalance] = useState('0');
  const [currentRound, setCurrentRound] = useState(null);
  const [roundDetails, setRoundDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [fundAmount, setFundAmount] = useState('');
  const [roundPoolAmount, setRoundPoolAmount] = useState('');
  const [roundDuration, setRoundDuration] = useState('7'); // days

  // Fetch pool status
  useEffect(() => {
    if (!contract) return;

    const fetchPoolStatus = async () => {
      try {
        const balance = await getMatchingPoolBalance();
        setPoolBalance(balance);
        
        const round = await getCurrentRound();
        setCurrentRound(round);
        
        if (round !== null) {
          const details = await getRoundDetails(round);
          setRoundDetails(details);
        } else {
          setRoundDetails(null);
        }
      } catch (err) {
        console.error('Error fetching pool status:', err);
      }
    };

    fetchPoolStatus();
    const interval = setInterval(fetchPoolStatus, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [contract, getMatchingPoolBalance, getCurrentRound, getRoundDetails]);

  const handleFundPool = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !fundAmount) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const amountInPlancks = BigInt(parseFloat(fundAmount) * 1_000_000_000_000);
      await fundMatchingPool(amountInPlancks.toString());
      setSuccess(`Successfully funded matching pool with ${fundAmount} DOT!`);
      setFundAmount('');
      
      // Refresh balance
      setTimeout(async () => {
        const balance = await getMatchingPoolBalance();
        setPoolBalance(balance);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !roundPoolAmount || !roundDuration) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const poolAmountInPlancks = BigInt(parseFloat(roundPoolAmount) * 1_000_000_000_000);
      const durationInMs = parseInt(roundDuration) * 24 * 60 * 60 * 1000; // days to ms
      
      await createMatchingRound(poolAmountInPlancks.toString(), durationInMs);
      setSuccess(`Successfully created matching round for ${roundDuration} days with ${roundPoolAmount} DOT!`);
      setRoundPoolAmount('');
      setRoundDuration('7');
      
      // Refresh round info
      setTimeout(async () => {
        const round = await getCurrentRound();
        setCurrentRound(round);
        if (round !== null) {
          const details = await getRoundDetails(round);
          setRoundDetails(details);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributeMatching = async () => {
    if (!selectedAccount || currentRound === null) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await distributeMatching(currentRound);
      setSuccess('Successfully distributed matching funds to campaigns!');
      
      // Refresh round info
      setTimeout(async () => {
        const round = await getCurrentRound();
        setCurrentRound(round);
        if (round !== null) {
          const details = await getRoundDetails(round);
          setRoundDetails(details);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contract) {
    return (
      <div className="card space-card">
        <div className="text-center text-text-muted">
          <p>Connect to blockchain to manage matching pool</p>
        </div>
      </div>
    );
  }

  const roundEndDate = roundDetails ? new Date(roundDetails.endTime) : null;
  const isRoundEnded = roundEndDate && roundEndDate < new Date();
  const canDistribute = roundDetails && isRoundEnded && !roundDetails.distributed;

  return (
    <div className="space-y-6">
      <div className="card space-card">
        <h2 className="text-display-md mb-4">Quadratic Funding Matching Pool</h2>
        
        {/* Pool Status */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption text-text-muted">Available Pool Balance</span>
              <p className="text-display-sm font-bold text-primary">
                {formatDotBalance(BigInt(poolBalance))}
              </p>
            </div>
            <div>
              <span className="text-caption text-text-muted">Current Round</span>
              <p className="text-display-sm font-bold">
                {currentRound !== null ? `Round #${currentRound}` : 'No active round'}
              </p>
            </div>
          </div>
        </div>

        {/* Current Round Details */}
        {roundDetails && (
          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <h3 className="text-body-lg font-semibold mb-3">Round #{roundDetails.id} Details</h3>
            <div className="space-y-2 text-body-sm">
              <div className="flex-between">
                <span className="text-text-muted">Pool Amount:</span>
                <span className="font-semibold">{formatDotBalance(BigInt(roundDetails.poolAmount))}</span>
              </div>
              <div className="flex-between">
                <span className="text-text-muted">End Date:</span>
                <span className="font-semibold">{roundEndDate?.toLocaleString()}</span>
              </div>
              <div className="flex-between">
                <span className="text-text-muted">Status:</span>
                <span className={`font-semibold ${isRoundEnded ? 'text-error' : 'text-success'}`}>
                  {isRoundEnded ? 'Ended' : 'Active'}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-text-muted">Distributed:</span>
                <span className={`font-semibold ${roundDetails.distributed ? 'text-success' : 'text-text-muted'}`}>
                  {roundDetails.distributed ? 'Yes ✓' : 'No'}
                </span>
              </div>
            </div>
            
            {canDistribute && (
              <button
                onClick={handleDistributeMatching}
                disabled={isLoading}
                className="btn btn-primary w-full mt-4"
              >
                {isLoading ? 'Processing...' : 'Distribute Matching Funds'}
              </button>
            )}
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-success/10 border border-success/30 text-success rounded-lg p-3 mb-4">
            {success}
          </div>
        )}

        {/* Fund Pool Form */}
        <form onSubmit={handleFundPool} className="mb-6 pb-6 border-b border-border">
          <h3 className="text-body-lg font-semibold mb-3">Fund Matching Pool</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="fundAmount" className="block text-body-sm font-medium mb-1">
                Amount (DOT)
              </label>
              <input
                type="number"
                id="fundAmount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="e.g., 100"
                step="0.001"
                min="0.001"
                className="input w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !fundAmount}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Processing...' : 'Fund Pool'}
            </button>
          </div>
        </form>

        {/* Create Round Form */}
        <form onSubmit={handleCreateRound}>
          <h3 className="text-body-lg font-semibold mb-3">Create Matching Round</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="roundPoolAmount" className="block text-body-sm font-medium mb-1">
                Pool Amount for Round (DOT)
              </label>
              <input
                type="number"
                id="roundPoolAmount"
                value={roundPoolAmount}
                onChange={(e) => setRoundPoolAmount(e.target.value)}
                placeholder="e.g., 50"
                step="0.001"
                min="0.001"
                className="input w-full"
                required
              />
              <p className="text-caption text-text-muted mt-1">
                Available: {formatDotBalance(BigInt(poolBalance))}
              </p>
            </div>
            <div>
              <label htmlFor="roundDuration" className="block text-body-sm font-medium mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                id="roundDuration"
                value={roundDuration}
                onChange={(e) => setRoundDuration(e.target.value)}
                placeholder="e.g., 7"
                min="1"
                max="365"
                className="input w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !roundPoolAmount || !roundDuration || currentRound !== null}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Processing...' : 'Create Round'}
            </button>
            {currentRound !== null && (
              <p className="text-caption text-text-muted text-center">
                Close the current round before creating a new one
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="card space-card bg-info/10 border-info/30">
        <h3 className="text-body-lg font-semibold mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          About Quadratic Funding
        </h3>
        <div className="text-body-sm text-text-secondary space-y-2">
          <p>
            Quadratic funding rewards campaigns with <strong>many small donors</strong> over those with few large donors.
          </p>
          <p className="text-caption">
            Formula: matching ∝ (√donation₁ + √donation₂ + ... + √donationₙ)²
          </p>
          <p>
            This makes crowdfunding truly democratic and helps grassroots campaigns compete!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchingPoolAdmin;
