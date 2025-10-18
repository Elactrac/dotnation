import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Spinner } from '@chakra-ui/react';
import { initSentry } from './utils/sentry';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DashboardLayout = React.lazy(() => import('./pages/DashboardLayout'));
const CampaignsListPage = React.lazy(() => import('./pages/CampaignsListPage.jsx'));
const CreateCampaignPage = React.lazy(() => import('./pages/CreateCampaignPage.jsx'));
const CampaignDetailsPage = React.lazy(() => import('./pages/CampaignDetailsPage.jsx'));
const MyCampaignsPage = React.lazy(() => import('./pages/MyCampaignsPage.jsx'));
const MyDonationsPage = React.lazy(() => import('./pages/MyDonationsPage.jsx'));
const BrowseCampaignsPage = React.lazy(() => import('./pages/BrowseCampaignsPage.jsx'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage.jsx'));

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
       { path: 'my-campaigns', element: <MyCampaignsPage /> },
       { path: 'my-donations', element: <MyDonationsPage /> },
       { path: 'browse', element: <BrowseCampaignsPage /> },
       { path: 'profile', element: <UserProfilePage /> },
     ],
   },
]);

const SuspenseFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <Spinner size="xl" />
  </Box>
);

// Initialize Sentry on app start
initSentry();

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send error to Sentry with React context
        import('./utils/sentry').then(({ trackError }) => {
          trackError(error, {
            extra: {
              componentStack: errorInfo.componentStack,
              errorBoundary: true,
            },
            tags: {
              error_source: 'error_boundary',
            },
          });
        });
      }}
    >
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
