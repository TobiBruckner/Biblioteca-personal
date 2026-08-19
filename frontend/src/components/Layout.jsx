import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const iconLibrary = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
)

const iconHome = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const iconInProgress = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const iconWishlist = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const iconCommunity = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const iconLogout = (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">📚 Mi Biblioteca</div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {iconHome} Panel Principal
          </NavLink>
          <NavLink to="/biblioteca" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {iconLibrary} Mi Biblioteca
          </NavLink>
          <NavLink to="/en-curso" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {iconInProgress} En Curso
          </NavLink>
          <NavLink to="/quiero-leer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {iconWishlist} Quiero Leer
          </NavLink>
          <NavLink to="/comunidad" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {iconCommunity} Comunidad
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-info">
            <div className="username">{usuario?.username}</div>
            <div className="email">{usuario?.email}</div>
          </div>
          <button className="nav-link" onClick={handleLogout}>
            {iconLogout} Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
