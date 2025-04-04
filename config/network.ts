// config/network.ts
import { ethers } from "ethers";
import { mainnet, sepolia } from "wagmi/chains";

export type SupportedChainId = 1 | 11155111;
export type NetworkType = "ETHEREUM_MAINNET" | "SEPOLIA_TESTNET";

// ネットワーク設定
export const NETWORKS = {
  ETHEREUM_MAINNET: {
    name: "Ethereum",
    symbol: "ETH",
    id: 1 as SupportedChainId,
    blockExplorer: "https://etherscan.io",
    rpcUrl: "https://eth-mainnet.public.blastapi.io"
  },
  SEPOLIA_TESTNET: {
    name: "Sepolia",
    symbol: "ETH",
    id: 11155111 as SupportedChainId,
    blockExplorer: "https://sepolia.etherscan.io",
    rpcUrl: "https://eth-sepolia.public.blastapi.io"
  }
};

// 現在の設定（ここを変更するだけで全体の設定が切り替わる）
const CURRENT_CONFIG = {
  NETWORK: "SEPOLIA_TESTNET" as NetworkType,  // "ETHEREUM_MAINNET" または "SEPOLIA_TESTNET"
};

export interface ContractConfig {
  burnContract: {
    address: string;
    tokenIds?: number[];  // バーン対象の特定のトークンID (省略可能)
  };
  mintContract: {
    address: string;
    tokenId?: number;     // ミント時に使用する特定のトークンID (省略可能)
  };
}

// コントラクト設定
const CONTRACT_CONFIGS: Record<NetworkType, ContractConfig> = {
  ETHEREUM_MAINNET: {
    burnContract: {
      address: '0x123abc...', // メインネット バーン対象コントラクト
    },
    mintContract: {
      address: '0xdef456...', // メインネット ミント対象コントラクト
    },
  },
  SEPOLIA_TESTNET: {
    burnContract: {
      address: '0xf083F9bc026DaFC7E5AFeab5CB576f9464c5553A',
      tokenIds: [1, 2, 3],
    },
    mintContract: {
      address: '0xCCd4617030401d0C7BFB5594E45fDbE88146EAFA',
      tokenId: 2,
    },
  }
};

// クライアントサイドチェック - サーバーサイドでは使用しない
const isClient = typeof window !== 'undefined';

// 警告用の関数
const warnServerSideUsage = () => {
  console.warn('[WARNING] getProvider was called on the server side, which is not supported. Returning null.');
  return null;
};

// 古い実装を非推奨化・警告付きで残す（互換性のため）
export const getProvider = () => {
  // サーバーサイドでは使用不可
  if (!isClient) {
    return warnServerSideUsage();
  }
  
  console.warn('[DEPRECATED] getProvider is deprecated. Please use wagmi hooks instead.');
  
  // デバッグ: 呼び出し元の追跡
  console.log(`[DEBUG] getProvider called from: ${new Error().stack?.split('\n')[2]?.trim() || 'unknown'}`);
  
  const network = NETWORKS[CURRENT_CONFIG.NETWORK];
  
  try {
    // 注: この方法は警告付きで残しますが、推奨しません
    return new ethers.JsonRpcProvider(network.rpcUrl);
  } catch (error) {
    console.error(`Failed to initialize provider:`, error);
    return null;
  }
};

// NetworkConfig インターフェースに合わせた実装
export interface NetworkConfig {
  chainId: SupportedChainId;
  explorers: Record<SupportedChainId, string>;
  contracts: Record<SupportedChainId, ContractConfig>;
  getExplorerUrl: () => string;
  getContractConfig: () => ContractConfig;
}

// 互換性のために networkConfig をエクスポート
export const networkConfig: NetworkConfig = {
  get chainId() {
    return NETWORKS[CURRENT_CONFIG.NETWORK].id;
  },
  
  // Network explorer URLs by chainId
  explorers: {
    1: NETWORKS.ETHEREUM_MAINNET.blockExplorer,
    11155111: NETWORKS.SEPOLIA_TESTNET.blockExplorer,
  },

  // Contract configurations by chainId
  get contracts() {
    return {
      1: CONTRACT_CONFIGS.ETHEREUM_MAINNET,
      11155111: CONTRACT_CONFIGS.SEPOLIA_TESTNET,
    };
  },

  // Get explorer URL based on current chainId
  getExplorerUrl: function() {
    return this.explorers[this.chainId];
  },
  
  // Get contract config based on current chainId
  getContractConfig: function() {
    return this.contracts[this.chainId];
  }
};

// 現在のチェーンIDを取得
export const getCurrentChainId = (): SupportedChainId => {
  return NETWORKS[CURRENT_CONFIG.NETWORK].id;
};

// 現在のネットワーク設定を取得
export const getCurrentNetwork = () => {
  return NETWORKS[CURRENT_CONFIG.NETWORK];
};

// 現在のコントラクト設定を取得
export const getCurrentContractConfig = (): ContractConfig => {
  return CONTRACT_CONFIGS[CURRENT_CONFIG.NETWORK];
};

// 現在のエクスプローラーURLを取得
export const getExplorerUrl = () => {
  return NETWORKS[CURRENT_CONFIG.NETWORK].blockExplorer;
};

// トランザクションURLを取得
export function getTransactionUrl(txHash: string) {
  return `${getExplorerUrl()}/tx/${txHash}`;
}

// コントラクトアドレス取得用ヘルパー関数
export function getBurnContractAddress() {
  return getCurrentContractConfig().burnContract.address;
}

export function getMintContractAddress() {
  return getCurrentContractConfig().mintContract.address;
}

export function getBurnTokenIds() {
  return getCurrentContractConfig().burnContract.tokenIds || [];
}

export function getMintTokenId() {
  return getCurrentContractConfig().mintContract.tokenId;
}

export function getSupportedChains() {
  return [mainnet, sepolia] as const;
}

// 現在のチェーン設定を取得
export function getCurrentChainConfig() {
  return NETWORKS[CURRENT_CONFIG.NETWORK];
}

// ネットワーク切り替え用関数
export function setNetwork(network: NetworkType) {
  CURRENT_CONFIG.NETWORK = network;
  console.log(`Network changed to: ${network}`);
  return getCurrentNetwork();
}

// 便利なショートカット関数
export function setToMainnet() {
  return setNetwork("ETHEREUM_MAINNET");
}

export function setToSepolia() {
  return setNetwork("SEPOLIA_TESTNET");
}