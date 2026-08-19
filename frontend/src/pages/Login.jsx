import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess({
        title: '¡Cuenta creada con éxito! 🎉',
        msg: location.state.username
          ? `Bienvenido/a @${location.state.username}. Ahora iniciá sesión.`
          : 'Ahora podés iniciar sesión con tu nueva cuenta.'
      })
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setLoading(true)

    try {
      const user = await login(form.login, form.password)

      if (user) {
        navigate('/biblioteca', { replace: true })
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 Bienvenido de nuevo</h1>
        <p className="subtitle">Inicia sesión para ver tu biblioteca personal</p>

        {success && (
          <div className="success-message" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{success.title}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>{success.msg}</div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario o Email</label>
            <input
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Tu usuario o email"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="form-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  )
}
