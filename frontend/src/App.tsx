import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useAuthStore } from './store/authStore'
import darkTheme from './theme'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ModelBuilderPage from './pages/ModelBuilderPage'
import ModelViewPage from './pages/ModelViewPage'
import InferencePage from './pages/InferencePage'
import ModelOptimizationPage from './pages/ModelOptimizationPage'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Layout>
                  <DashboardPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/builder"
            element={
              isAuthenticated ? (
                <Layout>
                  <ModelBuilderPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/builder/:modelId"
            element={
              isAuthenticated ? (
                <Layout>
                  <ModelBuilderPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/model/:modelId"
            element={
              isAuthenticated ? (
                <Layout>
                  <ModelViewPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/inference"
            element={
              isAuthenticated ? (
                <Layout>
                  <InferencePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/optimize"
            element={
              isAuthenticated ? (
                <Layout>
                  <ModelOptimizationPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App

