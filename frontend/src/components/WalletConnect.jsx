import { useState, useRef, useEffect } from 'react';
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
                <div className="absolute top-full right-0 mt-2 card min-w-64 shadow-hard z-50">
                    <div className="px-4 py-2 text-body-sm text-text-secondary border-b border-border">
                        Connected as: <strong className="text-text-primary">{selectedAccount.meta.name}</strong>
                    </div>
                    <div className="py-2">
                        {accounts.map((account) => (
                            <button
                                key={account.address}
                                onClick={() => switchAccount(account)}
                                className={`w-full text-left px-4 py-2 text-body-sm hover:bg-surface transition-colors ${
                                    selectedAccount.address === account.address
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-text-primary'
                                }`}
                            >
                                {account.meta.name} ({shortenAddress(account.address)})
                            </button>
                        ))}
                        <button
                            onClick={disconnectWallet}
                            className="w-full text-left px-4 py-2 text-body-sm text-error hover:bg-error/10 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};




export default WalletConnect;