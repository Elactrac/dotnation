import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import { BatchOperationsProvider } from './contexts/BatchOperationsContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { initSentry } from './utils/sentry';

const NewLandingPage = React.lazy(() => import('./pages/NewLandingPage'));
const NewDashboardLayout = React.lazy(() => import('./pages/NewDashboardLayout'));
const NewDashboardPage = React.lazy(() => import('./pages/NewDashboardPage'));
const NewSettingsPage = React.lazy(() => import('./pages/NewSettingsPage'));
const CampaignsListPage = React.lazy(() => import('./pages/CampaignsListPage.jsx'));
const CreateCampaignPage = React.lazy(() => import('./pages/CreateCampaignPage.jsx'));
const CampaignDetailsPage = React.lazy(() => import('./pages/CampaignDetailsPage.jsx'));
const MyCampaignsPage = React.lazy(() => import('./pages/MyCampaignsPage.jsx'));
const MyDonationsPage = React.lazy(() => import('./pages/MyDonationsPage.jsx'));
const BrowseCampaignsPage = React.lazy(() => import('./pages/BrowseCampaignsPage.jsx'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage.jsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('./pages/SignupPage.jsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.jsx'));
const BatchCampaignCreator = React.lazy(() => import('./components/BatchCampaignCreator.jsx'));
const BatchWithdrawal = React.lazy(() => import('./components/BatchWithdrawal.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <NewLandingPage />,
  },
  {
    path: '/dashboard',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <NewDashboardPage /> },
    ],
  },
  {
    path: '/campaigns',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <CampaignsListPage /> },
    ],
  },
  {
    path: '/create-campaign',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <CreateCampaignPage /> },
    ],
  },
  {
    path: '/campaign/:id',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <CampaignDetailsPage /> },
    ],
  },
  {
    path: '/my-campaigns',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <MyCampaignsPage /> },
    ],
  },
  {
    path: '/my-donations',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <MyDonationsPage /> },
    ],
  },
  {
    path: '/batch-create',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <BatchCampaignCreator /> },
    ],
  },
  {
    path: '/batch-withdraw',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <BatchWithdrawal /> },
    ],
  },
  {
    path: '/browse',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <BrowseCampaignsPage /> },
    ],
  },
  {
    path: '/profile',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <UserProfilePage /> },
    ],
  },
   {
     path: '/settings',
     element: <NewDashboardLayout />,
     children: [
       { index: true, element: <NewSettingsPage /> },
     ],
   },
    {
      path: '/about',
      element: <NewDashboardLayout />,
      children: [
        { index: true, element: <AboutPage /> },
      ],
    },
   {
     path: '/contact',
     element: <ContactPage />,
   },
   {
     path: '/privacy',
     element: <NewDashboardLayout />,
     children: [
       { index: true, element: <PrivacyPolicyPage /> },
     ],
   },
   {
     path: '/login',
     element: <LoginPage />,
   },
   {
     path: '/signup',
     element: <SignupPage />,
   },
   {
     path: '*',
     element: <NotFoundPage />,
   },
 ]);

const SuspenseFallback = () => (
  <div className="flex justify-center items-center h-screen bg-background-dark">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

// Initialize Sentry on app start (with error handling)
try {
  initSentry();
} catch (err) {
  console.warn('Failed to initialize Sentry:', err);
}

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
            <BatchOperationsProvider>
              <Suspense fallback={<SuspenseFallback />}>
                <RouterProvider router={router} />
              </Suspense>
            </BatchOperationsProvider>
          </CampaignProvider>
        </WalletProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;