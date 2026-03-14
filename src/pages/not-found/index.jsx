import { Link } from 'react-router-dom'
import { paths } from '../../app/router/paths'

function NotFoundPage() {
  return (
    <section className="page-content">
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <Link className="nav-link active" to={paths.home}>
        Back to Home
      </Link>
    </section>
  )
}

export default NotFoundPage
