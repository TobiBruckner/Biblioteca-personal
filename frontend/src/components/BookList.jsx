import BookCard from './BookCard.jsx'

export default function BookList({ libros, onEdit, onDelete, emptyTitle, emptyMsg }) {
  if (!libros || libros.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle || '📭 Aún no hay libros'}</h3>
        <p>{emptyMsg || 'Agrega tu primer libro para empezar a organizar tu biblioteca.'}</p>
      </div>
    )
  }

  return (
    <div className="books-grid">
      {libros.map((le) => (
        <BookCard
          key={le.id}
          libroEstado={le}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
