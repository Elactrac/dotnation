/**
 * Empty State Component
 * 
 * Reusable component to display when no results are found
 * Supports custom icons, titles, descriptions, and actions
 * Fully accessible with proper ARIA attributes
 */

import PropTypes from 'prop-types';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ 
  icon: Icon = FiInbox,
  title = 'No results found',
  description = 'Try adjusting your filters or search terms',
  action = null,
  variant = 'default' // 'default' or 'compact'
}) => {
  const isCompact = variant === 'compact';

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 text-center ${
        isCompact ? 'p-8' : 'p-12'
      }`}
      role="status"
      aria-live="polite"
    >
      <div 
        className={`bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isCompact ? 'w-16 h-16' : 'w-20 h-20'
        }`}
        aria-hidden="true"
      >
        <Icon className={`text-gray-400 ${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`} />
      </div>
      
      <h3 
        className={`font-serif font-bold text-gray-900 mb-2 ${
          isCompact ? 'text-lg' : 'text-xl'
        }`}
        id="empty-state-title"
      >
        {title}
      </h3>
      
      <p 
        className={`text-gray-600 max-w-md mx-auto ${
          isCompact ? 'text-sm mb-4' : 'mb-6'
        }`}
        id="empty-state-description"
      >
        {description}
      </p>

      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'compact']),
};

export default EmptyState;
