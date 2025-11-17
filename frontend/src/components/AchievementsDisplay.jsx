import PropTypes from 'prop-types';

/**
 * Component for displaying user achievements with badges
 */
const AchievementsDisplay = ({ achievements }) => {
  // Achievement metadata with icons and descriptions
  const achievementData = {
    // Donation count achievements
    'First Donation': {
      icon: '🌟',
      description: 'Made your first donation',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/30'
    },
    'Generous Giver': {
      icon: '💝',
      description: 'Made 5 donations',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30'
    },
    'Philanthropist': {
      icon: '🏆',
      description: 'Made 10 donations',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500/30'
    },
    'Champion Donor': {
      icon: '👑',
      description: 'Made 25 donations',
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/30'
    },
    'Legendary Supporter': {
      icon: '💎',
      description: 'Made 50+ donations',
      color: 'from-indigo-500 to-purple-600',
      borderColor: 'border-indigo-500/30'
    },
    
    // Amount achievements
    'DOT Donor': {
      icon: '🪙',
      description: 'Donated 1+ DOT total',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500/30'
    },
    'Big Spender': {
      icon: '💰',
      description: 'Donated 10+ DOT total',
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/30'
    },
    'Whale': {
      icon: '🐋',
      description: 'Donated 100+ DOT total',
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/30'
    },
    'Mega Whale': {
      icon: '🌊',
      description: 'Donated 1000+ DOT total',
      color: 'from-blue-600 to-indigo-600',
      borderColor: 'border-blue-600/30'
    },
    
    // Rarity achievements
    'NFT Enthusiast': {
      icon: '🎨',
      description: 'Collected 3+ Common NFTs',
      color: 'from-gray-500 to-slate-500',
      borderColor: 'border-gray-500/30'
    },
    'Rare Collector': {
      icon: '💠',
      description: 'Own a Rare NFT',
      color: 'from-blue-400 to-indigo-400',
      borderColor: 'border-blue-400/30'
    },
    'Epic Collection': {
      icon: '⭐',
      description: 'Own an Epic NFT',
      color: 'from-purple-400 to-pink-400',
      borderColor: 'border-purple-400/30'
    },
    'Legendary Collector': {
      icon: '🌟',
      description: 'Own a Legendary NFT',
      color: 'from-yellow-400 to-orange-400',
      borderColor: 'border-yellow-400/30'
    }
  };

  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <p className="text-white/60 text-sm">No achievements yet</p>
        <p className="text-white/40 text-xs mt-2">Make donations to unlock achievements</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h3 className="text-lg font-bold text-white font-display">
          Achievements
        </h3>
        <span className="ml-auto bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((achievement, index) => {
          const data = achievementData[achievement] || {
            icon: '🏅',
            description: achievement,
            color: 'from-gray-500 to-slate-500',
            borderColor: 'border-gray-500/30'
          };

          return (
            <div
              key={index}
              className={`relative bg-white/5 border ${data.borderColor} rounded-xl p-4 hover:scale-105 transition-all duration-300 group overflow-hidden`}
            >
              {/* Gradient background effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${data.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-2xl">{data.icon}</span>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {achievement}
                    </h4>
                    <p className="text-white/60 text-xs leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                </div>

                {/* Checkmark badge */}
                <div className="absolute top-0 right-0">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement progress hint */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-primary/80 text-xs leading-relaxed">
            Continue making donations to unlock more achievements and earn exclusive badges!
          </p>
        </div>
      </div>
    </div>
  );
};

AchievementsDisplay.propTypes = {
  achievements: PropTypes.arrayOf(PropTypes.string),
};

export default AchievementsDisplay;
