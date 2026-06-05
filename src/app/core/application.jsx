import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../../store/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import Button from '../../shared/ui/Button'
import { applicationMenus } from '../../pages/menu'
import { paths } from '../router/paths'

function getDisplayName(user) {
  if (!user) {
    return 'Guest User'
  }

  return user.name || user.full_name || user.username || user.email || 'Guest User'
}

function getUserRole(user) {
  if (!user) {
    return 'Workspace access'
  }

  return user.role || user.user_role || user.position || 'Workspace access'
}

function getUserInitials(user) {
  const displayName = getDisplayName(user)
  const parts = displayName.split(' ').filter(Boolean)

  if (parts.length === 0) {
    return 'GU'
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function getUserProfileImage(user) {
  if (!user) {
    return ''
  }

  return (
    user.avatar ||
    user.avatar_url ||
    user.profile_image ||
    user.profileImage ||
    user.photo ||
    user.photo_url ||
    user.image ||
    ''
  )
}

function getActiveMenu(pathname) {
  return applicationMenus.find((menu) => menu.path === pathname) ?? applicationMenus[0]
}

function isMenuActive(currentPathname, menuPath) {
  return currentPathname === menuPath
}

function getModuleBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Home'
  }

  return ['Home', ...segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))].join(' / ')
}

function Application() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useAppSelector(selectCurrentUser)
  const activeMenu = getActiveMenu(location.pathname)
  const moduleBreadcrumb = getModuleBreadcrumb(location.pathname)
  const userProfileImage = getUserProfileImage(currentUser)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!isUserMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    dispatch(logout())
    navigate(paths.login, { replace: true })
  }

  const handleProfileClick = () => {
    setIsUserMenuOpen(false)
    navigate(paths.settings)
  }

  return (
    <>
      <div className="app-topbar">
        <div className="app-topbar-content">
          <div className="app-topbar-copy">
            <p className="app-topbar-kicker">Inventory Management System</p>
          </div>

          <div className="app-user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="app-user-trigger"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label="Open user menu"
              onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
            >
              <div className="app-topbar-avatar" aria-hidden="true">
                {userProfileImage ? (
                  <img src={userProfileImage} alt={getDisplayName(currentUser)} className="app-topbar-avatar-image" />
                ) : (
                  getUserInitials(currentUser)
                )}
              </div>
              <span className="app-user-trigger-caret" aria-hidden="true">
                {isUserMenuOpen ? '^' : 'v'}
              </span>
            </button>

            {isUserMenuOpen ? (
              <div className="app-user-dropdown" role="menu" aria-label="User menu">
                <div className="app-user-dropdown-profile">
                  <div className="app-user-dropdown-avatar" aria-hidden="true">
                    {userProfileImage ? (
                      <img
                        src={userProfileImage}
                        alt={getDisplayName(currentUser)}
                        className="app-user-dropdown-avatar-image"
                      />
                    ) : (
                      getUserInitials(currentUser)
                    )}
                  </div>
                  <strong>{getDisplayName(currentUser)}</strong>
                  <p>{getUserRole(currentUser)}</p>
                </div>

                <div className="app-user-dropdown-actions">
                  <Button type="button" className="app-user-dropdown-profile-button" onClick={handleProfileClick}>
                    Profile
                  </Button>
                  <Button type="button" className="app-user-dropdown-logout" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="app-shell">
        <aside className="app-sidebar">
          <nav className="app-nav" aria-label="Main navigation">
            {applicationMenus.map((menu) => (
              <NavLink
                key={menu.key}
                to={menu.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={(event) => {
                  if (isMenuActive(location.pathname, menu.path)) {
                    event.preventDefault()
                  }
                }}
              >
                <span className="nav-link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d={menu.iconPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{menu.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* <div className="app-sidebar-footer">
            <Button type="button" className="app-sidebar-logout" onClick={handleLogout}>
              Log out
            </Button> 
          </div> */}
        </aside>

        <main className="app-main-shell">
          <div className="app-main-header">
            <p className="app-main-kicker">{moduleBreadcrumb}</p>
            {/* <h2 className="app-main-title">{activeMenu.title}</h2> */}
          </div>

          <section className="app-main-card">
            <Outlet />
          </section>
        </main>
      </div>
    </>
  )
}

export default Application
