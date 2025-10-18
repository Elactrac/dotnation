import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext.jsx';

const CreateCampaignPage = () => {
  const { api, selectedAccount } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [status, setStatus] = useState('');

  const handleCreateCampaign = async () => {
    if (!api || !selectedAccount) {
      setStatus('Please connect your wallet first.');
      return;
    }

    if (!title || !description || !goal || !deadline || !beneficiary) {
      setStatus('Please fill in all fields.');
      return;
    }

    setStatus('Creating campaign...');

    try {
      const goalInPlanck = BigInt(parseFloat(goal) * 1_000_000_000_000); // Assuming 12 decimals for DOT
      const deadlineInMs = new Date(deadline).getTime();

      const unsub = await api.tx.donationPlatform
        .createCampaign(title, description, goalInPlanck, deadlineInMs, beneficiary)
        .signAndSend(selectedAccount.address, (result) => {
          if (result.status.isInBlock) {
            setStatus(`Campaign created in block hash ${result.status.asInBlock}`);
            unsub();
          } else if (result.status.isFinalized) {
            setStatus(`Campaign finalized in block hash ${result.status.asFinalized}`);
          }
        });

    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Create a New Campaign</h2>
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Goal (in DOT):</label>
        <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
      </div>
      <div>
        <label>Deadline:</label>
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div>
        <label>Beneficiary Address:</label>
        <input type="text" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
      </div>
      <button onClick={handleCreateCampaign}>Create Campaign</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default CreateCampaignPage;
