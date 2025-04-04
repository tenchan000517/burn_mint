'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { getBurnContractAddress } from "@/config/network";
import burnAbi from "@/contracts/BurnNFT.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import NFTCard from "@/components/nft/NFTCard";
import { RefreshCw, ImageOff } from "lucide-react";
import TestMintButton from "@/components/debug/TestMintButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { NFT } from "@/types/nft";

interface NftSelectionProps {
  selectedNFTs: number[];
  setSelectedNFTs: (tokenIds: number[]) => void;
  disabled?: boolean;
  burnTxHash?: string | null;
}

export default function NftSelection({
  selectedNFTs,
  setSelectedNFTs,
  disabled = false,
  burnTxHash = null
}: NftSelectionProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const isNetworkCorrect = useNetworkCheck();
  const { t, formatMessage } = useLanguage();
  const { getNftName, getNftImageUrl } = useMetadata();

  // バーン完了後にNFTリストを再ロード
  useEffect(() => {
    if (burnTxHash) {
      setRefreshCounter(prev => prev + 1);
      setSelectedNFTs([]);
    }
  }, [burnTxHash, setSelectedNFTs]);

  // NFTリストの取得
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !address || !signer || disabled) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const contractAddress = getBurnContractAddress();
        const contract = new ethers.Contract(contractAddress, burnAbi, signer);

        const ownedTokenIds = await contract.tokensOwnedBy(address);

        const nftData = ownedTokenIds.map((tokenId: ethers.BigNumberish) => {
          const numTokenId = Number(tokenId);
          return {
            tokenId: numTokenId,
            name: getNftName("burn", numTokenId),
            image: getNftImageUrl("burn", numTokenId),
            type: "burn" as const
          };
        });

        setNfts(nftData);
      } catch (error) {
        console.error("[DEBUG] Error fetching NFTs:", error);
        setLoadError(t('errors.transaction.generic'));
        setNfts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNFTs();
  }, [address, signer, isConnected, disabled, refreshCounter, getNftName, getNftImageUrl, t]);

  // 選択されたNFTの検証（所有しているかの確認）
  useEffect(() => {
    const validSelectedNFTs = selectedNFTs.filter(id =>
      nfts.some(nft => nft.tokenId === id)
    );

    if (validSelectedNFTs.length !== selectedNFTs.length) {
      setSelectedNFTs(validSelectedNFTs);
    }
  }, [nfts, selectedNFTs, setSelectedNFTs]);

  // NFT選択の切り替え
  const toggleNFT = (tokenId: number) => {
    if (disabled) return;

    if (selectedNFTs.includes(tokenId)) {
      setSelectedNFTs(selectedNFTs.filter(id => id !== tokenId));
    } else if (selectedNFTs.length < 5) {
      setSelectedNFTs([...selectedNFTs, tokenId]);
    }
  };

  // 手動更新機能
  const handleRefresh = async () => {
    setRefreshCounter(prev => prev + 1);
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
          </div>
        </div>
        <p className="text-gray-500">
          {t('home.loadingNfts')}
        </p>
      </div>
    );
  }

  // NFTなし状態
  if (nfts.length === 0) {
    return (
      <div className="py-5 text-center">
        {loadError ? (
          <div className="max-w-[400px] mx-auto mb-3 border border-red-500 bg-red-50 bg-opacity-10 rounded-lg p-4 text-red-500">
            {loadError}
          </div>
        ) : (
          <div className="mb-3">
            <ImageOff size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">
              {t('home.noNftsFound')}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2">
          <button
            className="flex items-center px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:bg-opacity-10 transition-colors"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} className="mr-2" />
            {t('home.refreshButton')}
          </button>
          
          {/* TestMintButton for development */}
          <TestMintButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-1">
        <p className="text-sm text-gray-300">
          {formatMessage('nftSelection.foundNfts', { count: nfts.length })}
        </p>

        <button
          onClick={handleRefresh}
          className="text-primary p-1 rounded-full hover:bg-primary hover:bg-opacity-10 transition-colors"
          title={t('nftSelection.updateList')}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 mb-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2">
        {nfts.map((nft, index) => (
          <div key={nft.tokenId}>
            <NFTCard
              tokenId={nft.tokenId}
              type={nft.type}
              isSelected={selectedNFTs.includes(nft.tokenId)}
              onClick={() => toggleNFT(nft.tokenId)}
              selectable={!disabled}
              animationDelay={index * 0.05}
            />
          </div>
        ))}
      </div>
      
      {selectedNFTs.length > 0 && selectedNFTs.length < 5 && (
        <div className="mt-3 text-center">
          <span className="inline-flex px-3 py-3 rounded-full text-sm border border-amber-500 text-amber-500">
            {formatMessage('nftSelection.selectFive', { selected: selectedNFTs.length })}
          </span>
        </div>
      )}
      
      {selectedNFTs.length === 5 && (
        <div className="mt-3 text-center">
          <span className="inline-flex px-3 py-3 rounded-full text-sm border border-primary text-primary">
            {formatMessage('nftSelection.selectedNfts', { ids: selectedNFTs.join(', #') })}
          </span>
        </div>
      )}
    </div>
  );
}