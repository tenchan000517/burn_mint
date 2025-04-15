// config/network.ts
import { mainnet, sepolia } from "wagmi/chains";
import { ethers } from "ethers";

// 対応チェーンID
export type SupportedChainId = 1 | 11155111;
export type NetworkType = "ETHEREUM_MAINNET" | "SEPOLIA_TESTNET";

// ネットワーク定義
export const NETWORKS = {
  ETHEREUM_MAINNET: {
    name: "Ethereum",
    symbol: "ETH",
    id: 1 as SupportedChainId,
    blockExplorer: "https://etherscan.io",
    rpcUrl: "https://eth-mainnet.public.blastapi.io",
  },
  SEPOLIA_TESTNET: {
    name: "Sepolia",
    symbol: "ETH",
    id: 11155111 as SupportedChainId,
    blockExplorer: "https://sepolia.etherscan.io",
    rpcUrl: "https://eth-sepolia.public.blastapi.io",
  }
};

// 切り替え可能な現在ネットワーク設定
const CURRENT_CONFIG = {
  NETWORK: "SEPOLIA_TESTNET" as NetworkType
};

// コントラクト設定
const CONTRACT_CONFIGS: Record<NetworkType, ContractConfig> = {
  ETHEREUM_MAINNET: {
    burnContract: {
      address: "0x123abc...", // ← 実際のアドレスに書き換えてね
      tokenIds: [1],
      phaseId: 1,
    },
    mintContract: {
      address: "0xdef456...", // ← 実際のアドレスに書き換えてね
      tokenId: 2,
    },
  },
  SEPOLIA_TESTNET: {
    burnContract: {
      address: "0x9A58D9c11f07dC281fceA1b3EB4a05501e81FC4E",
      tokenIds: [1],
      phaseId: 1,
    },
    mintContract: {
      address: "0x9A58D9c11f07dC281fceA1b3EB4a05501e81FC4E",
      tokenId: 2,
    },
  },
};

// フェーズ & トークン設定（固定値でOK）
export const PHASE_ID = 1;
export const BURN_TOKEN_ID = 1;
export const REWARD_TOKEN_ID = 2;

export interface ContractConfig {
  burnContract: {
    address: string;
    tokenIds: number[];    // ※ ERC1155用：使用するtokenIdを配列で明示（1つでも配列）
    phaseId: number;       // ※ 新規追加：現在使用中のフェーズID（例: 1）
  };
  mintContract: {
    address: string;
    tokenId: number;       // ※ ERC1155用：リワードトークンID（例: 2）
  };
}

// NetworkConfig インターフェースに合わせた実装
export interface NetworkConfig {
  chainId: SupportedChainId;
  explorers: Record<SupportedChainId, string>;
  contracts: Record<SupportedChainId, ContractConfig>;
  getExplorerUrl: () => string;
  getContractConfig: () => ContractConfig;

  // 💡 追加（使うかは任意）：現在のburn/mint情報を分離取得したい場合
  getBurnTokenId: () => number;
  getRewardTokenId: () => number;
  getPhaseId: () => number;
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
  getExplorerUrl: function () {
    return this.explorers[this.chainId];
  },

  // Get contract config based on current chainId
  getContractConfig: function () {
    return this.contracts[this.chainId];
  },

    // 🔥 追加: 現在のburnTokenIdを取得
    getBurnTokenId: function () {
      return this.getContractConfig().burnContract.tokenIds?.[0] ?? 0;
    },
  
    // 🎁 追加: 現在のrewardTokenIdを取得
    getRewardTokenId: function () {
      return this.getContractConfig().mintContract.tokenId ?? 0;
    },
  
    // 📦 追加: 現在のphaseIdを取得
    getPhaseId: function () {
      return this.getContractConfig().burnContract.phaseId;
    },
  
};

// ハードコードされた設定の取得
export function getCurrentChainId(): SupportedChainId {
  return NETWORKS[CURRENT_CONFIG.NETWORK].id;
}

export function getCurrentNetwork() {
  return NETWORKS[CURRENT_CONFIG.NETWORK];
}

// 現在のチェーン設定を取得
export function getCurrentChainConfig() {
  return NETWORKS[CURRENT_CONFIG.NETWORK];
}

// 現在のコントラクト設定を取得
export const getCurrentContractConfig = (): ContractConfig => {
  return CONTRACT_CONFIGS[CURRENT_CONFIG.NETWORK];
};

export function getBurnContractAddress(): string {
  return CONTRACT_CONFIGS[CURRENT_CONFIG.NETWORK].burnContract.address;
}

export function getExplorerUrl(): string {
  return NETWORKS[CURRENT_CONFIG.NETWORK].blockExplorer;
}

export function getTransactionUrl(txHash: string): string {
  return `${getExplorerUrl()}/tx/${txHash}`;
}

// ethers Provider（非推奨／SSRで無効化）
export const getProvider = () => {
  if (typeof window === "undefined") {
    console.warn("[WARNING] getProvider was called on server side.");
    return null;
  }
  return new ethers.JsonRpcProvider(getCurrentNetwork().rpcUrl);
};

// wagmi用チェーン一覧
export const getSupportedChains = () => [mainnet, sepolia] as const;

// 手動ネットワーク切り替え
export function setNetwork(network: NetworkType) {
  CURRENT_CONFIG.NETWORK = network;
  console.log(`Network switched to: ${network}`);
  return getCurrentNetwork();
}

export function setToMainnet() {
  return setNetwork("ETHEREUM_MAINNET");
}

export function setToSepolia() {
  return setNetwork("SEPOLIA_TESTNET");
}
