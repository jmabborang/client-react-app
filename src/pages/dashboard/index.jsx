import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle'

function DashboardPage() {
  useDocumentTitle('Dashboard')

  return (
    <section className="page-content">
      <h2>Dashboard</h2>
      <p>Use this page for high-level metrics and quick actions.</p>
    </section>
  )
}

export default DashboardPage
