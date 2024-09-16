import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createClient } from 'wagmi'
import { configureChains } from '@wagmi/core'
import { mainnet, polygon } from '@wagmi/core/chains'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { Chain, InjectedConnector } from '@wagmi/core'
import { connectorsForWallets, } from '@rainbow-me/rainbowkit'
import { rainbowWallet, metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets'

/* const geneva = {
  id: 5167004,
  name: 'Genea',
  network: 'Geneva',
  nativeCurrency: {
    decimals: 18,
    name: 'MXC Token',
    symbol: 'MXC',
  },
  rpcUrls: {
    public: { http: ['"https://geneva-rpc.moonchain.com"'] },
    default: { http: ['"https://geneva-rpc.moonchain.com"'] },
  },
  blockExplorers: {
    etherscan: { name: 'etherscan', url: 'https://geneva-explorer.moonchain.com' },
    default: { name: 'etherscan', url: 'https://geneva-explorer.moonchain.com' },
  },
} as const satisfies Chain */

export const zkevm = {
  id: 18686,
  name: 'MXC zkEVM',
  network: 'MXC zkEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'MXC Token',
    symbol: 'MXC',
  },
  rpcUrls: {
    public: { http: ['"https://rpc.mxc.com"'] },
    default: { http: ['"https://rpc.mxc.com"'] },
  },
  blockExplorers: {
    etherscan: { name: 'etherscan', url: 'https://explorer.moonchain.com' },
    default: { name: 'etherscan', url: 'https://explorer.moonchain.com' },
  },
} as const satisfies Chain

const { chains, provider,
  webSocketProvider, publicClient } = configureChains(
    [zkevm],
    [
      jsonRpcProvider({
        rpc: (chain) => ({
          http: `https://rpc.mxc.com`,
          webSocket: `wss://rpc.mxc.com/ws`,
        }),
      }),
    ],
  )

const AXSWallet = ({ chains }) => ({
  id: 'axs',
  name: 'AXS Wallet',
  iconUrl: '/AxsWallet.png',
  iconBackground: '#FFFFFF',
  description: 'AXS wallet web3 provider.',
  createConnector: () => {
    const connector = new InjectedConnector({
      chains
    })
    return {
      connector,
    }
  },
})

const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      AXSWallet({ chains }),
      metaMaskWallet({ chains }),
    ],
  },
])

const { connectors2 } = getDefaultWallets({
  appName: `MagnaDrop`,
  chains,
})


export const client = createClient({
  logger: {
    warn: (message) => console.warn(message),
  },
  // autoConnect: true,
  connectors,
  connectors2,
  provider,
  webSocketProvider,
})

export { chains }
