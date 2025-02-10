'use client'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
import NormalForm from './normalForm'

export default function SignIn() {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <div className="w-full mx-auto mt-8">
        <NormalForm />
      </div>
    </WalletProvider>
  )
}
