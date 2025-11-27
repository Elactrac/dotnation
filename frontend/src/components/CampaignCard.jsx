import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDotBalance, getCampaignStatus, calculateProgress } from '../utils/formatters';
import { summarizeContent } from '../utils/aiApi';
import { useCampaign } from '../contexts/CampaignContext';

/**
 * A card component that displays a summary of a fundraising campaign.
 *
 * It includes the campaign's title, funding progress, and current status.
 * The card provides interactive elements for viewing detailed information about the
 * campaign and generating an AI-powered summary of its description.
 * For successful campaigns, a withdrawal action is also available.
 *
 * @param {object} props - The component props.
 * @param {object} props.campaign - The campaign object containing details like title,
 *   raised amount, goal, etc.
 * @returns {JSX.Element} The rendered campaign card component.
 */
const CampaignCard = ({ campaign }) => {
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState('');
    const [estimatedMatching, setEstimatedMatching] = useState('0');
    const [isLoadingMatching, setIsLoadingMatching] = useState(false);

    const { getEstimatedMatching, contract } = useCampaign();
    const status = getCampaignStatus(campaign);
    const progress = calculateProgress(campaign.raised, campaign.goal);

    const canWithdraw = status.text === 'Successful';

    // Fetch estimated matching for this campaign
    useEffect(() => {
        if (contract && campaign.id !== undefined && status.text === 'Active') {
            setIsLoadingMatching(true);
            getEstimatedMatching(campaign.id)
                .then(matching => {
                    setEstimatedMatching(matching);
                })
                .catch(err => {
                    console.error('Error fetching matching:', err);
                    setEstimatedMatching('0');
                })
                .finally(() => {
                    setIsLoadingMatching(false);
                });
        }
    }, [contract, campaign.id, status.text, getEstimatedMatching]);

    /**
     * Handles the AI summary generation for the campaign description.
     * Toggles the summary visibility if it's already generated.
     */
    const handleSummarize = async () => {
        if (summary || summaryError) { // Toggle off if summary is already shown
            setSummary('');
            setSummaryError('');
            return;
        }

        setIsSummarizing(true);
        try {
            const result = await summarizeContent(campaign.description, 150);
            setSummary(result.summary);
            if (result.fallback) {
                console.warn('[CampaignCard] Using fallback summary (backend unavailable)');
            }
        } catch (error) {
            console.error('[CampaignCard] Error getting summary:', error);
            setSummaryError(error.message || 'Failed to get summary from AI service.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const statusStyles = {
        Active: 'bg-white/10 text-white border-white/20',
        Successful: 'bg-white/10 text-white border-white/20',
        Failed: 'bg-white/10 text-white border-white/20',
        Withdrawn: 'bg-white/10 text-white border-white/20',
    };

    return (
        <article className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300" aria-label={`Campaign: ${campaign.title}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-serif font-bold text-white flex-1">{campaign.title}</h3>
                <span 
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold font-sans border ${statusStyles[status.text] || statusStyles.Withdrawn}`}
                    role="status"
                    aria-label={`Campaign status: ${status.text}`}
                >
                    {status.text}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 mb-6" role="region" aria-label="Funding progress">
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-sans text-white">{formatDotBalance(campaign.raised)}</span>
                    <span className="text-sm font-sans text-white/60">Goal: {formatDotBalance(campaign.goal)}</span>
                </div>
                <div 
                    className="w-full bg-white/10 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`${formatDotBalance(campaign.raised)} raised of ${formatDotBalance(campaign.goal)} goal, ${progress.toFixed(1)}% complete`}
                >
                    <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Quadratic Funding Matching Display */}
            {contract && status.text === 'Active' && !isLoadingMatching && BigInt(estimatedMatching || '0') > 0n && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 mb-6" role="status" aria-label="Quadratic funding matching">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span className="text-xs font-semibold font-sans text-white">Estimated Matching Boost</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-sans text-white/80">+{formatDotBalance(BigInt(estimatedMatching))}</span>
                        <span className="text-xs font-sans text-white/40">from matching pool</span>
                    </div>
                    <div className="text-xs font-sans text-white/60 pt-2 border-t border-white/10">
                        Total potential: {formatDotBalance(BigInt(campaign.raised) + BigInt(estimatedMatching))} 🎉
                    </div>
                </div>
            )}

            {/* AI Summary Section */}
            {(summary || summaryError) && (
                <div className="border-t border-white/10 pt-4 mb-6" role={summaryError ? 'alert' : 'region'} aria-live="polite" aria-label="AI-generated summary">
                    <p className={`text-sm font-sans ${summaryError ? 'text-red-400' : 'text-white/60'}`}>
                        {summaryError || summary}
                    </p>
                </div>
            )}

            {/* Footer with Metrics and Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <div className="text-center" role="status" aria-label={`${campaign.donations?.length || 0} donors`}>
                    <p className="text-2xl font-bold font-serif text-white">{campaign.donations?.length || 0}</p>
                    <span className="text-xs font-sans text-white/60">Donors</span>
                </div>

                <div className="flex items-center gap-2" role="group" aria-label="Campaign actions">
                    <ActionButton 
                        title="Summarize with AI" 
                        ariaLabel={isSummarizing ? 'Generating AI summary' : (summary || summaryError) ? 'Hide AI summary' : 'Summarize campaign with AI'} 
                        onClick={handleSummarize} 
                        disabled={isSummarizing}
                    >
                        {isSummarizing ? <SpinnerIcon /> : <MagicIcon />}
                    </ActionButton>
                    <Link to={`/campaign/${campaign.id}`} aria-label={`View details for ${campaign.title}`}>
                        <ActionButton title="View Details" ariaLabel={`View details for ${campaign.title}`}>
                            <ViewIcon />
                        </ActionButton>
                    </Link>
                    {canWithdraw && (
                        <ActionButton 
                            title="Withdraw Funds" 
                            ariaLabel={`Withdraw funds from ${campaign.title}`}
                            className="bg-white/10 text-white hover:bg-white/20"
                        >
                            <WithdrawIcon />
                        </ActionButton>
                    )}
                </div>
            </div>
        </article>
    );
};

/**
 * A reusable button component for actions in the CampaignCard.
 * @param {object} props - The component props.
 * @param {string} props.title - The tooltip title for the button.
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.disabled - Whether the button is disabled.
 * @param {React.ReactNode} props.children - The icon or content of the button.
 * @param {string} props.className - Additional CSS classes for the button.
 * @returns {JSX.Element} The action button component.
 */
const ActionButton = ({ title, onClick, disabled, children, className = '', ariaLabel }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel || title}
        aria-disabled={disabled}
        className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

ActionButton.propTypes = { title: PropTypes.string, onClick: PropTypes.func, disabled: PropTypes.bool, children: PropTypes.node, className: PropTypes.string, ariaLabel: PropTypes.string };

// Icons
/** Renders a magic icon. @returns {JSX.Element} */
const MagicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 23.27L13.73 22l1.27-1.27L16.27 22l-1.27 1.27zM11.5 21.5L10 20l1.5-1.5L13 20l-1.5 1.5zM7 18l-1.5-1.5L7 15l1.5 1.5L7 18zM4.73 15L3.46 13.73 4.73 12.46 6 13.73 4.73 15zM12 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM20.73 6.46L19.46 5.19 20.73 3.92 22 5.19 20.73 6.46zM18 11l-1.5-1.5L18 8l1.5 1.5L18 11z"></path></svg>;
/** Renders a spinning loading icon. @returns {JSX.Element} */
const SpinnerIcon = () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
/** Renders a view icon. @returns {JSX.Element} */
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>;
/** Renders a withdraw icon. @returns {JSX.Element} */
const WithdrawIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path></svg>;

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
