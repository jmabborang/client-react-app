import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  checkSessionHeartbeat,
  deadlineFromSeconds,
  expireIdleSession,
  loadCurrentUser,
  loginFailed,
  recordActivity,
  refreshRememberedSession,
  selectAuthStatus,
  selectIdleDeadline,
  selectRemembered,
  selectRotationDeadline,
  sessionExtended,
  sessionRotationScheduled,
} from '../../store/authSlice'
import { clearCsrfToken } from '../../shared/api/httpClient'

const ACTIVITY_UPDATE_INTERVAL_MS = 30_000
const SESSION_CHECK_INTERVAL_MS = 30_000
const REFRESH_RETRY_MS = 30_000

export default function SessionActivityManager() {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAuthStatus)
  const remembered = useAppSelector(selectRemembered)
  const idleDeadline = useAppSelector(selectIdleDeadline)
  const rotationDeadline = useAppSelector(selectRotationDeadline)
  const idleDeadlineRef = useRef(idleDeadline)

  useEffect(() => {
    idleDeadlineRef.current = idleDeadline
  }, [idleDeadline])

  useEffect(() => {
    if (status !== 'authenticated') return undefined

    let active = true
    let checking = false

    const checkSession = async () => {
      if (!active || checking) return
      checking = true
      try {
        await checkSessionHeartbeat()
      } catch (error) {
        if (!active) return
        if (error?.status === 401) {
          clearCsrfToken()
          dispatch(loginFailed('Your session ended. Please sign in again.'))
        } else if (error?.status === 403) {
          dispatch(loadCurrentUser())
        }
      } finally {
        checking = false
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkSession()
    }

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [dispatch, status])

  useEffect(() => {
    if (status !== 'authenticated' || remembered || idleDeadlineRef.current === null) return undefined

    let active = true
    let expiryTimer
    let activityTimer
    let sending = false
    let expiring = false
    let ended = false
    let activityPending = false
    let lastActivityPostAt = 0
    let serverDeadline = idleDeadlineRef.current

    const sessionEnded = () => {
      if (ended) return
      ended = true
      clearCsrfToken()
      dispatch(loginFailed('Your session expired. Please sign in again.'))
    }

    const scheduleExpiryCheck = (deadline) => {
      clearTimeout(expiryTimer)
      expiryTimer = setTimeout(() => {
        if (active) void notifyIdleExpiry()
      }, Math.max(0, deadline - Date.now()))
    }

    const notifyIdleExpiry = async () => {
      if (!active || expiring || ended) return
      expiring = true
      clearTimeout(activityTimer)
      activityTimer = undefined
      activityPending = false
      try {
        const response = await expireIdleSession()
        if (!active) return
        if (response?.active === true) {
          const nextDeadline = deadlineFromSeconds(response.expires_in_seconds)
          if (nextDeadline === null) throw new Error('Invalid session expiry response.')
          serverDeadline = nextDeadline
          scheduleExpiryCheck(serverDeadline)
          dispatch(sessionExtended(serverDeadline))
        } else {
          sessionEnded()
        }
      } catch {
        if (active) sessionEnded()
      } finally {
        expiring = false
      }
    }

    const queueActivity = () => {
      if (!active || ended || expiring || sending || !activityPending || activityTimer) return
      const wait = Math.max(0, ACTIVITY_UPDATE_INTERVAL_MS - (Date.now() - lastActivityPostAt))
      activityTimer = setTimeout(() => {
        activityTimer = undefined
        void sendActivity()
      }, wait)
    }

    const sendActivity = async () => {
      if (!active || ended || expiring || sending || !activityPending) return
      if (Date.now() >= serverDeadline) {
        void notifyIdleExpiry()
        return
      }
      sending = true
      activityPending = false
      lastActivityPostAt = Date.now()
      try {
        const response = await recordActivity()
        if (!active) return
        const nextDeadline = deadlineFromSeconds(response?.expires_in_seconds)
        if (nextDeadline === null) throw new Error('Invalid activity response.')
        serverDeadline = nextDeadline
        scheduleExpiryCheck(serverDeadline)
        dispatch(sessionExtended(serverDeadline))
      } catch (error) {
        if (!active) return
        if (error?.status === 401) sessionEnded()
        else scheduleExpiryCheck(serverDeadline)
      } finally {
        sending = false
        if (active) queueActivity()
      }
    }

    const onActivity = () => {
      if (ended || expiring) return
      const now = Date.now()
      if (now >= serverDeadline) {
        void notifyIdleExpiry()
        return
      }

      activityPending = true
      queueActivity()
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() >= serverDeadline) {
        void notifyIdleExpiry()
      }
    }

    scheduleExpiryCheck(serverDeadline)
    document.addEventListener('pointerdown', onActivity)
    document.addEventListener('keydown', onActivity)
    document.addEventListener('touchstart', onActivity)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      clearTimeout(expiryTimer)
      clearTimeout(activityTimer)
      document.removeEventListener('pointerdown', onActivity)
      document.removeEventListener('keydown', onActivity)
      document.removeEventListener('touchstart', onActivity)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [dispatch, status, remembered])

  useEffect(() => {
    if (status !== 'authenticated' || !remembered || rotationDeadline === null) return undefined

    let active = true
    let refreshTimer
    let refreshing = false

    const scheduleRefresh = (deadline) => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(refresh, Math.max(1_000, deadline - Date.now()))
    }

    const refresh = async () => {
      if (!active || refreshing) return
      refreshing = true
      try {
        const response = await refreshRememberedSession()
        if (!active) return
        const nextDeadline = deadlineFromSeconds(response?.next_rotation_in_seconds)
        if (nextDeadline === null) throw new Error('Invalid session refresh response.')
        dispatch(sessionRotationScheduled(nextDeadline))
        scheduleRefresh(nextDeadline)
      } catch (error) {
        if (!active) return
        if (error?.status === 401) {
          clearCsrfToken()
          dispatch(loginFailed('Your session ended. Please sign in again.'))
        } else {
          scheduleRefresh(Date.now() + REFRESH_RETRY_MS)
        }
      } finally {
        refreshing = false
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() >= rotationDeadline) {
        void refresh()
      }
    }

    scheduleRefresh(rotationDeadline)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      clearTimeout(refreshTimer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [dispatch, status, remembered, rotationDeadline])

  return null
}
