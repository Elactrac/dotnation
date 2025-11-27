import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ApiProvider } from './contexts/ApiContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import { CampaignProvider } from './contexts/CampaignContext.jsx';
import { BatchOperationsProvider } from './contexts/BatchOperationsContext.jsx';
import { NftProvider } from './contexts/NftContext.jsx';
import { MembershipProvider } from './contexts/MembershipContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeRouter from './components/ThemeRouter.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
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
const TermsPage = React.lazy(() => import('./pages/TermsPage.jsx'));
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

const SuspenseFallback = () => (
  <div className="flex justify-center items-center h-screen bg-background-dark">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

// Wrapper component to apply ThemeRouter to all routes
const RootLayout = () => {
  return (
    <ThemeRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Outlet />
      </Suspense>
    </ThemeRouter>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
          { index: true, element: <ProtectedRoute><CreateCampaignPage /></ProtectedRoute> },
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
          { index: true, element: <ProtectedRoute><MyCampaignsPage /></ProtectedRoute> },
        ],
      },
      {
        path: '/my-donations',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <ProtectedRoute><MyDonationsPage /></ProtectedRoute> },
        ],
      },
      {
        path: '/my-nfts',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <ProtectedRoute><MyNftsPage /></ProtectedRoute> },
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
          { index: true, element: <ProtectedRoute><BatchCampaignCreator /></ProtectedRoute> },
        ],
      },
      {
        path: '/batch-withdraw',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <ProtectedRoute><BatchWithdrawal /></ProtectedRoute> },
        ],
      },
      {
        path: '/admin/matching-pool',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <AdminRoute><MatchingPoolAdmin /></AdminRoute> },
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
          { index: true, element: <ProtectedRoute><UserProfilePage /></ProtectedRoute> },
        ],
      },
      {
        path: '/settings',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <ProtectedRoute><NewSettingsPage /></ProtectedRoute> },
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
        path: '/privacy',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <PrivacyPolicyPage /> },
        ],
      },
      {
        path: '/terms',
        element: <NewDashboardLayout />,
        children: [
          { index: true, element: <TermsPage /> },
        ],
      },
      {
        path: '/contact',
        element: <ContactPage />,
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
        element: <ProtectedRoute><MembersDashboard /></ProtectedRoute>,
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
        element: <ProtectedRoute><CreatorDashboard /></ProtectedRoute>,
      },
      {
        path: '/test/ipfs',
        element: <IPFSTest />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

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
        <ApiProvider>
          <WalletProvider>
            <CampaignProvider>
              <BatchOperationsProvider>
                <NftProvider>
                  <MembershipProvider>
                    <RouterProvider router={router} />
                  </MembershipProvider>
                </NftProvider>
              </BatchOperationsProvider>
            </CampaignProvider>
          </WalletProvider>
        </ApiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
