/**
 * Keyboard Navigation Hook
 * 
 * Provides keyboard navigation utilities for custom components
 * Handles Escape key, Tab trapping, and arrow key navigation
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook to handle Escape key press
 * @param {Function} onEscape - Callback to execute when Escape is pressed
 * @param {boolean} enabled - Whether the hook is enabled
 */
export const useEscapeKey = (onEscape, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape, enabled]);
};

/**
 * Hook to trap focus within a container (for modals/dialogs)
 * @param {boolean} enabled - Whether focus trap is enabled
 * @returns {Object} - Ref to attach to container element
 */
export const useFocusTrap = (enabled = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement?.focus();

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [enabled]);

  return containerRef;
};

/**
 * Hook for arrow key navigation in lists
 * @param {number} itemCount - Number of items in the list
 * @param {Function} onSelect - Callback when item is selected (Enter/Space)
 * @param {boolean} enabled - Whether navigation is enabled
 * @returns {Object} - { selectedIndex, setSelectedIndex, listRef }
 */
export const useArrowNavigation = (itemCount, onSelect, enabled = true) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        event.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setSelectedIndex(itemCount - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(selectedIndex);
        break;
      default:
        break;
    }
  }, [itemCount, onSelect, enabled, selectedIndex]);

  useEffect(() => {
    if (!enabled || !listRef.current) return;

    const listElement = listRef.current;
    listElement.addEventListener('keydown', handleKeyDown);
    
    return () => listElement.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return { selectedIndex, setSelectedIndex, listRef };
};

/**
 * Hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callbacks
 * @param {boolean} enabled - Whether shortcuts are enabled
 * 
 * Example:
 * useKeyboardShortcuts({
 *   'ctrl+k': openSearch,
 *   'ctrl+s': save,
 *   '?': showHelp
 * })
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      let combo = '';
      if (ctrl) combo += 'ctrl+';
      if (shift) combo += 'shift+';
      if (alt) combo += 'alt+';
      combo += key;

      const callback = shortcuts[combo] || shortcuts[key];
      if (callback) {
        event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
};

/**
 * Hook to restore focus when a component unmounts
 * Useful for modals/dialogs that need to return focus to trigger element
 * @returns {Object} - { saveFocus, restoreFocus }
 */
export const useFocusRestore = () => {
  const previousFocus = useRef(null);

  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousFocus.current?.focus();
    previousFocus.current = null;
  }, []);

  useEffect(() => {
    return () => {
      // Restore focus on unmount
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, []);

  return { saveFocus, restoreFocus };
};

export default {
  useEscapeKey,
  useFocusTrap,
  useArrowNavigation,
  useKeyboardShortcuts,
  useFocusRestore
};
