import { useState, useEffect } from 'react'
import api from '../services/api.js'
import BookList from '../components/BookList.jsx'
import BookModal from '../components/BookModal.jsx'

export default function QuieroLeer() {
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const loadLibros = async () => {
    setLoading(true)
    try {
      const res = await api.get('/libros', { params: { estado: 'quiero_leer' } })
      setLibros(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLibros() }, [])

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
          <h1>📖 Lista de Deseos</h1>
          <p>Libros que quieres leer próximamente ({libros.length})</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
          ➕ Agregar Libro
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <BookList
          libros={libros}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyTitle="🎯 Tu lista de deseos está vacía"
          emptyMsg="Agrega libros que te gustaría leer en el futuro y ve creciendo tu TBR (To Be Read)."
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
