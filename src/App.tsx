import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingRoute from './components/LandingRoute'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import Layout from './components/Layout'
import ProtectedDashboardRoute from './components/ProtectedDashboardRoute'
import ProtectedProfileRoute from './components/ProtectedProfileRoute'
import PublicRoute from './components/PublicRoute'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'
import AdminPage from './pages/admin'
import DiscoverPage from './pages/discover'
import NotFoundPage from './pages/not-found'
import LoginPage from './pages/login'
import MessagesPage from './pages/messages'
import HomePage from './pages/home'
import NotificationsPage from './pages/notifications'
import ProfilePage from './pages/profile'
import RequestDetailsPage from './pages/request-details'
import RequestsPage from './pages/requests'
import SettingsPage from './pages/settings'
import SignupPage from './pages/signup'
import VerifyEmailPage from './pages/verify-email'
import DashboardPage from './pages/dashboard/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <LandingRoute>
                <HomePage />
              </LandingRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedProfileRoute>
                <ProfilePage />
              </ProtectedProfileRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedDashboardRoute>
                <DashboardPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedDashboardRoute>
                <RequestsPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <ProtectedDashboardRoute>
                <RequestDetailsPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedDashboardRoute>
                <DiscoverPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedDashboardRoute>
                <MessagesPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedDashboardRoute>
                <NotificationsPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedDashboardRoute>
                <SettingsPage />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <Toast />
    </BrowserRouter>
  )
}

export default App
