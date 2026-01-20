import { Link } from 'react-router-dom'

export default function MovieCard({ item }) {
  const href = `/movie?url=${encodeURIComponent(item.link)}`
  return (
    <Link to={href} className="card">
      <img className="poster" src={item.image} alt={item.title} loading="lazy" />
      <div className="card-body">
        <div className="title">{item.title}</div>
      </div>
    </Link>
  )
}
