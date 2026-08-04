import { useState, useEffect } from 'react'
import api from '../services/api.js'

export default function BookModal({ isOpen, onClose, onSaved, libroEstado = null }) {
  const isEditing = !!libroEstado
  const libro = libroEstado?.libro || {}

  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    genero: '',
    sinopsis: '',
    paginas: '',
    anio_publicacion: '',
    editorial: '',
    portada_url: '',
    estado: 'quiero_leer',
    paginas_leidas: '',
    calificacion: '',
    resena: '',
    favorito: false,
    fecha_inicio: '',
    fecha_fin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing && libroEstado) {
      setForm({
        titulo: libro.titulo || '',
        autor: libro.autor || '',
        isbn: libro.isbn || '',
        genero: libro.genero || '',
        sinopsis: libro.sinopsis || '',
        paginas: libro.paginas || '',
        anio_publicacion: libro.anio_publicacion || '',
        editorial: libro.editorial || '',
        portada_url: libro.portada_url || '',
        estado: libroEstado.estado || 'quiero_leer',
        paginas_leidas: libroEstado.paginas_leidas || '',
        calificacion: libroEstado.calificacion || '',
        resena: libroEstado.resena || '',
        favorito: !!libroEstado.favorito,
        fecha_inicio: libroEstado.fecha_inicio || '',
        fecha_fin: libroEstado.fecha_fin || ''
      })
    } else if (isOpen) {
      setForm({
        titulo: '', autor: '', isbn: '', genero: '', sinopsis: '',
        paginas: '', anio_publicacion: '', editorial: '', portada_url: '',
        estado: 'quiero_leer', paginas_leidas: '', calificacion: '',
        resena: '', favorito: false, fecha_inicio: '', fecha_fin: ''
      })
    }
  }, [isOpen, libroEstado, isEditing])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleRating = (stars) => {
    setForm({ ...form, calificacion: stars })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      ...form,
      paginas: form.paginas ? parseInt(form.paginas) : null,
      anio_publicacion: form.anio_publicacion ? parseInt(form.anio_publicacion) : null,
      paginas_leidas: form.paginas_leidas ? parseInt(form.paginas_leidas) : 0,
      calificacion: form.calificacion ? parseFloat(form.calificacion) : null
    }

    try {
      if (isEditing) {
        await api.put(`/libros/${libro.id}`, payload)
      } else {
        await api.post('/libros', payload)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '📝 Editar Libro' : '➕ Agregar Libro'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Autor *</label>
            <input type="text" name="autor" value={form.autor} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>ISBN</label>
              <input type="text" name="isbn" value={form.isbn} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Género</label>
              <input type="text" name="genero" value={form.genero} onChange={handleChange} placeholder="Ej: Novela, Ciencia Ficción..." />
            </div>
          </div>

          <div className="form-group">
            <label>Sinopsis</label>
            <textarea name="sinopsis" value={form.sinopsis} onChange={handleChange} rows={3} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Páginas</label>
              <input type="number" min="0" name="paginas" value={form.paginas} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Año Publicación</label>
              <input type="number" min="0" name="anio_publicacion" value={form.anio_publicacion} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Editorial</label>
              <input type="text" name="editorial" value={form.editorial} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>URL Portada</label>
            <input type="url" name="portada_url" value={form.portada_url} onChange={handleChange} placeholder="https://..." />
          </div>

          <hr style={{ borderColor: 'var(--color-border)', margin: '20px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="quiero_leer">📖 Quiero Leer</option>
                <option value="en_curso">⏳ En Curso</option>
                <option value="leido">✅ Leído</option>
              </select>
            </div>
            <div className="form-group">
              <label>Páginas Leídas</label>
              <input type="number" min="0" name="paginas_leidas" value={form.paginas_leidas} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Calificación</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`star ${form.calificacion >= s ? 'filled' : ''}`}
                  onClick={() => handleRating(s)}
                >★</span>
              ))}
              <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                {form.calificacion ? `${form.calificacion}/5` : 'Sin calificar'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Reseña</label>
            <textarea name="resena" value={form.resena} onChange={handleChange} rows={3} placeholder="Escribe tu opinión sobre el libro..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fecha Fin</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="favorito"
                  checked={form.favorito}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                ⭐ Favorito
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Agregar Libro')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
