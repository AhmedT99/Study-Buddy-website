import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedDashboardRoute from './components/ProtectedDashboardRoute'
import ProtectedProfileRoute from './components/ProtectedProfileRoute'
import PublicRoute from './components/PublicRoute'
import LoginPage from './pages/login'
import ProfilePage from './pages/profile'
import SignupPage from './pages/signup'
import DashboardPage from './pages/dashboard/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
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
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
