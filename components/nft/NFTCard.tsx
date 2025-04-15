'use client';

import { useEffect, useRef, memo } from "react";
import Image from "next/image";
import { useMetadata } from "@/contexts/MetadataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NFTType } from "@/types/nft";
import { Rocket, Flame, Check } from "lucide-react";
import { getTransactionUrl, getBurnContractAddress, getCurrentNetwork, getCurrentChainId } from "@/config/network";
import { motion } from "framer-motion";

interface NFTCardProps {
  tokenId: number;
  type: NFTType;
  isSelected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  showBadge?: boolean;
  showDetails?: boolean;
  animationDelay?: number;
}

// メディアコンポーネントを別コンポーネントとして分離
const NFTMedia = memo(function NFTMedia({ imageUrl, name, isSelected }: { imageUrl: string, name: string, isSelected: boolean }) {
  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const isVideo = imageUrl.toLowerCase().endsWith('.mp4');
  const isGif = imageUrl.toLowerCase().endsWith('.gif');

  // コンポーネントがマウントされたときにのみメディアをロード
  useEffect(() => {
    if (isVideo && mediaRef.current) {
      // 動画の再生を保証
      mediaRef.current.play().catch(err => {
        console.warn(`動画の自動再生でエラーが発生しました: ${err}`);
      });
    }
  }, [isVideo]);

  if (isVideo) {
    return (
      <video
        ref={mediaRef}
        src={imageUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  } else if (isGif) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  } else {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        priority={isSelected}
        quality={90}
        sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 16vw"
        unoptimized={imageUrl.toLowerCase().includes('.gif')}
      />
    );
  }
});

// パフォーマンス最適化のためコンポーネントをメモ化
const NFTCard = memo(function NFTCard({
  tokenId,
  type,
  isSelected = false,
  onClick,
  selectable = false,
  showBadge = true,
  showDetails = true,
  animationDelay = 0
}: NFTCardProps) {
  const { getNftName, getNftImageUrl, getNftTypePrefix } = useMetadata();
  const { t, language } = useLanguage();

  // メタデータからNFT情報を取得
  const name = getNftName(type, tokenId);
  const imageUrl = getNftImageUrl(type, tokenId);

  // コントラクトアドレスを取得
  const getContractAddress = () => {
    return getBurnContractAddress();
  };

  // 現在のネットワーク情報を取得
  const network = getCurrentNetwork();
  const chainId = getCurrentChainId();
  const contractAddress = getContractAddress();

  // OpenSeaとMagic Edenのリンクを生成
  const getOpenSeaUrl = () => {
    const networkName = network.name.toLowerCase();
    // テストネットの場合
    if (networkName === 'sepolia' || networkName === 'goerli' || networkName === 'mumbai') {
      return `https://testnets.opensea.io/ja/assets/${networkName}/${contractAddress}/${tokenId}`;
    }
    // メインネットの場合
    return `https://opensea.io/ja/assets/${networkName}/${contractAddress}/${tokenId}`;
  };

  const getMagicEdenUrl = () => {
    const networkName = network.name.toLowerCase();
    // テストネットは基本的にサポートがないのでnullを返す
    if (networkName === 'sepolia' || networkName === 'goerli' || networkName === 'mumbai') {
      return null;
    }
    // メインネットの場合
    return `https://magiceden.io/item-details/${networkName}/${contractAddress}/${tokenId}`;
  };

  // Magic Edenのリンクを取得（テストネットではnull）
  const magicEdenUrl = getMagicEdenUrl();

  // タイプラベルテキスト
  const typeLabel = getNftTypePrefix(type);

  // バーン/ミントタイプに応じた色の設定
  const isBurn = type === "burn";
  const badgeColor = isBurn ? "bg-red-500" : "bg-green-500";
  const borderColor = isBurn
    ? (isSelected ? "border-red-500" : "border-red-500/30")
    : (isSelected ? "border-emerald-500" : "border-emerald-500/30");
  const IconComponent = isBurn ? Flame : Rocket;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      className="relative p-0.5 mb-0.5"
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-violet-500 text-black w-6 h-6 rounded-full flex items-center justify-center z-9 shadow">
          <Check size={16} />
        </div>
      )}

      <div
        onClick={selectable ? onClick : undefined}
        className={`
          transition-all duration-300
          border-2 ${borderColor}
          rounded-md overflow-hidden
          ${isSelected ? 'scale-103 shadow-lg' : ''}
          ${isSelected ? 'bg-violet-500/10' : 'bg-zinc-900'}
          ${selectable ? 'cursor-pointer' : 'cursor-default'}
          ${selectable && !isSelected ? 'hover:border-violet-500/50 hover:scale-103 hover:shadow-md' : ''}
        `}
      >
        <div className="relative pt-[100%] bg-gray-900">
          <NFTMedia
            imageUrl={imageUrl}
            name={name}
            isSelected={isSelected}
          />

          {/* NFTタイプバッジ */}
          {showBadge && (
            <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-white text-xs font-medium z-9 ${badgeColor} text-black flex items-center gap-1`}>
              <IconComponent size={14} />
              {typeLabel}
            </div>
          )}
        </div>

        {showDetails && (
          <div className="p-3">
            <h3 className="text-base font-medium truncate">
              {name}
            </h3>

            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                Token ID: {tokenId}
              </span>

              <div className="flex gap-2 items-center">
                {/* OpenSeaリンク */}
                <div className="group relative">
                  <a
                    href={getOpenSeaUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-500 hover:text-violet-400"
                    title={language === 'ja' ? 'OpenSeaで表示' : 'View on OpenSea'}
                  >
                    <div className="w-5 h-5 relative">
                      <Image
                        src="/images/opensea.png"
                        alt="OpenSea"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </a>
                </div>

                {/* Magic Edenリンク（テストネット以外のみ表示） */}
                {magicEdenUrl && (
                  <div className="group relative">
                    <a
                      href={magicEdenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-400"
                      title={language === 'ja' ? 'Magic Edenで表示' : 'View on Magic Eden'}
                    >
                      <div className="w-5 h-5 relative">
                        <Image
                          src="/images/ME_Wallet_AppIcon.png"
                          alt="Magic Eden"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default NFTCard;