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
    const menuRef = useRef(null);

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

    if (isLoading) {
        return <div className="card px-4 py-2 text-body-sm text-text-secondary">Connecting...</div>;
    }

    if (error) {
        return <button className="btn-primary" onClick={connectWallet}>Retry</button>;
    }

    if (!selectedAccount) {
        return <button className="btn-primary" onClick={connectWallet}>Connect Wallet</button>;
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                className="card px-4 py-2 text-body-sm hover:bg-surface/80 transition-colors cursor-pointer border-none bg-transparent"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span className="text-primary font-semibold">{formatDotBalance(balance)}</span>
                <span className="mx-2 text-text-muted">|</span>
                <strong className="text-text-primary">{shortenAddress(selectedAccount.address)}</strong>
                <span className="ml-2 text-text-secondary">▼</span>
            </button>

            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-surface/95 backdrop-blur-xl rounded-lg border border-border shadow-hard z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-xs text-text-muted uppercase tracking-wider flex-shrink-0">Connected</span>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/profile');
                                }}
                                className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap flex-shrink-0"
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
                            <div className="space-y-1">
                                {accounts.map((account) => (
                                    <button
                                        key={account.address}
                                        onClick={() => {
                                            switchAccount(account);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-surface/50 transition-colors ${
                                            selectedAccount.address === account.address
                                                ? 'bg-primary/10 border-l-3 border-primary'
                                                : ''
                                        }`}
                                        title={`${account.meta.name} - ${account.address}`}
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
                                                <span className="text-primary text-base flex-shrink-0 mt-0.5">✓</span>
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
                            onClick={() => {
                                disconnectWallet();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors font-medium"
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