import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/auth/Login'
import CoachDashboard from './pages/coach/CoachDashboard'
import PlayerDashboard from './pages/player/PlayerDashboard'
import ParentDashboard from './pages/parent/ParentDashboard'

function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  const redirectMap = { coach: '/coach', player: '/player', parent: '/parent' }
  return <Navigate to={redirectMap[profile?.role] ?? '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/coach/*"
        element={
          <ProtectedRoute requiredRole="coach">
            <CoachDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/player/*"
        element={
          <ProtectedRoute requiredRole="player">
            <PlayerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute requiredRole="parent">
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
