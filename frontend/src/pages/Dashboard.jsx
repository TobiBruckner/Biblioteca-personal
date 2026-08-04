import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import BookList from '../components/BookList.jsx'
import BookModal from '../components/BookModal.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total_libros: 0, leidos: 0, en_curso: 0, quiero_leer: 0, favoritos: 0 })
  const [recent, setRecent] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const loadData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/stats'),
        api.get('/libros', { params: { limit: 6 } })
      ])
      setStats(statsRes.data)
      setRecent(recentRes.data.slice(0, 6))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = async (libroId) => {
    try {
      await api.delete(`/libros/${libroId}`)
      loadData()
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
          <h1>🏠 Panel Principal</h1>
          <p>Vista general de tu biblioteca personal</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
          ➕ Agregar Libro
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/biblioteca')}>
          <div className="label">Total en Biblioteca</div>
          <div className="value">{stats.total_libros}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/biblioteca')}>
          <div className="label">✅ Leídos</div>
          <div className="value">{stats.leidos}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/en-curso')}>
          <div className="label">⏳ En Curso</div>
          <div className="value">{stats.en_curso}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/quiero-leer')}>
          <div className="label">📖 Quiero Leer</div>
          <div className="value">{stats.quiero_leer}</div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem' }}>📚 Agregados Recientemente</h2>
        </div>
        <BookList
          libros={recent}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyTitle="👋 ¡Bienvenido a tu biblioteca!"
          emptyMsg="Empieza agregando tu primer libro para ver tus estadísticas y colección crecer."
        />
      </div>

      <BookModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSaved={loadData}
        libroEstado={editItem}
      />
    </div>
  )
}
