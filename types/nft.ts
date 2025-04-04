export type NFTType = "burn" | "premium";

export interface NFT {
  tokenId: number;
  name: string;
  image: string;
  type: NFTType;
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