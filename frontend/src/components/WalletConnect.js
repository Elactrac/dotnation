import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import './WalletConnect.css';

const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const WalletConnect = () => {
  const { accounts, selectedAccount, connectWallet, disconnectWallet, switchAccount, isLoading, error } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      alert('Wallet connected successfully!');
    } catch (err) {
      alert('Connection failed: ' + err.message);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowMenu(false);
    alert('Wallet disconnected');
  };

  const handleSwitchAccount = (account) => {
    switchAccount(account);
    setShowMenu(false);
  };

  if (isLoading) {
    return <button className="btn btn-primary" disabled>Connecting...</button>;
  }

  if (error) {
    return <button className="btn btn-primary" onClick={handleConnect}>Retry Connection</button>;
  }

  if (!selectedAccount) {
    return <button className="btn btn-primary" onClick={handleConnect}>Connect Wallet</button>;
  }

  return (
    <div className="wallet-menu">
      <button className="btn btn-primary" onClick={() => setShowMenu(!showMenu)}>
        {shortenAddress(selectedAccount.address)} &#9662;
      </button>

      {showMenu && (
        <div className="menu-content">
          {accounts.map((account) => (
            <button
              key={account.address}
              className="menu-item"
              onClick={() => handleSwitchAccount(account)}
              style={{ fontWeight: selectedAccount.address === account.address ? 'bold' : 'normal' }}
            >
              <div>{account.meta.name}</div>
              <div className="text-sm">{shortenAddress(account.address)}</div>
            </button>
          ))}
          <button className="menu-item danger" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
