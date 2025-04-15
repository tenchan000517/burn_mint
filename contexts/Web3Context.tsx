// contexts/Web3Context.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getBurnContractAddress,
  getTransactionUrl,
  getCurrentChainId,
  getSupportedChains,
  SupportedChainId,
  networkConfig,
} from "@/config/network";

// コンテキスト型定義（ERC1155用）
interface PoolContractContextType {
  poolContract: {
    address: string;
    currentPhaseId: number;
    burnTokenId: number;
  };
  chainId: SupportedChainId;
  getTransactionUrl: (txHash: string) => string;
}

// コンテキスト生成
const PoolContractContext = createContext<PoolContractContextType | null>(null);

// Queryクライアント
const queryClient = new QueryClient();

// wagmi config 作成
const config = createConfig({
  chains: getSupportedChains(),
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Provider実装
export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({
    poolContract: {
      address: getBurnContractAddress(),
      currentPhaseId: networkConfig.getPhaseId(),
      burnTokenId: networkConfig.getBurnTokenId(), // 💥 ここを追加
    },
    chainId: getCurrentChainId(),
    getTransactionUrl,
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PoolContractContext.Provider value={value}>
          {children}
        </PoolContractContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// カスタムフックでアクセス
export function useNFTContracts() {
  const context = useContext(PoolContractContext);
  if (!context) {
    throw new Error("usePoolContract must be used within a Web3Provider");
  }
  return context;
}
