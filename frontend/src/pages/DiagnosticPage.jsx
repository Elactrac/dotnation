import { useApi } from '../contexts/ApiContext';
import { useCampaign } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

export default function DiagnosticPage() {
  const { api, contract, isReady, error } = useApi();
  const { campaigns, isLoading } = useCampaign();
  const { selectedAccount } = useWallet();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#1a1a1a', color: '#00ff00', minHeight: '100vh' }}>
      <h1>🔍 DotNation Diagnostic Page</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>API Status</h2>
        <p>✅ API Ready: {isReady ? 'YES' : 'NO'}</p>
        <p>✅ API Instance: {api ? 'CONNECTED' : 'NOT CONNECTED'}</p>
        <p>✅ API Error: {error || 'None'}</p>
        <p>✅ RPC Endpoint: {import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Contract Status</h2>
        <p>✅ Contract Instance: {contract ? 'LOADED' : 'NOT LOADED'}</p>
        <p>✅ Contract Address: {import.meta.env.VITE_CONTRACT_ADDRESS || 'NOT SET'}</p>
        {contract && (
          <>
            <p>✅ Contract Address (actual): {contract.address?.toString()}</p>
            <p>✅ Contract Methods: {Object.keys(contract.query).length} queries available</p>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Wallet Status</h2>
        <p>✅ Selected Account: {selectedAccount ? selectedAccount.address : 'NOT CONNECTED'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Campaigns Status</h2>
        <p>✅ Loading: {isLoading ? 'YES' : 'NO'}</p>
        <p>✅ Campaigns Count: {campaigns?.length || 0}</p>
        <p>✅ Mode: {contract ? 'BLOCKCHAIN' : 'MOCK STORAGE'}</p>
        {campaigns && campaigns.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h3>First Campaign:</h3>
            <pre style={{ background: '#3a3a3a', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
              {JSON.stringify(campaigns[0], (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
              , 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Environment Variables</h2>
        <p>VITE_NETWORK_NAME: {import.meta.env.VITE_NETWORK_NAME || 'Not set'}</p>
        <p>VITE_RPC_ENDPOINT: {import.meta.env.VITE_RPC_ENDPOINT || 'Not set'}</p>
        <p>VITE_CONTRACT_ADDRESS: {import.meta.env.VITE_CONTRACT_ADDRESS || 'Not set'}</p>
        <p>VITE_BACKEND_URL: {import.meta.env.VITE_BACKEND_URL || 'Not set'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Browser Console</h2>
        <p>⚠️ Check browser console (F12) for detailed logs</p>
        <p>Look for:</p>
        <ul>
          <li>[ApiContext] logs</li>
          <li>[CampaignContext] logs</li>
          <li>[WalletContext] logs</li>
        </ul>
      </div>
    </div>
  );
}
