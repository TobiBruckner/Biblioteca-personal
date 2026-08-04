export default function BookCard({ libroEstado, onEdit, onDelete }) {
  const { libro, estado, paginas_leidas, calificacion, favorito } = libroEstado
  const totalPaginas = libro?.paginas || 0
  const progreso = totalPaginas > 0 ? Math.min(100, Math.round((paginas_leidas / totalPaginas) * 100)) : 0

  const statusLabels = {
    leido: { text: '✅ Leído', cls: 'status-leido' },
    en_curso: { text: '⏳ En Curso', cls: 'status-en_curso' },
    quiero_leer: { text: '📖 Quiero Leer', cls: 'status-quiero_leer' }
  }
  const status = statusLabels[estado] || statusLabels.quiero_leer

  return (
    <div className="book-card">
      <div className="book-cover">
        {libro?.portada_url ? (
          <img
            src={libro.portada_url}
            alt={libro.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="book-cover-placeholder">
            <div style={{ fontSize: '2.5rem' }}>📕</div>
            <div style={{ fontSize: '0.95rem' }}>{libro?.titulo}</div>
          </div>
        )}
      </div>

      <div className="book-info">
        <div className="book-title">{libro?.titulo}</div>
        <div className="book-author">por {libro?.autor}</div>
        <div className="book-meta">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`book-status ${status.cls}`}>{status.text}</span>
            {favorito && <span className="badge-fav">⭐ Favorito</span>}
          </div>

          {estado === 'en_curso' && totalPaginas > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                <span>Progreso</span>
                <span>{paginas_leidas}/{totalPaginas} ({progreso}%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}

          {calificacion && (
            <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
              {'★'.repeat(Math.round(calificacion))}{'☆'.repeat(5 - Math.round(calificacion))}
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px', fontSize: '0.75rem' }}>{calificacion}/5</span>
            </div>
          )}
        </div>
      </div>

      <div className="book-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(libroEstado)} style={{ flex: 1 }}>
          ✏️ Editar
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => window.confirm(`¿Eliminar "${libro?.titulo}" de tu biblioteca?`) && onDelete?.(libro.id)}
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
