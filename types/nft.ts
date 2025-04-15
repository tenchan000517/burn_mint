export type NFTType = "burn" | "premium";

export interface NFT {
  tokenId: number;
  instanceId?: number;
  name: string;
  image: string;
  type: NFTType;
  phaseId: number; // ← これが必須
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Record<string, any>[];
}

export interface NFTDisplayOptions {
  showType?: boolean;
  showTokenId?: boolean;
  linkToExplorer?: boolean;
}

export type SelectedNFT = {
  tokenId: number;
  instanceId: number;
};