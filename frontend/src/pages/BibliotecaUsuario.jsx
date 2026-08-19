import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usuariosAPI } from '../services/api.js'
import BookList from '../components/BookList.jsx'

const FILTROS_ESTADO = [
  { key: '', label: '📚 Todos' },
  { key: 'leido', label: '✅ Leídos' },
  { key: 'en_curso', label: '⏳ En Curso' },
  { key: 'quiero_leer', label: '📖 Quiero Leer' }
]

export default function BibliotecaUsuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const usuarioId = parseInt(id, 10)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [favoritos, setFavoritos] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (estado) params.estado = estado
      if (favoritos) params.favorito = 'true'
      const respuesta = await usuariosAPI.biblioteca(usuarioId, params)
      setData(respuesta)
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cargar la biblioteca'
      setError(msg)
      if (err.response?.status === 404) {
        // nada
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [usuarioId])
  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search, estado, favoritos])

  const perfil = data?.usuario
  const libros = data?.libros || []
  const stats = perfil?.estadisticas || {}
  const esMia = !!data?.es_mi_biblioteca

  if (loading) {
    return <div className="loading">Cargando biblioteca...</div>
  }

  if (error && !data) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>❌ {error}</h1>
            <p>No se pudo cargar la biblioteca solicitada.</p>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>⬅️ Volver</button>
            <Link to="/comunidad" className="btn btn-primary" style={{ marginLeft: '8px' }}>👥 Ir a Comunidad</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>⬅️ Atrás</button>
        <Link to="/comunidad" className="btn btn-secondary">👥 Comunidad</Link>
        {esMia && (
          <Link to="/biblioteca" className="btn btn-primary">✏️ Editar mi biblioteca</Link>
        )}
      </div>

      <div className="stat-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '1.5rem', flexShrink: 0
            }}>
              {(perfil?.nombre_completo || perfil?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, maxWidth: '500px' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>
                📚 Biblioteca de {perfil?.nombre_completo || perfil?.username}
                {esMia && <span className="badge-fav" style={{ marginLeft: '10px' }}>Tú</span>}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                @{perfil?.username}
                {perfil?.email && <> — <span style={{ color: 'var(--color-text)' }}>{perfil.email}</span></>}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '12px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.4rem', fontWeight: '800',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.total_libros || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Libros</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)' }}>{stats.leidos || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leídos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-warning)' }}>{stats.en_curso || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>En Curso</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stats.quiero_leer || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quiero Leer</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ec4899' }}>{stats.favoritos || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Favoritos</div>
            </div>
          </div>
        </div>

        {stats.promedio_calificacion != null && (
          <div style={{
            marginTop: '16px', paddingTop: '14px',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.9rem', color: 'var(--color-text-muted)'
          }}>
            📊 Calificación promedio del usuario: <b style={{ color: '#fbbf24', fontSize: '1rem' }}>{stats.promedio_calificacion.toFixed(2)} / 5</b>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex', background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          {FILTROS_ESTADO.map(f => (
            <button
              key={f.key}
              onClick={() => setEstado(f.key)}
              style={{
                padding: '8px 14px', border: 'none',
                color: estado === f.key ? 'white' : 'var(--color-text-muted)',
                fontSize: '0.85rem', fontWeight: estado === f.key ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: estado === f.key
                  ? ''
                  : 'transparent',
                backgroundImage: estado === f.key
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                  : 'none'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', fontSize: '0.9rem'
        }}>
          <input
            type="checkbox"
            checked={favoritos}
            onChange={(e) => setFavoritos(e.target.checked)}
            style={{ accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
          />
          ⭐ Solo favoritos
        </label>

        <input
          type="text"
          placeholder="🔍 Buscar por título o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            fontSize: '0.9rem',
            minWidth: '180px',
            width: '100%',
            maxWidth: '320px',
            marginLeft: 'auto'
          }}
        />
      </div>

      <BookList
        libros={libros}
        emptyTitle={search || estado || favoritos
          ? '🔎 No hay libros que coincidan con los filtros'
          : `📭 La biblioteca de ${(perfil?.nombre_completo || perfil?.username || 'este usuario').split(' ')[0]} está vacía`
        }
        emptyMsg={search || estado || favoritos
          ? 'Prueba con otros filtros o una búsqueda diferente.'
          : 'Aún no ha agregado ningún libro a su colección.'
        }
      />
    </div>
  )
}
