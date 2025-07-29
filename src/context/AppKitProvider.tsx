import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, base, polygon, optimism } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ReactNode } from 'react'

// Setup queryClient
const queryClient = new QueryClient()

// Your project ID from https://dashboard.reown.com
const projectId = '50b1bd6f-38f0-401d-827b-709d3ff04593'

// Metadata for your dApp
const metadata = {
  name: 'WAC.AI Oracle Chat',
  description: 'AI Assistant for Onchain Investors',
  url: window.location.origin,
  icons: ['https://wac.ai/favicon.ico'] // Update with your actual favicon path
}

// Configure supported networks
const networks = [mainnet, arbitrum, base, polygon, optimism]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Since we're using Vite, not Next.js
})

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

interface AppKitProviderProps {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
