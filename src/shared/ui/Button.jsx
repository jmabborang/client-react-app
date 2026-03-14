function Button({ children, className = '', ...props }) {
  return (
    <button type="button" className={`btn ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export default Button
