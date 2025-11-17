import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext.jsx';
import { shortenAddress, formatDotBalance } from '../utils/formatters';

/**
 * A component that handles the user's wallet connection status and interactions.
 *
 * This component displays the current wallet connection state, including:
 * - A "Connect Wallet" button if no wallet is connected.
 * - A loading indicator while connecting.
 * - An error state with a retry button if the connection fails.
 * - The connected account's address and balance.
 * - A dropdown menu to switch between accounts or disconnect the wallet.
 *
 * It utilizes the `useWallet` hook to manage wallet state and actions.
 *
 * @returns {JSX.Element} The rendered wallet connection component.
 */
const WalletConnect = () => {
    const navigate = useNavigate();
    const { accounts, selectedAccount, connectWallet, disconnectWallet, switchAccount, isLoading, error, balance } = useWallet();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const menuRef = useRef(null);
    const triggerButtonRef = useRef(null);
    const menuItemsRef = useRef([]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isMenuOpen) return;

            const menuItemCount = accounts.length + 2; // accounts + View Profile + Disconnect

            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    setIsMenuOpen(false);
                    triggerButtonRef.current?.focus();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    setFocusedIndex((prev) => (prev + 1) % menuItemCount);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setFocusedIndex((prev) => (prev - 1 + menuItemCount) % menuItemCount);
                    break;
                case 'Home':
                    event.preventDefault();
                    setFocusedIndex(0);
                    break;
                case 'End':
                    event.preventDefault();
                    setFocusedIndex(menuItemCount - 1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen, accounts.length]);

    // Focus management when menu opens
    useEffect(() => {
        if (isMenuOpen) {
            setFocusedIndex(0);
            // Focus first menu item after a brief delay to ensure menu is rendered
            setTimeout(() => {
                menuItemsRef.current[0]?.focus();
            }, 10);
        }
    }, [isMenuOpen]);

    // Update focus when focusedIndex changes
    useEffect(() => {
        if (isMenuOpen && menuItemsRef.current[focusedIndex]) {
            menuItemsRef.current[focusedIndex].focus();
        }
    }, [focusedIndex, isMenuOpen]);

    if (isLoading) {
        return (
            <div 
                className="card px-4 py-2 text-body-sm text-text-secondary"
                role="status"
                aria-live="polite"
                aria-label="Connecting to wallet"
            >
                Connecting...
            </div>
        );
    }

    if (error) {
        return (
            <button 
                className="btn-primary" 
                onClick={connectWallet}
                aria-label="Retry wallet connection"
            >
                Retry
            </button>
        );
    }

    if (!selectedAccount) {
        return (
            <button 
                className="btn-primary" 
                onClick={connectWallet}
                aria-label="Connect your Polkadot wallet"
            >
                Connect Wallet
            </button>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                ref={triggerButtonRef}
                className="card px-4 py-2 text-body-sm hover:bg-surface/80 transition-colors cursor-pointer border-none bg-transparent"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label={`Wallet menu: ${formatDotBalance(balance)} balance, ${shortenAddress(selectedAccount.address)}`}
            >
                <span className="text-primary font-semibold">{formatDotBalance(balance)}</span>
                <span className="mx-2 text-text-muted">|</span>
                <strong className="text-text-primary">{shortenAddress(selectedAccount.address)}</strong>
                <span className="ml-2 text-text-secondary" aria-hidden="true">▼</span>
            </button>

            {isMenuOpen && (
                <div 
                    className="absolute top-full right-0 mt-2 w-80 bg-surface/95 backdrop-blur-xl rounded-lg border border-border shadow-hard z-50 overflow-hidden"
                    role="menu"
                    aria-label="Wallet options"
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-xs text-text-muted uppercase tracking-wider flex-shrink-0">Connected</span>
                            <button
                                ref={(el) => (menuItemsRef.current[0] = el)}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/profile');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsMenuOpen(false);
                                        navigate('/profile');
                                    }
                                }}
                                className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap flex-shrink-0"
                                role="menuitem"
                                aria-label="View your profile page"
                            >
                                View Profile →
                            </button>
                        </div>
                        <div className="min-w-0">
                            <strong className="text-sm text-text-primary block truncate">{selectedAccount.meta.name}</strong>
                            <span className="text-xs text-text-muted block truncate">{shortenAddress(selectedAccount.address)}</span>
                        </div>
                    </div>

                    {/* Account List */}
                    {accounts.length > 1 && (
                        <div className="max-h-64 overflow-y-auto overflow-x-hidden">
                            <div className="px-4 py-2 text-xs text-text-muted uppercase tracking-wider">
                                Switch Account ({accounts.length})
                            </div>
                            <div className="space-y-1" role="group" aria-label="Available accounts">
                                {accounts.map((account, index) => (
                                    <button
                                        key={account.address}
                                        ref={(el) => (menuItemsRef.current[index + 1] = el)}
                                        onClick={() => {
                                            switchAccount(account);
                                            setIsMenuOpen(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                switchAccount(account);
                                                setIsMenuOpen(false);
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-surface/50 transition-colors ${
                                            selectedAccount.address === account.address
                                                ? 'bg-primary/10 border-l-3 border-primary'
                                                : ''
                                        }`}
                                        role="menuitemradio"
                                        aria-checked={selectedAccount.address === account.address}
                                        aria-label={`Switch to account ${account.meta.name}, address ${shortenAddress(account.address)}`}
                                    >
                                        <div className="flex items-start justify-between gap-3 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-medium truncate ${
                                                    selectedAccount.address === account.address
                                                        ? 'text-primary'
                                                        : 'text-text-primary'
                                                }`}>
                                                    {account.meta.name}
                                                </div>
                                                <div className="text-xs text-text-muted truncate mt-0.5">
                                                    {shortenAddress(account.address)}
                                                </div>
                                            </div>
                                            {selectedAccount.address === account.address && (
                                                <span className="text-primary text-base flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-border">
                        <button
                            ref={(el) => (menuItemsRef.current[accounts.length + 1] = el)}
                            onClick={() => {
                                disconnectWallet();
                                setIsMenuOpen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    disconnectWallet();
                                    setIsMenuOpen(false);
                                }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors font-medium"
                            role="menuitem"
                            aria-label="Disconnect your wallet"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};




export default WalletConnect;