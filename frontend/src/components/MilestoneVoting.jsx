import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { formatDOT } from '../utils/formatters';

/**
 * Component for displaying and voting on campaign milestones.
 * Shows milestone progress, voting status, and allows donors to vote.
 */
const MilestoneVoting = ({ campaign }) => {
  const {
    getMilestones,
    voteOnMilestone,
    activateMilestoneVoting,
    releaseMilestoneFunds,
    hasVotedOnMilestone,
    contract,
  } = useCampaign();

  const { selectedAccount } = useWallet();

  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingIndex, setProcessingIndex] = useState(null);

  // Fetch milestones
  useEffect(() => {
    if (!contract || !campaign?.id) return;

    const fetchMilestones = async () => {
      try {
        const data = await getMilestones(campaign.id);
        setMilestones(data);

        // Check voting status for each milestone
        if (selectedAccount && data.length > 0) {
          const statuses = {};
          for (let i = 0; i < data.length; i++) {
            const voted = await hasVotedOnMilestone(campaign.id, i, selectedAccount.address);
            statuses[i] = voted;
          }
          setVotingStatus(statuses);
        }
      } catch (err) {
        console.error('Error fetching milestones:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [contract, campaign?.id, selectedAccount, getMilestones, hasVotedOnMilestone]);

  const handleVote = async (milestoneIndex, approve) => {
    if (!selectedAccount) {
      setError('Please connect your wallet to vote');
      return;
    }

    setProcessingIndex(milestoneIndex);
    setError('');
    setSuccess('');

    try {
      await voteOnMilestone(campaign.id, milestoneIndex, approve);
      setSuccess(`Vote ${approve ? 'for' : 'against'} submitted successfully!`);

      // Refresh milestones and voting status
      setTimeout(async () => {
        const data = await getMilestones(campaign.id);
        setMilestones(data);
        const voted = await hasVotedOnMilestone(campaign.id, milestoneIndex, selectedAccount.address);
        setVotingStatus(prev => ({ ...prev, [milestoneIndex]: voted }));
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleActivateVoting = async (milestoneIndex) => {
    if (!selectedAccount) {
      setError('Please connect your wallet');
      return;
    }

    setProcessingIndex(milestoneIndex);
    setError('');
    setSuccess('');

    try {
      await activateMilestoneVoting(campaign.id, milestoneIndex);
      setSuccess('Milestone voting activated!');

      // Refresh milestones
      setTimeout(async () => {
        const data = await getMilestones(campaign.id);
        setMilestones(data);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleReleaseFunds = async (milestoneIndex) => {
    if (!selectedAccount) {
      setError('Please connect your wallet');
      return;
    }

    setProcessingIndex(milestoneIndex);
    setError('');
    setSuccess('');

    try {
      await releaseMilestoneFunds(campaign.id, milestoneIndex);
      setSuccess('Milestone funds released successfully!');

      // Refresh milestones
      setTimeout(async () => {
        const data = await getMilestones(campaign.id);
        setMilestones(data);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingIndex(null);
    }
  };

  const calculateApproval = (milestone) => {
    const votesFor = BigInt(milestone.votesFor || '0');
    const votesAgainst = BigInt(milestone.votesAgainst || '0');
    const total = votesFor + votesAgainst;

    if (total === 0n) return 0;

    return Number((votesFor * 10000n) / total) / 100;
  };

  const calculateMilestoneAmount = (milestone) => {
    const totalFunds = BigInt(campaign.raised || '0') + BigInt(campaign.matching_amount || campaign.matchingAmount || '0');
    return (totalFunds * BigInt(milestone.percentage)) / 10000n;
  };

  const isOwner = selectedAccount && campaign.owner === selectedAccount.address;

  if (isLoading) {
    return (
      <div className="card space-card">
        <div className="text-center text-text-muted">Loading milestones...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="card space-card">
        <div className="text-center text-text-muted">Connect to blockchain to view milestones</div>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="card space-card">
        <div className="text-center text-text-muted">
          <p>This campaign has no milestones</p>
          <p className="text-caption mt-2">Funds will be released in one payment when the campaign succeeds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-card">
        <h3 className="text-display-sm mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Campaign Milestones
        </h3>

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

        {/* Info Box */}
        <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-4 text-body-sm">
          <p className="font-semibold mb-1">DAO Governance Active</p>
          <p className="text-text-secondary">
            This campaign uses milestone-based fund release. Donors vote to approve each milestone before funds are released.
            Requires 66% approval to pass.
          </p>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const approval = calculateApproval(milestone);
            const amount = calculateMilestoneAmount(milestone);
            const deadlineDate = new Date(milestone.deadline);
            const isPassed = approval >= 66;
            const canRelease = isPassed && milestone.votingActive && !milestone.released;
            const hasVoted = votingStatus[index];

            return (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  milestone.released
                    ? 'bg-success/10 border-success/30'
                    : milestone.votingActive
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-surface border-border'
                }`}
              >
                <div className="flex-between mb-3">
                  <div>
                    <h4 className="text-body-lg font-semibold">
                      Milestone {index + 1}: {milestone.description}
                    </h4>
                    <p className="text-caption text-text-muted">
                      {milestone.percentage / 100}% • {formatDOT(amount)} • Due: {deadlineDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {milestone.released && (
                      <span className="badge badge-success">Released ✓</span>
                    )}
                    {milestone.votingActive && !milestone.released && (
                      <span className="badge badge-info">Voting Active</span>
                    )}
                    {!milestone.votingActive && !milestone.released && (
                      <span className="badge bg-text-muted/20 text-text-muted">Pending</span>
                    )}
                  </div>
                </div>

                {/* Voting Progress */}
                {(milestone.votingActive || milestone.released) && (
                  <div className="mb-3">
                    <div className="flex-between text-body-sm mb-1">
                      <span>Approval: {approval.toFixed(1)}%</span>
                      <span className="text-text-muted">
                        {formatDOT(BigInt(milestone.votesFor))} FOR / {formatDOT(BigInt(milestone.votesAgainst))} AGAINST
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isPassed ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(approval, 100)}%` }}
                      ></div>
                    </div>
                    {isPassed && (
                      <p className="text-caption text-success mt-1">✓ 66% threshold reached</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {/* Owner: Activate Voting */}
                  {isOwner && !milestone.votingActive && !milestone.released && index === 0 && (
                    <button
                      onClick={() => handleActivateVoting(index)}
                      disabled={processingIndex === index}
                      className="btn btn-primary btn-sm"
                    >
                      {processingIndex === index ? 'Processing...' : 'Activate Voting'}
                    </button>
                  )}

                  {/* Owner: Activate Next Milestone */}
                  {isOwner &&
                    !milestone.votingActive &&
                    !milestone.released &&
                    index > 0 &&
                    milestones[index - 1].released && (
                      <button
                        onClick={() => handleActivateVoting(index)}
                        disabled={processingIndex === index}
                        className="btn btn-primary btn-sm"
                      >
                        {processingIndex === index ? 'Processing...' : 'Activate Voting'}
                      </button>
                    )}

                  {/* Donors: Vote */}
                  {milestone.votingActive && !milestone.released && !hasVoted && !isOwner && (
                    <>
                      <button
                        onClick={() => handleVote(index, true)}
                        disabled={processingIndex === index}
                        className="btn btn-success btn-sm"
                      >
                        {processingIndex === index ? 'Voting...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleVote(index, false)}
                        disabled={processingIndex === index}
                        className="btn btn-error btn-sm"
                      >
                        {processingIndex === index ? 'Voting...' : '✗ Reject'}
                      </button>
                    </>
                  )}

                  {/* Already Voted */}
                  {milestone.votingActive && hasVoted && (
                    <span className="text-body-sm text-text-muted">✓ You have voted</span>
                  )}

                  {/* Owner: Release Funds */}
                  {isOwner && canRelease && (
                    <button
                      onClick={() => handleReleaseFunds(index)}
                      disabled={processingIndex === index}
                      className="btn btn-success btn-sm"
                    >
                      {processingIndex === index ? 'Processing...' : 'Release Funds'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

MilestoneVoting.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.number.isRequired,
    owner: PropTypes.string.isRequired,
    raised: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
    matching_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    matchingAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  }).isRequired,
};

export default MilestoneVoting;
