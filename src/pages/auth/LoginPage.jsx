import { useState } from 'react'
import Button from '../../shared/ui/Button'
import { generateUuid, getDeviceName, getIpAddress, getOrCreateDeviceId } from '../../shared/core/common'

const MIN_USERNAME_LENGTH = 3
const MIN_PASSWORD_LENGTH = 8

function LoginPage() {
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState({})
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const validateForm = (values) => {
    const nextErrors = {}

    if (!values.username.trim()) {
      nextErrors.username = 'Username is required.'
    } else if (values.username.trim().length < MIN_USERNAME_LENGTH) {
      nextErrors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters.`
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.'
    } else if (values.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }

    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValues = {
      ...formValues,
      [name]: type === 'checkbox' ? checked : value,
    }

    setFormValues(nextValues)

    if (Object.keys(errors).length > 0) {
      setErrors(validateForm(nextValues))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateForm(formValues)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const ipAddress = await getIpAddress()

    const loginPayload = {
      Username: formValues.username.trim(),
      Password: formValues.password,
      IsRemember: formValues.remember,
      DeviceId: getOrCreateDeviceId(),
      DeviceName: getDeviceName(),
      IPAddress: ipAddress,
      ClientRequestId: generateUuid(),
    }

    console.log('Test Login payload', loginPayload)
  }

  const usernameError = errors.username
  const passwordError = errors.password

  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 id="login-title" className="auth-title">
          Sign in to your account
        </h1>
        {/* <p className="auth-subtitle">Use your company email and password to continue.</p> */}
        <br />
        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formValues.username}
              onChange={handleChange}
              className={`auth-input${usernameError ? ' auth-input-invalid' : ''}`}
              placeholder="Enter your username"
              aria-invalid={Boolean(usernameError)}
              aria-describedby={usernameError ? 'username-error' : undefined}
            />
            {usernameError ? (
              <p id="username-error" className="auth-error" role="alert">
                {usernameError}
              </p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <div className="auth-password-wrap">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                value={formValues.password}
                onChange={handleChange}
                className={`auth-input auth-input-password${passwordError ? ' auth-input-invalid' : ''}`}
                placeholder="Enter your password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M3 4.5 19.5 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.3 10.3 0 0 1 12 4.9c5.1 0 9.2 4.2 10 7.1a1 1 0 0 1 0 .6 11.8 11.8 0 0 1-4.5 5.7M6.3 7.3A12.1 12.1 0 0 0 2 12a1 1 0 0 0 0 .6c.8 2.9 4.9 7.1 10 7.1 1 0 2-.2 2.9-.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M2 12.3a1 1 0 0 1 0-.6C2.8 8.8 6.9 4.6 12 4.6s9.2 4.2 10 7.1a1 1 0 0 1 0 .6c-.8 2.9-4.9 7.1-10 7.1S2.8 15.2 2 12.3Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError ? (
              <p id="password-error" className="auth-error" role="alert">
                {passwordError}
              </p>
            ) : null}
          </div>

          <div className="auth-row">
            <label className="auth-checkbox">
              <input type="checkbox" name="remember" checked={formValues.remember} onChange={handleChange} />
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-link">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="auth-submit">
            Login
          </Button>
        </form>

        <p className="auth-footnote">
          New here?{' '}
          <a href="#" className="auth-link">
            Create an account
          </a>
        </p>
      </section>
    </div>
  )
}

export default LoginPage
