import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ApiProvider } from './contexts/ApiContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import { BatchOperationsProvider } from './contexts/BatchOperationsContext.jsx';
import { NftProvider } from './contexts/NftContext.jsx';
import { MembershipProvider } from './contexts/MembershipContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeRouter from './components/ThemeRouter.jsx';
import { initSentry, trackError } from './utils/sentry';

const NewLandingPage = React.lazy(() => import('./pages/NewLandingPage'));
const NewDashboardLayout = React.lazy(() => import('./pages/NewDashboardLayout'));
const NewDashboardPage = React.lazy(() => import('./pages/NewDashboardPage'));
const NewSettingsPage = React.lazy(() => import('./pages/NewSettingsPage'));
const CampaignsListPage = React.lazy(() => import('./pages/CampaignsListPage.jsx'));
const CreateCampaignPage = React.lazy(() => import('./pages/CreateCampaignPage.jsx'));
const CampaignDetailsPage = React.lazy(() => import('./pages/CampaignDetailsPage.jsx'));
const MyCampaignsPage = React.lazy(() => import('./pages/MyCampaignsPage.jsx'));
const MyDonationsPage = React.lazy(() => import('./pages/MyDonationsPage.jsx'));
const MyNftsPage = React.lazy(() => import('./pages/MyNftsPage.jsx'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage.jsx'));
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
const MatchingPoolAdmin = React.lazy(() => import('./components/MatchingPoolAdmin.jsx'));
const DiagnosticPage = React.lazy(() => import('./pages/DiagnosticPage.jsx'));
const MembersLandingPage = React.lazy(() => import('./pages/MembersLandingPage.jsx'));
const MembersPage = React.lazy(() => import('./pages/MembersPage.jsx'));
const MembersDashboard = React.lazy(() => import('./pages/MembersDashboard.jsx'));
const CreatorProfilePage = React.lazy(() => import('./pages/CreatorProfilePage.jsx'));
const CreatorFeed = React.lazy(() => import('./components/CreatorFeed.jsx'));
const CreatorDashboard = React.lazy(() => import('./pages/CreatorDashboard.jsx'));
const IPFSTest = React.lazy(() => import('./components/IPFSTest.jsx'));

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
      {
        index: true,
        element: (
          <ErrorBoundary>
            <CampaignDetailsPage />
          </ErrorBoundary>
        )
      },
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
    path: '/my-nfts',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <MyNftsPage /> },
    ],
  },
  {
    path: '/leaderboard',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <LeaderboardPage /> },
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
    path: '/admin/matching-pool',
    element: <NewDashboardLayout />,
    children: [
      { index: true, element: <MatchingPoolAdmin /> },
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
    path: '/diagnostic',
    element: <DiagnosticPage />,
  },
  {
    path: '/members',
    element: <MembersLandingPage />,
  },
  {
    path: '/members/browse',
    element: <MembersPage />,
  },
  {
    path: '/members/dashboard',
    element: <MembersDashboard />,
  },
  {
    path: '/members/:creatorId',
    element: <CreatorProfilePage />,
  },
  {
    path: '/members/feed/:creatorId',
    element: <CreatorFeed />,
  },
  {
    path: '/creator/dashboard',
    element: <CreatorDashboard />,
  },
  {
    path: '/test/ipfs',
    element: <IPFSTest />,
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
        trackError(error, {
          extra: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          },
          tags: {
            error_source: 'error_boundary',
          },
        });
      }}
    >
      <ThemeProvider>
        <ThemeRouter>
          <ApiProvider>
            <WalletProvider>
              <CampaignProvider>
                <BatchOperationsProvider>
                  <NftProvider>
                    <MembershipProvider>
                      <Suspense fallback={<SuspenseFallback />}>
                        <RouterProvider router={router} />
                      </Suspense>
                    </MembershipProvider>
                  </NftProvider>
                </BatchOperationsProvider>
              </CampaignProvider>
            </WalletProvider>
          </ApiProvider>
        </ThemeRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;