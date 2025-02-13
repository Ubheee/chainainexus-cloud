'use client'

import { SWRConfig } from 'swr'
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchSetupStatus } from '@/service/common'

type SwrInitorProps = {
  children: ReactNode
}
const SwrInitor = ({
  children,
}: SwrInitorProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consoleToken = decodeURIComponent(searchParams.get('access_token') || '')
  const refreshToken = decodeURIComponent(searchParams.get('refresh_token') || '')
  const urlToken = decodeURIComponent(searchParams.get('_token') || '')
  const consoleTokenFromLocalStorage = localStorage?.getItem('console_token')
  const refreshTokenFromLocalStorage = localStorage?.getItem('refresh_token')
  const pathname = usePathname()
  const [init, setInit] = useState(false)

  const isSetupFinished = useCallback(async () => {
    try {
      if (localStorage.getItem('setup_status') === 'finished')
        return true
      const setUpStatus = await fetchSetupStatus()
      if (setUpStatus.step !== 'finished') {
        localStorage.removeItem('setup_status')
        return false
      }
      localStorage.setItem('setup_status', 'finished')
      return true
    }
    catch (error) {
      return false
    }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        // Handle URL token first, before any other checks
        if (urlToken) {
          localStorage.setItem('console_token', urlToken)
          setInit(true)
          // Use window.history to preserve the token for the first request
          const newUrl = `${window.location.pathname}${window.location.hash}`
          window.history.replaceState({}, '', newUrl)
          return
        }

        const isFinished = await isSetupFinished()

        if (!isFinished) {
          router.replace('/install')
          return
        }

        // Check for valid tokens, including single token auth
        const hasValidTokens = consoleToken
                             || consoleTokenFromLocalStorage
                             || (consoleToken && refreshToken)
                             || (consoleTokenFromLocalStorage && refreshTokenFromLocalStorage)

        if (!hasValidTokens) {
          router.replace('/signin')
          return
        }

        if (searchParams.has('access_token') || searchParams.has('refresh_token')) {
          consoleToken && localStorage.setItem('console_token', consoleToken)
          refreshToken && localStorage.setItem('refresh_token', refreshToken)
          router.replace(pathname)
        }

        setInit(true)
      }
      catch (error) {
        router.replace('/signin')
      }
    })()
  }, [isSetupFinished, router, pathname, searchParams, consoleToken, refreshToken, urlToken, consoleTokenFromLocalStorage, refreshTokenFromLocalStorage])

  return init
    ? (
      <SWRConfig value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}>
        {children}
      </SWRConfig>
    )
    : null
}

export default SwrInitor
