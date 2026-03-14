import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle'

function AboutPage() {
  useDocumentTitle('About')

  return (
    <section className="page-content">
      <h2>About</h2>
      <p>Document what this project does and how each module is organized.</p>
    </section>
  )
}

export default AboutPage
