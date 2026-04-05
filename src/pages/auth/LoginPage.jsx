import { useState } from 'react'
import Button from '../../shared/ui/Button'
import { httpClient } from '../../shared/api/httpClient'
import { generateUuid, getDeviceName, getIpAddress, getOrCreateDeviceId } from '../../shared/core/common'

const MIN_USERNAME_LENGTH = 3
const MIN_PASSWORD_LENGTH = 4

function LoginPage() {
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState({})
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [isApiSuccess, setIsApiSuccess] = useState(false)

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

    if (isSubmitting) {
      return
    }

    const validationErrors = validateForm(formValues)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setApiMessage('')
    setIsApiSuccess(false)
    setIsSubmitting(true)

    try {
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

      const responseData = await httpClient.post('/api/v1/auth/login', loginPayload)

      setIsApiSuccess(true)
      setApiMessage(responseData.message || 'Login successful.')
      console.log('Login response', responseData)
    } catch (error) {
      if (error?.status === 401) {
        setApiMessage('Invalid credentials.')
      } else {
        setApiMessage(error?.message || 'Unable to connect to Server. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const usernameError = errors.username
  const passwordError = errors.password

  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-background auth-background-secondary" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-showcase">
          <div className="auth-badge">Inventory Control</div>
          <p className="auth-eyebrow">Welcome back</p>
          <h1 id="login-title" className="auth-title">
            Sign in to manage stock with confidence
          </h1>
          <p className="auth-subtitle">
            Access purchasing, stock movement, and daily inventory operations from one secure workspace.
          </p>
          <div className="auth-highlights" aria-hidden="true">
            <div className="auth-highlight-card">
              <span className="auth-highlight-value">Live</span>
              <span className="auth-highlight-label">Track receiving, issuing, and stock updates</span>
            </div>
            <div className="auth-highlight-card">
              <span className="auth-highlight-value">Audit</span>
              <span className="auth-highlight-label">Built for traceable daily warehouse activity</span>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-panel-kicker">Account Access</p>
            <h2 className="auth-panel-title">Login</h2>
            <p className="auth-panel-copy">Enter your username and password to continue.</p>
          </div>

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

            <Button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            {apiMessage ? (
              <p className={`auth-status-message${isApiSuccess ? ' auth-status-success' : ''}`} role="status">
                {apiMessage}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
