import { NavLink } from 'react-router-dom'
import { paths } from '../../app/router/paths'

function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink to={paths.home} end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Home
      </NavLink>
      <NavLink to={paths.dashboard} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        Dashboard
      </NavLink>
      <NavLink to={paths.about} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        About
      </NavLink>
    </nav>
  )
}

export default AppNav
