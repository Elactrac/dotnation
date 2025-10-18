import React, { useState, useEffect } from 'react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

const WalletConnect = ({ onAccountSelected }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const APP_NAME = 'DotNation';

    // This effect runs once on component mount to check for extensions
    // and automatically connect if the user has already given permissions.
    useEffect(() => {
        handleConnect();
    }, []);

    const handleConnect = async () => {
        try {
            const extensions = await web3Enable(APP_NAME);
            if (extensions.length === 0) {
                // No extension installed, or user denied access
                alert('Polkadot.js extension not found. Please install it to use this dApp.');
                return;
            }

            const allAccounts = await web3Accounts();
            setAccounts(allAccounts);

            // If there's only one account, auto-select it.
            if (allAccounts.length === 1) {
                handleAccountSelection(allAccounts[0]);
            }
        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    };

    const handleAccountSelection = (account) => {
        setSelectedAccount(account);
        if (onAccountSelected) {
            onAccountSelected(account);
        }
    };

    const handleDisconnect = () => {
        setSelectedAccount(null);
        setAccounts([]);
        if (onAccountSelected) {
            onAccountSelected(null);
        }
    };

    if (selectedAccount) {
        return (
            <div>
                <p>Connected: {selectedAccount.meta.name} ({selectedAccount.address.substring(0, 6)}...)</p>
                <button onClick={handleDisconnect}>Disconnect</button>
            </div>
        );
    }

    return (
        <div>
            {accounts.length > 0 ? (
                <div>
                    <p>Select an account:</p>
                    <select onChange={(e) => handleAccountSelection(accounts.find(acc => acc.address === e.target.value))}>
                        <option value="" disabled selected>Choose your account</option>
                        {accounts.map((acc) => (
                            <option key={acc.address} value={acc.address}>
                                {acc.meta.name} - {acc.address.substring(0, 8)}...
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <button onClick={handleConnect}>Connect Wallet</button>
            )}
        </div>
    );
};

export default WalletConnect;