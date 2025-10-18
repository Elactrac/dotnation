import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '../contexts/CampaignContext.jsx';

const CampaignsListPage = () => {
  const { campaigns, isLoading, error } = useCampaign();

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>All Campaigns</h2>
      <Link to="/dashboard/create-campaign">Create a New Campaign</Link>
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <ul>
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link to={`/dashboard/campaign/${campaign.id}`}>
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <p>Goal: {Number(campaign.goal) / 1_000_000_000_000} DOT</p>
                <p>Raised: {Number(campaign.raised) / 1_000_000_000_000} DOT</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CampaignsListPage;