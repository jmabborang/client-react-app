import { Outlet } from 'react-router-dom'
import { appConfig } from '../../app/config/appConfig'
import AppNav from '../navigation/AppNav'
import GlobalLoader from '../../shared/ui/GlobalLoader'

function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-container app-header-inner">
          <h1 className="app-title">{appConfig.appName}</h1>
          <AppNav />
        </div>
      </header>
      <main className="app-container app-main">
        <section className="app-card">
          <Outlet />
        </section>
      </main>
      <GlobalLoader />
    </div>
  )
}

export default MainLayout
