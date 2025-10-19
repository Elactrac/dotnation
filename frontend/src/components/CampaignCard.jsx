import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    formatDotBalance,
    getCampaignStatus,
    calculateProgress,
} from '../utils/formatters';

const CampaignCard = ({ campaign }) => {
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    const status = getCampaignStatus(campaign);
    const progress = calculateProgress(campaign.raised, campaign.goal);

    const canWithdraw = status.text === 'Successful';

    const handleSummarize = async () => {
        if (summary) { // Toggle off if summary is already shown
            setSummary('');
            return;
        }

        setIsSummarizing(true);
        setSummaryError('');
        try {
            const response = await fetch('http://localhost:3001/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description: campaign.description }),
            });

            if (!response.ok) {
                throw new Error('Failed to get summary from AI service.');
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            setSummaryError(error.message);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="campaign-card">
            <div className="campaign-info">
                <h4>{campaign.title}</h4>
                <div>
                    <span className={`status-badge ${status.className}`}>
                        {status.text}
                    </span>
                </div>
            </div>

            <div className="campaign-progress">
                <p style={{ fontSize: '0.9rem', marginBottom: '5px', color: 'var(--secondary-text)' }}>
                    {Math.floor(progress)}% Funded
                </p>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* AI Summary Section */}
            {(summary || summaryError) && (
                <div className="ai-summary">
                    <p>{summaryError ? <span style={{color: 'red'}}>{summaryError}</span> : summary}</p>
                </div>
            )}

            <div className="campaign-metrics">
                <p>{formatDotBalance(campaign.raised)} / {formatDotBalance(campaign.goal)}</p>
                <span>Raised</span>
            </div>

            <div className="campaign-metrics">
                <p>{campaign.donations?.length || 0}</p>
                <span>Donors</span>
            </div>

            <div className="action-buttons">
                <Link to={`/dashboard/campaign/${campaign.id}`} className="action-btn" title="View">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
                </Link>
                <button onClick={handleSummarize} className="action-btn" title="Summarize with AI" disabled={isSummarizing}>
                    {isSummarizing ? '...' : 
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M15 23.27L13.73 22l1.27-1.27L16.27 22l-1.27 1.27zM11.5 21.5L10 20l1.5-1.5L13 20l-1.5 1.5zM7 18l-1.5-1.5L7 15l1.5 1.5L7 18zM4.73 15L3.46 13.73 4.73 12.46 6 13.73 4.73 15zM12 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM20.73 6.46L19.46 5.19 20.73 3.92 22 5.19 20.73 6.46zM18 11l-1.5-1.5L18 8l1.5 1.5L18 11z"></path></svg>
                    }
                </button>
                <button className="action-btn" title="Share">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"></path></svg>
                </button>
                {canWithdraw && (
                    <button className="action-btn withdraw" title="Withdraw Funds">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

CampaignCard.propTypes = {
    campaign: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired, // Added description
        raised: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
        goal: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
        deadline: PropTypes.number.isRequired,
        state: PropTypes.string.isRequired,
        donations: PropTypes.array
    }).isRequired,
};

export default CampaignCard;