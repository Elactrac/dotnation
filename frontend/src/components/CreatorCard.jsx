import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMembership } from '../contexts/MembershipContext';

/**
 * A card component that displays a creator profile summary.
 * Used in the Members browse page to showcase creators.
 */
const CreatorCard = ({ creator }) => {
    const { getCreatorTiers } = useMembership();
    const [lowestPrice, setLowestPrice] = useState(creator.price);
    const [tierCount, setTierCount] = useState(0);
    
    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const tiers = await getCreatorTiers(creator.id);
                if (tiers && tiers.length > 0) {
                    setTierCount(tiers.length);
                    // Find lowest price tier
                    const minPrice = Math.min(...tiers.map(t => t.price / 1e10));
                    setLowestPrice(`${minPrice.toFixed(0)} DOT`);
                }
            } catch (error) {
                // Silently handle error - use default price from props
                console.debug('Using default price for creator:', creator.name);
            }
        };
        
        fetchTiers();
    }, [creator.id, getCreatorTiers]);
    
    return (
        <article
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group space-y-6"
            aria-label={`Creator: ${creator.name}`}
        >
            {/* Header with Avatar */}
            <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl flex-shrink-0" aria-hidden="true">
                    {creator.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif text-gray-900 mb-1 truncate">{creator.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{creator.subscribers} subscribers</span>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">{creator.price}/month</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                {creator.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{creator.subscribers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                        </svg>
                        <span>From {lowestPrice}</span>
                    </div>
                    {tierCount > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-blue-600 font-medium">{tierCount} tiers</span>
                        </div>
                    )}
                </div>

                <Link
                    to={`/members/${creator.id}`}
                    className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all group-hover:scale-105 duration-300"
                    aria-label={`View ${creator.name}'s profile`}
                >
                    View Profile →
                </Link>
            </div>
        </article>
    );
};

CreatorCard.propTypes = {
    creator: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        subscribers: PropTypes.number.isRequired,
        avatar: PropTypes.string.isRequired,
    }).isRequired,
};

export default CreatorCard;
