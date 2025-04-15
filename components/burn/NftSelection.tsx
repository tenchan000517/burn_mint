'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { getBurnContractAddress, networkConfig } from "@/config/network";
import burnAbi from "@/config/ThePool.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import NFTCard from "@/components/nft/NFTCard";
import { RefreshCw, ImageOff } from "lucide-react";
import TestMintButton from "@/components/debug/TestMintButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { NFT } from "@/types/nft";

// 親コンポーネントとの互換性を保ちながら、インスタンスを追跡するための新しいインターフェース
interface NftSelectionProps {
  selectedNFTs: number[];
  setSelectedNFTs: React.Dispatch<React.SetStateAction<number[]>>;
  disabled?: boolean;
  burnTxHash?: string | null;
}

// 選択されたNFTを表すための型
interface SelectedNFTInstance {
  tokenId: number;
  instanceId: number;
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
  
  // 選択されたインスタンスを追跡する新しい状態
  const [selectedInstances, setSelectedInstances] = useState<SelectedNFTInstance[]>([]);

  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const isNetworkCorrect = useNetworkCheck();
  const { t, formatMessage } = useLanguage();
  const { getNftName, getNftImageUrl } = useMetadata();

  // バーン完了後にNFTリストを再ロード
  useEffect(() => {
    if (burnTxHash) {
      setRefreshCounter(prev => prev + 1);
      setSelectedNFTs([]); // 親コンポーネントの形式をリセット
      setSelectedInstances([]); // 内部状態もリセット
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

        const burnTokenIds = networkConfig.getContractConfig().burnContract.tokenIds;
        const phaseId = networkConfig.getPhaseId();

        const nftData: NFT[] = [];

        for (const tokenId of burnTokenIds) {
          const balance: ethers.BigNumberish = await contract.balanceOf(address, tokenId);
          console.log(`[DEBUG] balanceOf(${address}, tokenId=${tokenId}) =`, balance.toString());

          const quantity = Number(balance);

          for (let i = 0; i < quantity; i++) {
            nftData.push({
              tokenId,
              instanceId: i,
              name: getNftName("burn", tokenId),
              image: getNftImageUrl("burn", tokenId),
              type: "burn",
              phaseId,
            });
          }
        }

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

  // NFT選択の切り替え - 実際にクリックされたカードを選択する新しいロジック
  const toggleNFT = (tokenId: number, instanceId: number) => {
    if (disabled) return;
    
    // すでに選択されているかチェック
    const existingIndex = selectedInstances.findIndex(
      instance => instance.tokenId === tokenId && instance.instanceId === instanceId
    );
    
    // 選択の切り替え処理
    if (existingIndex !== -1) {
      // すでに選択されている場合は解除
      const newSelectedInstances = [...selectedInstances];
      newSelectedInstances.splice(existingIndex, 1);
      setSelectedInstances(newSelectedInstances);
      
      // 親コンポーネント用の配列も更新
      setSelectedNFTs(newSelectedInstances.map(instance => instance.tokenId));
    } else if (selectedInstances.length < 5) {
      // まだ選択されておらず、5個未満の場合は追加
      const newSelectedInstances = [...selectedInstances, { tokenId, instanceId }];
      setSelectedInstances(newSelectedInstances);
      
      // 親コンポーネント用の配列も更新
      setSelectedNFTs(newSelectedInstances.map(instance => instance.tokenId));
    }
  };

  // 親コンポーネントの状態が変更された場合、内部状態を同期
  useEffect(() => {
    if (selectedNFTs.length === 0 && selectedInstances.length === 0) {
      // 両方の状態が空の場合は何もしない
      return;
    }
    
    if (selectedNFTs.length === 0 && selectedInstances.length > 0) {
      // 親が空になった場合、内部状態もクリア
      setSelectedInstances([]);
      return;
    }
    
    // 親の選択トークンIDと内部の選択インスタンスのトークンIDが一致するか確認
    const parentTokenIds = [...selectedNFTs].sort();
    const internalTokenIds = selectedInstances.map(instance => instance.tokenId).sort();
    
    if (JSON.stringify(parentTokenIds) !== JSON.stringify(internalTokenIds)) {
      // 不一致がある場合は親の状態に合わせて内部状態を再構築
      
      // まず必要なトークンIDとその数をカウント
      const tokenCounts: Record<number, number> = {};
      selectedNFTs.forEach(tokenId => {
        tokenCounts[tokenId] = (tokenCounts[tokenId] || 0) + 1;
      });
      
      // 内部状態を再構築
      const newSelectedInstances: SelectedNFTInstance[] = [];
      
      // 各トークンIDについて、必要な数だけインスタンスを選択
      Object.entries(tokenCounts).forEach(([tokenIdStr, count]) => {
        const tokenId = Number(tokenIdStr);
        
        // 既存の選択を維持する（同じトークンIDの場合）
        const existingSelections = selectedInstances
          .filter(instance => instance.tokenId === tokenId)
          .slice(0, count);
        
        newSelectedInstances.push(...existingSelections);
        
        // 既存の選択が足りない場合は、新しいインスタンスを追加
        const remaining = count - existingSelections.length;
        if (remaining > 0) {
          // 利用可能なインスタンスを取得
          const availableInstances = nfts
            .filter(nft => nft.tokenId === tokenId)
            .filter(nft => !existingSelections.some(sel => sel.instanceId === nft.instanceId))
            .slice(0, remaining);
          
          // 利用可能なインスタンスを追加
          availableInstances.forEach(nft => {
            newSelectedInstances.push({
              tokenId: nft.tokenId,
              instanceId: nft.instanceId || 0
            });
          });
        }
      });
      
      setSelectedInstances(newSelectedInstances);
    }
  }, [selectedNFTs, nfts]);

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
        {nfts.map((nft, index) => {
          // 特定のインスタンスが選択されているかどうかを確認
          const isSelected = selectedInstances.some(
            instance => instance.tokenId === nft.tokenId && instance.instanceId === (nft.instanceId || 0)
          );
          
          return (
            <div key={`${nft.tokenId}-${nft.instanceId}`}>
              <NFTCard
                tokenId={nft.tokenId}
                type={nft.type}
                isSelected={isSelected}
                onClick={() => toggleNFT(nft.tokenId, nft.instanceId || 0)}
                selectable={!disabled}
                animationDelay={index * 0.05}
              />
            </div>
          );
        })}
      </div>

      {selectedInstances.length > 0 && selectedInstances.length < 5 && (
        <div className="mt-3 text-center">
          <span className="inline-flex px-3 py-3 rounded-full text-sm border border-amber-500 text-amber-500">
            {formatMessage('nftSelection.selectFive', {
              selected: selectedInstances.length,
            })}
          </span>
        </div>
      )}

      {/* {selectedInstances.length === 5 && (
        <div className="mt-3 text-center">
          <span className="inline-flex px-3 py-3 rounded-full text-sm border border-primary text-primary">
            {formatMessage('nftSelection.selectedNfts', {
              ids: selectedInstances.map(instance => `#${instance.tokenId}`).join(', '),
            })}
          </span>
        </div>
      )} */}
    </div>
  );
}