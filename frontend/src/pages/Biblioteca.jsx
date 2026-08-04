import { useState, useEffect } from 'react'
import api from '../services/api.js'
import BookList from '../components/BookList.jsx'
import BookModal from '../components/BookModal.jsx'

export default function Biblioteca() {
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const loadLibros = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      const res = await api.get('/libros', { params })
      setLibros(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLibros() }, [])
  useEffect(() => {
    const t = setTimeout(() => loadLibros(), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (libroId) => {
    try {
      await api.delete(`/libros/${libroId}`)
      loadLibros()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const openEdit = (item) => { setEditItem(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📚 Mi Biblioteca</h1>
          <p>Todos tus libros en un solo lugar (total: {libros.length})</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              minWidth: '250px'
            }}
          />
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
            ➕ Agregar Libro
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando biblioteca...</div>
      ) : (
        <BookList
          libros={libros}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyTitle="📭 Tu biblioteca está vacía"
          emptyMsg="Agrega tu primer libro para empezar a construir tu colección personal."
        />
      )}

      <BookModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSaved={loadLibros}
        libroEstado={editItem}
      />
    </div>
  )
}
