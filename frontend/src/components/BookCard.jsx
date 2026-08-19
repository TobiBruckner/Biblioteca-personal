export default function BookCard({ libroEstado, onEdit, onDelete }) {
  const { libro, estado, paginas_leidas, calificacion, favorito } = libroEstado
  const totalPaginas = libro?.paginas || 0
  const progreso = totalPaginas > 0 ? Math.min(100, Math.round((paginas_leidas / totalPaginas) * 100)) : 0

  const statusLabels = {
    leido: { icon: '✓', text: 'Leído', cls: 'status-leido' },
    en_curso: { icon: '⏳', text: 'En Curso', cls: 'status-en_curso' },
    quiero_leer: { icon: '📖', text: 'Quiero Leer', cls: 'status-quiero_leer' }
  }
  const status = statusLabels[estado] || statusLabels.quiero_leer

  const rating = typeof calificacion === 'number' ? Math.max(0, Math.min(5, Math.round(calificacion))) : 0
  const titulo = libro?.titulo || 'Sin título'
  const autor = libro?.autor || ''

  return (
    <div className="book-card">
      <div className="book-cover">
        {libro?.portada_url ? (
          <img
            src={libro.portada_url}
            alt={titulo}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="book-cover-placeholder">
            <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>📕</div>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              lineHeight: 1.15,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)'
            }}>
              {titulo}
            </div>
            {autor && (
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.85,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                por {autor}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="book-badges">
        {favorito && (
          <span className="book-badge-fav" title="Favorito">⭐</span>
        )}
        <span className={`book-badge-state ${status.cls}`}>
          {status.icon} {status.text}
        </span>
      </div>

      {(onEdit || onDelete) && (
        <div className="book-actions-whakoom">
          {onEdit && (
            <button
              className="book-btn-icon edit"
              onClick={() => onEdit(libroEstado)}
              title="Editar"
              type="button"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              className="book-btn-icon delete"
              onClick={() => window.confirm(`¿Eliminar "${titulo}" de tu biblioteca?`) && onDelete(libro.id)}
              title="Eliminar"
              type="button"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      <div className="book-overlay">
        <div className="book-overlay-title">{titulo}</div>
        {autor && <div className="book-overlay-author">por {autor}</div>}

        {rating > 0 && (
          <div className="book-overlay-stars" title={`${rating} / 5`}>
            {'★'.repeat(rating)}
            <span style={{ color: 'rgba(251, 191, 36, 0.3)' }}>{'☆'.repeat(5 - rating)}</span>
          </div>
        )}

        {estado === 'en_curso' && totalPaginas > 0 && (
          <>
            <div className="book-progress-inline">
              <div style={{ width: `${progreso}%` }} />
            </div>
            <div className="book-progress-meta">
              <span>{paginas_leidas}/{totalPaginas} pág.</span>
              <span>{progreso}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
