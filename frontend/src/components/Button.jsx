/**
 * Unified Button Component
 * 
 * Handles all button variants used across the application
 * Supports both button and Link (react-router-dom) rendering
 */

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  to = null,
  href = null,
  onClick = null,
  type = 'button',
  className = '',
  ariaLabel = null,
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-600 ease-gravity focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    // Primary variants
    primary: 'bg-black text-white rounded-sm hover:-translate-y-px hover:shadow-lg focus:ring-black',
    'primary-light': 'bg-white text-black rounded-sm hover:-translate-y-px hover:shadow-btn-hover focus:ring-white',
    
    // Secondary variants
    secondary: 'border border-gray-300 bg-transparent text-gray-900 rounded-sm hover:border-gray-900 focus:ring-gray-900',
    'secondary-dark': 'border border-border-strong bg-transparent text-text-primary rounded-sm hover:border-white focus:ring-white',
    
    // Outline variants
    outline: 'border-2 border-black bg-transparent text-black rounded-xl hover:bg-black hover:text-white focus:ring-black',
    'outline-light': 'border-2 border-white bg-transparent text-white rounded-xl hover:bg-white hover:text-black focus:ring-white',
    
    // Ghost variants
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg focus:ring-gray-500',
    'ghost-dark': 'bg-transparent text-text-secondary hover:bg-surface rounded-lg focus:ring-primary',
    
    // Danger variants
    danger: 'bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-red-600',
    'danger-outline': 'border-2 border-red-600 bg-transparent text-red-600 rounded-xl hover:bg-red-600 hover:text-white focus:ring-red-600',
    
    // Success variants
    success: 'bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-green-600',
    
    // Icon only variants
    'icon-primary': 'p-3 bg-white text-black rounded-full hover:bg-gray-100 focus:ring-black',
    'icon-ghost': 'p-2 text-gray-400 hover:text-gray-600 rounded-lg focus:ring-gray-500',
    'icon-danger': 'p-2 text-gray-400 hover:text-red-600 rounded-lg focus:ring-red-600',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
    icon: 'p-2', // For icon-only buttons
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${widthStyles} ${className}`.trim();

  // Loading spinner
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Button content
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  // Common props
  const commonProps = {
    className: combinedStyles,
    disabled: disabled || loading,
    'aria-label': ariaLabel,
    ref,
    ...props
  };

  // Render as Link (react-router-dom)
  if (to && !disabled && !loading) {
    return (
      <Link to={to} {...commonProps}>
        {buttonContent}
      </Link>
    );
  }

  // Render as anchor tag
  if (href && !disabled && !loading) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        {...commonProps}
      >
        {buttonContent}
      </a>
    );
  }

  // Render as button
  return (
    <button 
      type={type}
      onClick={onClick}
      {...commonProps}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary', 'primary-light',
    'secondary', 'secondary-dark',
    'outline', 'outline-light',
    'ghost', 'ghost-dark',
    'danger', 'danger-outline',
    'success',
    'icon-primary', 'icon-ghost', 'icon-danger'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  to: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button;
