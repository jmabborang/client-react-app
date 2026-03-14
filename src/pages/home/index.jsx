import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle('Home')

  return (
    <section className="page-content">
      <h2>Home</h2>
      <p>Start building your feature modules from here.</p>
    </section>
  )
}

export default HomePage
