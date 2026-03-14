import { NavLink } from 'react-router-dom'
import { paths } from '../../app/router/paths'

function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink to={paths.home} end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Home
      </NavLink>
    </nav>
  )
}

export default AppNav
