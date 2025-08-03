import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, base, polygon, optimism } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ReactNode } from 'react'

// Setup queryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed API calls
      refetchOnWindowFocus: false,
    },
  },
})

// Your project ID from https://dashboard.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '50b1bd6f-38f0-401d-827b-709d3ff04593'

// Metadata for your dApp (only if window is available)
const getMetadata = () => {
  if (typeof window === 'undefined') {
    return {
      name: 'WAC.AI Oracle Chat',
      description: 'AI Assistant for Onchain Investors',
      url: 'https://wac.ai',
      icons: ['https://wac.ai/favicon.ico']
    }
  }
  
  return {
    name: 'WAC.AI Oracle Chat',
    description: 'AI Assistant for Onchain Investors',
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.ico`]
  }
}

// Configure supported networks
const networks = [mainnet, arbitrum, base, polygon, optimism]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Since we're using Vite, not Next.js
})

// Initialize AppKit (only if we're in the browser)
if (typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: networks as any,
    projectId,
    metadata: getMetadata(),
    features: {
      analytics: false, // Disable analytics to avoid API errors
      email: false,
      socials: false,
      emailShowWallets: false,
      onramp: false,
      swaps: false,
      history: false
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-color-mix': '#000000',
      '--w3m-color-mix-strength': 20
    },
    allowUnsupportedChain: true,
    enableWalletConnect: true,
    enableInjected: true,
    enableEIP6963: true,
    enableCoinbase: false // Disable Coinbase to avoid their API errors
  })
}

interface AppKitProviderProps {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
