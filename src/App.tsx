import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import DealDetailLayout from './layouts/DealDetailLayout';
import { DashboardLayoutSkeleton, DealDetailLayoutSkeleton, PageLoadingSkeleton } from './components/ui/skeleton';
import { RouteErrorBoundary } from './components/ui/error-boundary';

// Dashboard pages - lazy loaded
const DashboardHome = lazy(() => import('./routes/dashboard/DashboardHome'));
const Contacts = lazy(() => import('./routes/dashboard/Contacts'));
const ContactDetail = lazy(() => import('./routes/dashboard/ContactDetail'));
const Invoices = lazy(() => import('./routes/dashboard/Invoices'));
const Appointments = lazy(() => import('./routes/dashboard/Appointments'));
const Proposals = lazy(() => import('./routes/dashboard/Proposals'));
const Sales = lazy(() => import('./routes/dashboard/Sales'));
const Jobs = lazy(() => import('./routes/dashboard/Jobs'));
const JobsList = lazy(() => import('./routes/dashboard/JobsList'));
const JobsCalendar = lazy(() => import('./routes/dashboard/JobsCalendar'));
const Users = lazy(() => import('./routes/dashboard/Users'));
const Crews = lazy(() => import('./routes/dashboard/Crews'));
const Products = lazy(() => import('./routes/dashboard/Products'));
const Drips = lazy(() => import('./routes/dashboard/Drips'));
const CommunicationTemplates = lazy(() => import('./routes/dashboard/CommunicationTemplates'));
const CompanySettings = lazy(() => import('./routes/dashboard/CompanySettings'));

// Auth pages - lazy loaded
const Login = lazy(() => import('./routes/auth/Login'));
const ResetPassword = lazy(() => import('./routes/auth/ResetPassword'));
const AcceptInvite = lazy(() => import('./routes/auth/AcceptInvite'));

// Deal detail pages - lazy loaded
const DealDetail = lazy(() => import('./routes/deals/DealDetail'));
const DealInvoiceDetail = lazy(() => import('./routes/deals/DealInvoiceDetail'));
const DealProposalQuote = lazy(() => import('./routes/deals/DealProposalQuote'));

// Other pages - lazy loaded
const OrganizationSelect = lazy(() => import('./routes/OrganizationSelect'));
const CompanyProfile = lazy(() => import('./routes/CompanyProfile'));
const InvoiceShare = lazy(() => import('./routes/InvoiceShare'));
const ProposalShare = lazy(() => import('./routes/ProposalShare'));
const CustomerProposalView = lazy(() => import('./routes/CustomerProposalView'));
const WorkOrderDetails = lazy(() => import('./routes/WorkOrderDetails'));
const WorkOrderSecret = lazy(() => import('./routes/WorkOrderSecret'));

function App() {
  return (
    <RootLayout>
      <RouteErrorBoundary>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Login />
              </Suspense>
            } />
            <Route path="/auth/reset-password" element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <ResetPassword />
              </Suspense>
            } />
          </Route>

          <Route path="/auth/accept-invite" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <AcceptInvite />
            </Suspense>
          } />

          {/* Dashboard routes */}
          <Route element={
            <Suspense fallback={<DashboardLayoutSkeleton />}>
              <DashboardLayout />
            </Suspense>
          }>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:contactId" element={<ContactDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/list" element={<JobsList />} />
            <Route path="/jobs/calendar" element={<JobsCalendar />} />
            <Route path="/users" element={<Users />} />
            <Route path="/crews" element={<Crews />} />
            <Route path="/products" element={<Products />} />
            <Route path="/drips" element={<Drips />} />
            <Route path="/communication-templates" element={<CommunicationTemplates />} />
            <Route path="/company/settings" element={<CompanySettings />} />
          </Route>

          {/* Deal detail routes */}
          <Route element={
            <Suspense fallback={<DealDetailLayoutSkeleton />}>
              <DealDetailLayout />
            </Suspense>
          }>
            <Route path="/deals/:dealId" element={<DealDetail />} />
            <Route path="/deals/:dealId/invoices/:invoiceId" element={<DealInvoiceDetail />} />
            <Route path="/deals/:dealId/proposals/quote" element={<DealProposalQuote />} />
          </Route>

          {/* Other routes */}
          <Route path="/organizations/select" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <OrganizationSelect />
            </Suspense>
          } />
          <Route path="/company/profile" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <CompanyProfile />
            </Suspense>
          } />
          <Route path="/invoices/:shareId" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <InvoiceShare />
            </Suspense>
          } />
          <Route path="/proposals/:shareId" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <ProposalShare />
            </Suspense>
          } />
          <Route path="/p/:shareId" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <CustomerProposalView />
            </Suspense>
          } />
          <Route path="/workorders/details/:shareId" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <WorkOrderDetails />
            </Suspense>
          } />
          <Route path="/workorders/secret/:shareId" element={
            <Suspense fallback={<PageLoadingSkeleton />}>
              <WorkOrderSecret />
            </Suspense>
          } />
        </Routes>
      </RouteErrorBoundary>
    </RootLayout>
  );
}

export default App;
