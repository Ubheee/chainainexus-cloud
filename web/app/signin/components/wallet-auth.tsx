'use client'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import style from '../page.module.css'
import Button from '@/app/components/base/button'
import Toast from '@/app/components/base/toast'
import { loginWithWallet } from '@/service/common'
import classNames from '@/utils/classnames'
type WalletAuthResponse = {
  result: string
  data: { access_token: string; refresh_token: string; address: string }
}

export default function WalletAuth() {
  const { connection } = useConnection()
  const { publicKey, signMessage, connected, select, wallets, connect } = useWallet()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (wallets.length === 0) {
      Toast.notify({
        type: 'error',
        message: t('login.noWalletsFound'),
      })
      return
    }
    try {
      // If only one wallet is available, connect to it directly
      if (wallets.length === 1) {
        select(wallets[0].adapter.name)
        await connect()
        return
      }
      // If multiple wallets, connect to the first detected one
      select(wallets[0].adapter.name)
      await connect()
    }
    catch (error: any) {
      Toast.notify({
        type: 'error',
        message: error.message || t('login.walletConnectionFailed'),
      })
    }
  }

  const handleWalletLogin = async () => {
    try {
      setIsLoading(true)

      if (!publicKey)
        throw new Error(String(t('login.walletNotConnected')))

      if (!signMessage)
        throw new Error(String(t('login.walletSigningNotSupported')))

      // Sign message with nonce
      const message = new TextEncoder().encode('Login to ChainAINexus')
      const signature = await signMessage(message)

      // Verify and login
      const loginResponse = (await loginWithWallet({
        publicKey: publicKey.toBase58(),
        signature: Array.from(signature),
        network: 'solana',
      })) as unknown as WalletAuthResponse

      if (loginResponse.result === 'success') {
        // Store tokens and redirect
        try {
          localStorage.setItem('console_token', loginResponse.data.access_token)
          localStorage.setItem('refresh_token', loginResponse.data.refresh_token)
          localStorage.setItem('address', loginResponse.data.address)
          window.location.href = '/apps'
        }
        catch (error: any) {
          throw new Error(String(t('login.failedToStoreToken')))
        }
      }
      else {
        throw new Error(String(t('login.authenticationFailed')))
      }
    }
    catch (error: any) {
      Toast.notify({
        type: 'error',
        message: error.message || t('login.invalidSignature'),
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {!connected
        ? (
          <Button
            onClick={handleConnect}
            className="w-full"
            loading={isLoading}
          >
            <span className={
              classNames(
                style.phantomIcon,
                'w-5 h-5 mr-2',
              )
            } />
            <span className={
              classNames(
                style.solfareIcon,
                'w-5 h-5 mr-2',
              )
            } />
            <span className={
              classNames(
                style.okxIcon,
                'w-5 h-5 mr-2',
              )
            } />

            {t('login.connectWallet')}
          </Button>
        )
        : (
          <Button
            onClick={handleWalletLogin}
            className="w-full"
            loading={isLoading}
          >
            {t('login.withWallet')}
          </Button>
        )}
    </div>
  )
}
