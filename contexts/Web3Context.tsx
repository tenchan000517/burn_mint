// contexts\Web3Context.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  getBurnContractAddress, 
  getMintContractAddress,
  getBurnTokenIds,
  getMintTokenId,
  networkConfig,
  getTransactionUrl,
  SupportedChainId
} from "@/config/network";

// コントラクト情報を含むコンテキスト用の型定義
interface NFTContractsContextType {
  burnContract: {
    address: string;
    tokenIds?: number[];
  };
  mintContract: {
    address: string;
    tokenId?: number;
  };
  chainId: SupportedChainId;
  getTransactionUrl: (txHash: string) => string;
}

// NFTコントラクト情報用のコンテキスト作成
const NFTContractsContext = createContext<NFTContractsContextType | null>(null);

// クエリクライアントの作成
const queryClient = new QueryClient();

// wagmi設定の作成
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  // コントラクト情報をコンテキスト値として準備
  const nftContractsValue = useMemo(() => ({
    burnContract: {
      address: getBurnContractAddress(),
      tokenIds: getBurnTokenIds(),
    },
    mintContract: {
      address: getMintContractAddress(),
      tokenId: getMintTokenId(),
    },
    chainId: networkConfig.chainId,
    getTransactionUrl,
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NFTContractsContext.Provider value={nftContractsValue}>
          {children}
        </NFTContractsContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// NFTコントラクト情報にアクセスするためのカスタムフック
export function useNFTContracts() {
  const context = useContext(NFTContractsContext);
  if (!context) {
    throw new Error("useNFTContracts must be used within a Web3Provider");
  }
  return context;
}