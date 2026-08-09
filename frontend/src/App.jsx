import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Biblioteca from './pages/Biblioteca.jsx'
import EnCurso from './pages/EnCurso.jsx'
import QuieroLeer from './pages/QuieroLeer.jsx'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <p>Cargando...</p>

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <p>Cargando...</p>

  return !isAuthenticated
    ? children
    : <Navigate to="/biblioteca" replace />
}

export default function App() {
  return (
    <Routes>

      {/* Rutas públicas */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />

      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />

      {/* Rutas privadas */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="en-curso" element={<EnCurso />} />
        <Route path="quiero-leer" element={<QuieroLeer />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}