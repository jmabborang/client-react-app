import { useEffect } from 'react'
import { appConfig } from '../../app/config/appConfig'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | ${appConfig.appName}`
  }, [title])
}
