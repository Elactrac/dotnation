import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import CampaignsListPage from './pages/CampaignsListPage.jsx';
import CreateCampaignPage from './pages/CreateCampaignPage.jsx';
import CampaignDetailsPage from './pages/CampaignDetailsPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CampaignsListPage /> },
      { path: 'create-campaign', element: <CreateCampaignPage /> },
      { path: 'campaign/:id', element: <CampaignDetailsPage /> },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <WalletProvider>
          <CampaignProvider>
            <RouterProvider router={router} />
          </CampaignProvider>
        </WalletProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;
