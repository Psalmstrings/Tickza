import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Auth
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Main pages
import HomePage from './pages/home/HomePage.jsx';
import ExplorePage from './pages/explore/ExplorePage.jsx';
import EventDetailPage from './pages/events/EventDetailPage.jsx';
import CreateEventPage from './pages/events/CreateEventPage.jsx';
import MyEventsPage from './pages/events/MyEventsPage.jsx';
import MyTicketsPage from './pages/tickets/MyTicketsPage.jsx';
import TicketDetailPage from './pages/tickets/TicketDetailPage.jsx';
import TransfersPage from './pages/transfers/TransfersPage.jsx';
import ResalePage from './pages/resale/ResalePage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import QRScannerPage from './pages/scan/QRScannerPage.jsx';

import ForYouPage from './pages/forYou/ForYouPage.jsx';

// Admin
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminStatsPage from './pages/admin/AdminStatsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminEventsPage from './pages/admin/AdminEventsPage.jsx';
import AdminTicketsPage from './pages/admin/AdminTicketsPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';

// Organizer Command Center
import OrganizerLayout from './pages/organizer/OrganizerLayout.jsx';
import OrganizerOverviewPage from './pages/organizer/OrganizerOverviewPage.jsx';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage.jsx';
import OrganizerEventDetailPage from './pages/organizer/OrganizerEventDetailPage.jsx';
import OrganizerTicketsPage from './pages/organizer/OrganizerTicketsPage.jsx';
import OrganizerOrdersPage from './pages/organizer/OrganizerOrdersPage.jsx';
import OrganizerAttendeesPage from './pages/organizer/OrganizerAttendeesPage.jsx';
import OrganizerCheckInPage from './pages/organizer/OrganizerCheckInPage.jsx';
import OrganizerAnalyticsPage from './pages/organizer/OrganizerAnalyticsPage.jsx';
import OrganizerPromosPage from './pages/organizer/OrganizerPromosPage.jsx';
import OrganizerMarketingPage from './pages/organizer/OrganizerMarketingPage.jsx';
import OrganizerPayoutsPage from './pages/organizer/OrganizerPayoutsPage.jsx';
import OrganizerTeamPage from './pages/organizer/OrganizerTeamPage.jsx';
import OrganizerReportsPage from './pages/organizer/OrganizerReportsPage.jsx';
import OrganizerSettingsPage from './pages/organizer/OrganizerSettingsPage.jsx';
import OrganizerEditEventPage from './pages/organizer/OrganizerEditEventPage.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#F5F5F5',
              position: 'relative',
              overflowX: 'hidden',
            }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Discovery routes (Publicly accessible) */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />

                {/* Authenticated user routes */}
                <Route path="/for-you" element={<ProtectedRoute><ForYouPage /></ProtectedRoute>} />
                <Route path="/create" element={<ProtectedRoute requireApproved><CreateEventPage /></ProtectedRoute>} />
                <Route path="/my-events" element={<Navigate to="/organizer/events" replace />} />
                <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
                <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
                <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
                <Route path="/resale" element={<ProtectedRoute><ResalePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/scan" element={<ProtectedRoute><QRScannerPage /></ProtectedRoute>} />

                {/* Organizer Command Center */}
                <Route path="/organizer" element={<ProtectedRoute><OrganizerLayout /></ProtectedRoute>}>
                  <Route index element={<OrganizerOverviewPage />} />
                  <Route path="events" element={<OrganizerEventsPage />} />
                  <Route path="events/:id" element={<OrganizerEventDetailPage />} />
                  <Route path="events/:id/edit" element={<OrganizerEditEventPage />} />
                  <Route path="create" element={<CreateEventPage />} />
                  <Route path="tickets" element={<OrganizerTicketsPage />} />
                  <Route path="orders" element={<OrganizerOrdersPage />} />
                  <Route path="attendees" element={<OrganizerAttendeesPage />} />
                  <Route path="checkin" element={<OrganizerCheckInPage />} />
                  <Route path="analytics" element={<OrganizerAnalyticsPage />} />
                  <Route path="promos" element={<OrganizerPromosPage />} />
                  <Route path="marketing" element={<OrganizerMarketingPage />} />
                  <Route path="payouts" element={<OrganizerPayoutsPage />} />
                  <Route path="team" element={<OrganizerTeamPage />} />
                  <Route path="reports" element={<OrganizerReportsPage />} />
                  <Route path="settings" element={<OrganizerSettingsPage />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminStatsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="tickets" element={<AdminTicketsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="logs" element={<AdminLogsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
