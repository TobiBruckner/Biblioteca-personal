import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usuariosAPI } from '../services/api.js'

export default function Community() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('usuario') || 'null')
      if (u) setMyId(u.id)
    } catch {}
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const lista = await usuariosAPI.listar(search.trim())
      setUsuarios(lista)
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || err.message || 'Error al cargar la comunidad'
      const status = err.response?.status
      setError({
        msg,
        status,
        hint: (status === 404 || !status) ? 'Si estás en producción probablemente el backend no tiene el blueprint "usuarios" deployado todavía. Asegurate de hacer Manual Deploy en Render del último commit.' : 'Revisá que el backend esté funcionando correctamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(), 350)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👥 Comunidad</h1>
          <p>Explora las bibliotecas de otros lectores ({usuarios.length} usuarios)</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="🔍 Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              minWidth: '260px'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando comunidad...</div>
      ) : error ? (
        <div className="stat-card">
          <h3 style={{ color: 'var(--color-danger)', marginBottom: '8px' }}>⚠️ {error.msg}</h3>
          {error.status && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Código de respuesta: <b>HTTP {error.status}</b>
            </p>
          )}
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            💡 {error.hint}
          </p>
          <button className="btn btn-primary" onClick={load}>🔄 Reintentar</button>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <h3>👤 Todavía no hay usuarios</h3>
          <p>Invita a tus amigos para que se registren y compartan sus bibliotecas.</p>
        </div>
      ) : (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {usuarios.map((u) => {
            const stats = u.estadisticas || {}
            const esYo = u.id === myId
            const displayName = u.nombre_completo || u.username || 'Usuario'
            return (
              <div key={u.id} className="stat-card" style={{ cursor: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '1.1rem',
                      flexShrink: 0
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                        {displayName}
                        {esYo && (
                          <span className="badge-fav" style={{ marginLeft: '8px' }}>Tú</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        @{u.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px', marginBottom: '14px', padding: '12px 0',
                  borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)'
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
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.8rem', color: 'var(--color-text-muted)',
                  marginBottom: '14px'
                }}>
                  <span>🎯 Quiere leer: <b style={{ color: 'var(--color-text)' }}>{stats.quiero_leer || 0}</b></span>
                  <span>⭐ Favoritos: <b style={{ color: 'var(--color-text)' }}>{stats.favoritos || 0}</b></span>
                </div>

                {stats.promedio_calificacion != null && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--color-text-muted)',
                    marginBottom: '14px'
                  }}>
                    📊 Promedio de calificación: <b style={{ color: '#fbbf24' }}>{stats.promedio_calificacion.toFixed(2)} / 5</b>
                  </div>
                )}

                <Link
                  to={esYo ? '/biblioteca' : `/usuario/${u.id}/biblioteca`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  🔖 {esYo ? 'Ir a mi biblioteca' : `Ver biblioteca de ${displayName.split(' ')[0]}`}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
