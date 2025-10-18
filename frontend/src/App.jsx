import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Spinner } from '@chakra-ui/react';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DashboardLayout = React.lazy(() => import('./pages/DashboardLayout'));
const CampaignsListPage = React.lazy(() => import('./pages/CampaignsListPage.jsx'));
const CreateCampaignPage = React.lazy(() => import('./pages/CreateCampaignPage.jsx'));
const CampaignDetailsPage = React.lazy(() => import('./pages/CampaignDetailsPage.jsx'));

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

const SuspenseFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <Spinner size="xl" />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <WalletProvider>
          <CampaignProvider>
            <Suspense fallback={<SuspenseFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </CampaignProvider>
        </WalletProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;
