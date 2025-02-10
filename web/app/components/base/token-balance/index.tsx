// ... existing code ...
import { useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
// ... existing code ...

const Header = () => {
  // ... existing code ...
  const [tokenBalance, setTokenBalance] = useState('0')

  // Update these constants
  const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'
  const TOKEN_ADDRESS = '7777777777777777777777777777777777777777' // Replace with your token's mint address
  const walletAddress = localStorage.getItem('address') // Get wallet address from localStorage

  const fetchTokenBalance = useCallback(async () => {
    try {
      if (!walletAddress) {
        console.log('No wallet address found')
        return
      }

      const connection = new Connection(SOLANA_RPC_URL)
      const tokenMint = new PublicKey(TOKEN_ADDRESS)
      const pubKey = new PublicKey(walletAddress)

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
        programId: TOKEN_PROGRAM_ID,
      })

      const tokenAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === TOKEN_ADDRESS,
      )

      if (tokenAccount)
        setTokenBalance(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount.toString())
    }
    catch (error) {
      console.error('Error fetching token balance:', error)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchTokenBalance()
  }, [fetchTokenBalance])

  return (
    <div className='flex flex-1 items-center justify-between px-4 bg-background-body'>
      <div className='flex items-center flex-shrink-0'>
        <div className='mr-4 text-sm'>
          CAN: {tokenBalance}
        </div>
      </div>

    </div>
  )
}
