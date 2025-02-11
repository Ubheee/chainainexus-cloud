'use client'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
import NormalForm from './normalForm'

export default function SignIn() {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])

  return (
    <WalletProvider wallets={[]} autoConnect>
      <div className="w-full mx-auto mt-8">
        <NormalForm />
      </div>
    </WalletProvider>
  )
}
