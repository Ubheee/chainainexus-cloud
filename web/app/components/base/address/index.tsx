import React, { useState } from 'react'

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address)
    return ''

  // Check if address meets minimum length requirements
  if (address.length < chars * 2)
    return address

  // Handle Ethereum addresses (0x prefix)
  if (address.startsWith('0x'))
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`

  // Handle Solana addresses (no prefix, typically 32-44 chars)
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

type CopyableAddressProps = {
  address: string
  chars?: number
  className?: string
  copyable?: boolean
  showFull?: boolean
}

export const CopyableAddress: React.FC<CopyableAddressProps> = ({
  address,
  chars = 4,
  className = '',
  copyable = true,
  showFull = false,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <div
      className={`relative inline-flex ${copyable ? 'cursor-pointer' : ''} ${className}`}
      onClick={copyable ? handleCopy : undefined}
      title={copyable ? (copied ? 'Copied!' : 'Click to copy') : undefined}
    >
      <span className={copyable ? 'hover:opacity-80 transition-opacity' : ''}>
        {showFull ? address : shortenAddress(address, chars)}
      </span>
      {copied && copyable && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg">
          Copied!
        </div>
      )}
    </div>
  )
}
