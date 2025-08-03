import { Button } from "@/components/ui/button"
import { Wallet, Wifi } from "lucide-react"
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState } from 'react'

interface ConnectButtonProps {
  className?: string;
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const [isClient, setIsClient] = useState(false)
  
  // Always call hooks at the top level - never conditionally
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleClick = () => {
    try {
      open()
    } catch (error) {
      console.error('Error opening wallet modal:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkDisplay = () => {
    if (!caipNetwork) return "Unknown"
    
    // Map network names to shorter display names
    const networkMap: Record<string, string> = {
      'ethereum': 'ETH',
      'arbitrum': 'ARB',
      'base': 'BASE', 
      'polygon': 'MATIC',
      'optimism': 'OP'
    }
    
    const networkName = caipNetwork.name?.toLowerCase() || 'unknown'
    return networkMap[networkName] || caipNetwork.name || 'Unknown'
  }

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled
        className={`px-6 py-3 bg-black/90 border border-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-sm ${className}`}
      >
        <Wallet className="h-5 w-5 mr-3" />
        <span className="text-base font-medium">Loading...</span>
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleClick}
        className={`px-4 py-3 bg-green-900/90 border border-green-500/20 rounded-full hover:bg-green-800/80 text-green-100 hover:text-green-50 transition-all duration-200 backdrop-blur-sm ${className}`}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 text-xs font-medium text-green-200">
            <Wifi className="h-3 w-3" />
            <span>{getNetworkDisplay()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">{formatAddress(address)}</span>
          </div>
        </div>
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className={`px-6 py-3 bg-black/90 border border-white/20 rounded-full hover:bg-black/80 text-white hover:text-white transition-all duration-200 backdrop-blur-sm ${className}`}
    >
      <Wallet className="h-5 w-5 mr-3" />
      <span className="text-base font-medium">Connect Wallet</span>
    </Button>
  )
}
