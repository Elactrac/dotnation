import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext.jsx';
import { shortenAddress, formatDotBalance } from '../utils/formatters';

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
        return <div className="user-wallet">Connecting...</div>;
    }

    if (error) {
        return <button className="btn-primary" onClick={connectWallet}>Retry</button>;
    }

    if (!selectedAccount) {
        return <button className="btn-primary" onClick={connectWallet}>Connect Wallet</button>;
    }

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <button className="user-wallet" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ cursor: 'pointer', border: 'none' }}>
                <span>{formatDotBalance(balance)}</span>
                <span style={{ margin: '0 8px' }}>|</span>
                <strong>{shortenAddress(selectedAccount.address)}</strong>
                <span style={{ marginLeft: '8px' }}>&#9662;</span>
            </button>

            {isMenuOpen && (
                <div style={menuStyles}>
                    <div style={menuHeaderStyle}>Connected as: <strong>{selectedAccount.meta.name}</strong></div>
                    {accounts.map((account) => (
                        <button
                            key={account.address}
                            onClick={() => switchAccount(account)}
                            style={selectedAccount.address === account.address ? { ...menuItemStyle, ...activeMenuItemStyle } : menuItemStyle}
                        >
                            {account.meta.name} ({shortenAddress(account.address)})
                        </button>
                    ))}
                    <button onClick={disconnectWallet} style={{ ...menuItemStyle, ...dangerMenuItemStyle }}>
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

// Inline styles for the dropdown menu to match the new theme
const menuStyles = {
    position: 'absolute',
    top: '120%',
    right: 0,
    backgroundColor: '#12142B',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    zIndex: 110,
    minWidth: '250px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
};

const menuHeaderStyle = {
    padding: '8px 12px',
    fontSize: '0.9rem',
    color: 'var(--secondary-text)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '4px',
};

const menuItemStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--primary-text)',
    padding: '10px 12px',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s ease',
};

const activeMenuItemStyle = {
    backgroundColor: 'rgba(230, 0, 122, 0.2)', // Primary accent with transparency
    fontWeight: 'bold',
};

const dangerMenuItemStyle = {
    color: '#E53E3E',
};


export default WalletConnect;