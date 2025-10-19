import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDotBalance, getCampaignStatus, calculateProgress } from '../utils/formatters';

const CampaignCard = ({ campaign }) => {
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    const status = getCampaignStatus(campaign);
    const progress = calculateProgress(campaign.raised, campaign.goal);

    const canWithdraw = status.text === 'Successful';

    const handleSummarize = async () => {
        if (summary || summaryError) { // Toggle off if summary is already shown
            setSummary('');
            setSummaryError('');
            return;
        }

        setIsSummarizing(true);
        try {
            const response = await fetch('http://localhost:3001/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: campaign.description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get summary from AI service.');
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            setSummaryError(error.message);
        } finally {
            setIsSummarizing(false);
        }
    };

    const statusStyles = {
        Active: 'badge-info',
        Successful: 'badge-success',
        Failed: 'badge-error',
        Withdrawn: 'bg-text-muted/20 text-text-muted',
    };

    return (
        <div className="card card-hover card-spacing space-card">
            {/* Header */}
            <div className="flex-between">
                <h3 className="text-display-sm pr-4">{campaign.title}</h3>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status.text] || statusStyles.Withdrawn}`}>
                    {status.text}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex-between">
                    <span className="text-body-sm font-bold text-primary">{formatDotBalance(campaign.raised)}</span>
                    <span className="text-body-sm text-text-secondary">Goal: {formatDotBalance(campaign.goal)}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* AI Summary Section */}
            {(summary || summaryError) && (
                <div className="border-t border-border pt-4">
                    <p className={`text-body-sm ${summaryError ? 'text-error' : 'text-text-secondary'}`}>
                        {summaryError || summary}
                    </p>
                </div>
            )}

            {/* Footer with Metrics and Actions */}
            <div className="flex-between border-t border-border pt-4 mt-auto">
                <div className="text-center">
                    <p className="text-display-sm font-bold">{campaign.donations?.length || 0}</p>
                    <span className="text-caption">Donors</span>
                </div>

                <div className="flex-center gap-2">
                    <ActionButton title="Summarize with AI" onClick={handleSummarize} disabled={isSummarizing}>
                        {isSummarizing ? <SpinnerIcon /> : <MagicIcon />}
                    </ActionButton>
                    <Link to={`/dashboard/campaign/${campaign.id}`}>
                        <ActionButton title="View Details">
                            <ViewIcon />
                        </ActionButton>
                    </Link>
                    {canWithdraw && (
                        <ActionButton title="Withdraw Funds" className="bg-primary/20 text-primary hover:bg-primary/30">
                            <WithdrawIcon />
                        </ActionButton>
                    )}
                </div>
            </div>
        </div>
    );
};

// ActionButton Component
const ActionButton = ({ title, onClick, disabled, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`size-10 flex-center rounded-full bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${className}`}>
        {children}
    </button>
);

ActionButton.propTypes = { title: PropTypes.string, onClick: PropTypes.func, disabled: PropTypes.bool, children: PropTypes.node, className: PropTypes.string };

// Icons
const MagicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M15 23.27L13.73 22l1.27-1.27L16.27 22l-1.27 1.27zM11.5 21.5L10 20l1.5-1.5L13 20l-1.5 1.5zM7 18l-1.5-1.5L7 15l1.5 1.5L7 18zM4.73 15L3.46 13.73 4.73 12.46 6 13.73 4.73 15zM12 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM20.73 6.46L19.46 5.19 20.73 3.92 22 5.19 20.73 6.46zM18 11l-1.5-1.5L18 8l1.5 1.5L18 11z"></path></svg>;
const SpinnerIcon = () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>;
const WithdrawIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path></svg>;

CampaignCard.propTypes = {
    campaign: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        raised: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
        goal: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
        deadline: PropTypes.number.isRequired,
        state: PropTypes.string.isRequired,
        donations: PropTypes.array
    }).isRequired,
};

export default CampaignCard;
