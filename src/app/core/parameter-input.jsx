export default function ParameterInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  control = 'input',
  options = [],
  className = '',
}) {
  return (
    <label className={`parameter-field ${className}`.trim()} htmlFor={id}>
      <span>{label}</span>
      {control === 'select' ? (
        <select id={id} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </label>
  )
}
