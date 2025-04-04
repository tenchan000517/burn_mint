"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';
import { SupportedLanguage } from '@/types/language';

// 共通メタデータの型定義
export interface AppMetadata {
  project: {
    name: string;
    shortName: string;
    official: string;
    description: string;
    logo?: string; // ロゴのパスを追加
  };
  nft: {
    burn: {
      prefix: string;
      baseUrl: string;
    };
    premium: {
      prefix: string;
      baseUrl: string;
    };
  };
  social: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

// 言語ごとのメタデータ定義
const metadataByLanguage: Record<SupportedLanguage, AppMetadata> = {
  en: {
    project: {
      name: "Villain NFT Burn",
      shortName: "Villain Burn",
      official: "0xVillain",
      description: "Burn 5 {burnNftName} NFTs to claim a rare {premiumNftName} NFT!",
      logo: "/images/logo.png" // ロゴのパスを追加
    },
    nft: {
      burn: {
        prefix: "NFT-A(burn nft)",
        baseUrl: "https://0xmavillain.com/data/nft/burn/images"
      },
      premium: {
        prefix: "NFT-B(mint nft)",
        baseUrl: "https://0xmavillain.com/data/nft/mint/images"
      }
    },
    social: {
      twitter: "https://x.com/0xMAvillain",
      discord: "https://discord.gg/cNqJwaUTvH",
      
    }
  },
  ja: {
    project: {
      name: "プロジェクトタイトル",
      shortName: "ヘッダータイトル",
      official: "0xVillain",
      description: "5つの{burnNftName}をバーンして{premiumNftName}をクレームしよう！",
      logo: "/images/logo.png" // ロゴのパスを追加
    },
    nft: {
      burn: {
        prefix: "NFT-A(burn nft)",
        baseUrl: "https://0xmavillain.com/data/nft/burn/images"
      },
      premium: {
        prefix: "NFT-B(mint nft)", 
        baseUrl: "https://0xmavillain.com/data/nft/mint/images"
      }
    },
    social: {
      twitter: "https://x.com/0xMAvillain",
      discord: "https://discord.gg/cNqJwaUTvH"
    }
  }
};

interface MetadataContextType {
  metadata: AppMetadata;
  getNftName: (type: "burn" | "premium", tokenId: number) => string;
  getNftImageUrl: (type: "burn" | "premium", tokenId: number) => string;
  getNftTypePrefix: (type: "burn" | "premium") => string;
  getFormattedDescription: () => string;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export function MetadataProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  
  // 現在の言語に基づいてメタデータを取得
  const metadata = metadataByLanguage[language];
  
  // NFT名を生成するヘルパー関数
  const getNftName = (type: "burn" | "premium", tokenId: number): string => {
    const prefix = metadata.nft[type].prefix;
    return `${prefix} #${tokenId}`;
  };
  
  // NFT画像URLを生成するヘルパー関数
  const getNftImageUrl = (type: "burn" | "premium", tokenId: number): string => {
    const baseUrl = metadata.nft[type].baseUrl;
    return `${baseUrl}/${tokenId}.png`;
  };
  
  // NFTタイプのプレフィックスを取得するヘルパー関数
  const getNftTypePrefix = (type: "burn" | "premium"): string => {
    return metadata.nft[type].prefix;
  };
  
  // 説明文のプレースホルダーを実際のNFT名に置き換えるヘルパー関数
  const getFormattedDescription = (): string => {
    let desc = metadata.project.description;
    desc = desc.replace('{burnNftName}', metadata.nft.burn.prefix);
    desc = desc.replace('{premiumNftName}', metadata.nft.premium.prefix);
    return desc;
  };
  
  return (
    <MetadataContext.Provider value={{ 
      metadata, 
      getNftName, 
      getNftImageUrl,
      getNftTypePrefix,
      getFormattedDescription
    }}>
      {children}
    </MetadataContext.Provider>
  );
}

// メタデータにアクセスするためのカスタムフック
export function useMetadata() {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
}