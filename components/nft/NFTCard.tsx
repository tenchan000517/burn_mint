'use client';

import Image from "next/image";
import { useMetadata } from "@/contexts/MetadataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NFTType } from "@/types/nft";
import { Rocket, Flame, ExternalLink, Check } from "lucide-react";
import { getTransactionUrl, getBurnContractAddress, getMintContractAddress } from "@/config/network";
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

export default function NFTCard({
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
    return type === "burn" ? getBurnContractAddress() : getMintContractAddress();
  };

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
        <div className="absolute -top-2 -right-2 bg-violet-500 text-black w-6 h-6 rounded-full flex items-center justify-center z-10 shadow">
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
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            priority={isSelected}
            quality={90}
            sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 16vw"
          />

          {/* NFTタイプバッジ */}
          {showBadge && (
            <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-white text-xs font-medium z-10 ${badgeColor} text-black flex items-center gap-1`}>
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
              
              <div className="group relative">
                <a
                  href={`${getTransactionUrl('')}/token/${getContractAddress()}?a=${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-500 hover:text-violet-400"
                  title={language === 'ja' ? 'ブロックエクスプローラーで表示' : 'View on Block Explorer'}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}