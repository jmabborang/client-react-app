// Each view file must default-export a React component.
const modules = import.meta.glob('./views/**/*.jsx', {
  eager: true,
  import: 'default',
})

const views = Object.fromEntries(
  Object.entries(modules).map(([filePath, Component]) => {
    const name = filePath
      .slice('./views/'.length, -'.jsx'.length)
      .replaceAll('/', '-')
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    return [name, Component]
  }),
)

export default views
