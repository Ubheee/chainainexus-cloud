import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import Loading from '../components/base/loading'
import WalletAuth from './components/wallet-auth'
import cn from '@/utils/classnames'
import { getSystemFeatures, invitationCheck } from '@/service/common'
import { defaultSystemFeatures } from '@/types/feature'
import Toast from '@/app/components/base/toast'

const NormalForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const consoleToken = decodeURIComponent(searchParams.get('access_token') || '')
  const refreshToken = decodeURIComponent(searchParams.get('refresh_token') || '')
  const message = decodeURIComponent(searchParams.get('message') || '')
  const invite_token = decodeURIComponent(searchParams.get('invite_token') || '')
  const [isLoading, setIsLoading] = useState(true)
  const [systemFeatures, setSystemFeatures] = useState(defaultSystemFeatures)
  const [authType, updateAuthType] = useState<'code' | 'password'>('password')
  const [showORLine, setShowORLine] = useState(false)
  const [allMethodsAreDisabled, setAllMethodsAreDisabled] = useState(false)
  const [workspaceName, setWorkSpaceName] = useState('')

  const isInviteLink = Boolean(invite_token && invite_token !== 'null')

  const init = useCallback(async () => {
    try {
      if (consoleToken && refreshToken) {
        localStorage.setItem('console_token', consoleToken)
        localStorage.setItem('refresh_token', refreshToken)
        router.replace('/apps')
        return
      }

      if (message) {
        Toast.notify({
          type: 'error',
          message,
        })
      }
      const features = await getSystemFeatures()
      const allFeatures = { ...defaultSystemFeatures, ...features }
      setSystemFeatures(allFeatures)
      setAllMethodsAreDisabled(!allFeatures.enable_social_oauth_login && !allFeatures.enable_email_code_login && !allFeatures.enable_email_password_login && !allFeatures.sso_enforced_for_signin)
      setShowORLine((allFeatures.enable_social_oauth_login || allFeatures.sso_enforced_for_signin) && (allFeatures.enable_email_code_login || allFeatures.enable_email_password_login))
      updateAuthType(allFeatures.enable_email_password_login ? 'password' : 'code')
      if (isInviteLink) {
        const checkRes = await invitationCheck({
          url: '/activate/check',
          params: {
            token: invite_token,
          },
        })
        setWorkSpaceName(checkRes?.data?.workspace_name || '')
      }
    }
    catch (error) {
      console.error(error)
      setAllMethodsAreDisabled(true)
      setSystemFeatures(defaultSystemFeatures)
    }
    finally { setIsLoading(false) }
  }, [consoleToken, refreshToken, message, router, invite_token, isInviteLink])
  useEffect(() => {
    init()
  }, [init])
  if (isLoading || consoleToken) {
    return <div className={
      cn(
        'flex flex-col items-center w-full grow justify-center',
        'px-6',
        'md:px-[108px]',
      )
    }>
      <Loading type='area' />
    </div>
  }

  return (
    <>
      <div className="w-full mx-auto mt-8">
        {isInviteLink
          ? <div className="w-full mx-auto">
            <h2 className="title-4xl-semi-bold text-text-primary">{t('login.join')}{workspaceName}</h2>
            <p className='mt-2 body-md-regular text-text-tertiary'>{t('login.joinTipStart')}{workspaceName}{t('login.joinTipEnd')}</p>
          </div>
          : <div className="w-full mx-auto">
            <h2 className="title-4xl-semi-bold text-text-primary">{t('login.pageTitle')}</h2>
            <p className='mt-2 body-md-regular text-text-tertiary'>{t('login.welcome')}</p>
          </div>}
        <div className="w-full mx-auto mt-8">
          <div className="bg-background-body">
            <div className="flex flex-col gap-3 mt-6">
              <WalletAuth />
              <div className="w-full mx-auto text-center text-text-tertiary system-xs-regular">If you don’t have an account, linking a wallet will automatically register one for you</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NormalForm
