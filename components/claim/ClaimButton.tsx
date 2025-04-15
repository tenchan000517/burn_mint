"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { getBurnContractAddress, networkConfig } from "@/config/network";
import mintAbi from "@/config/ThePool.json";
import { Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { isMobile, isIOS, isMetaMaskBrowser } from '@/utils/deviceDetection';
import { openMetaMaskDeepLink } from '@/utils/walletConnection';
import QuantityIndicator from "@/components/ui/quantityIndicator";

export default function ClaimButton({
  setClaimTxHash,
}: {
  setClaimTxHash: (hash: string) => void;
}) {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mintAmount, setMintAmount] = useState(1); // 数量インジケーター用の状態
  const [mintableAmount, setMintableAmount] = useState(0); // 自身でミント可能数を管理
  const { t, language } = useLanguage();
  const { getNftTypePrefix } = useMetadata();

  // プレミアムNFTの名前を取得
  const premiumNftName = getNftTypePrefix("premium");

  useEffect(() => {
    setIsClient(true);
    setLoadingText(t('claim.processingClaim'));
  }, [t]);

  // ミント可能数を取得する
  useEffect(() => {
    const getMintableAmount = async () => {
      if (!signer) return;
      
      try {
        const contractAddress = getBurnContractAddress();
        const contract = new ethers.Contract(contractAddress, mintAbi, signer);
        
        // ウォレットアドレスを取得
        const address = await signer.getAddress();
        console.log("[DEBUG] Wallet address for claim check:", address);
        
        // フェーズIDを取得
        const phaseId = networkConfig.getPhaseId();
        console.log("[DEBUG] Using phaseId for claim check:", phaseId);
        
        // コントラクトからクレーム可能な数量を取得
        // フェーズIDとアドレスを引数として渡す
        const claimable = await contract.getClaimableAmount(address, phaseId);
        console.log("[DEBUG] Claimable amount in ClaimButton:", claimable);
        
        // BigNumberを数値に変換
        const amount = Number(claimable);
        console.log("[DEBUG] Converted mintable amount in ClaimButton:", amount);
        
        // 状態を更新
        setMintableAmount(amount);
        
        // フェーズ情報を取得して状態を確認
        try {
          const phaseInfo = await contract.getPhaseInfo(phaseId);
          console.log("[DEBUG] Phase status in ClaimButton:", phaseInfo.status);
          
          // Inactiveなら表示しない
          if (Number(phaseInfo.status) === 0) {
            setMintableAmount(0);
          }
        } catch (error) {
          console.error("[DEBUG] Error checking phase info:", error);
        }
      } catch (error) {
        console.error("[DEBUG] Error fetching mintable amount in ClaimButton:", error);
        setMintableAmount(0);
      }
    };
    
    getMintableAmount();
  }, [signer]);

  // Monitor transaction progress
  useEffect(() => {
    if (!pendingTx || !signer) return;
    
    let isSubscribed = true;
    
    const monitorTransaction = async () => {
      try {
        setLoadingText(t('claim.transactionConfirming'));
        
        const provider = signer.provider;
        if (!provider) return;
        
        const receipt = await provider.waitForTransaction(pendingTx, 1);
        
        if (!isSubscribed) return;
        
        if (receipt && receipt.status === 1) {
          console.log("[DEBUG] Claim transaction confirmed:", receipt);
          setClaimTxHash(pendingTx);
        } else {
          console.error("[DEBUG] Transaction failed:", receipt);
          setErrorMessage(t('errors.transaction.failed'));
        }
      } catch (error) {
        console.error("[DEBUG] Error monitoring transaction:", error);
        setErrorMessage(t('errors.transaction.monitoring'));
      } finally {
        if (isSubscribed) {
          setPendingTx(null);
          setLoading(false);
          setLoadingText(t('claim.processingClaim'));
        }
      }
    };
    
    monitorTransaction();
    
    return () => {
      isSubscribed = false;
    };
  }, [pendingTx, signer, setClaimTxHash, t]);

  const claimNFT = async () => {
    if (!signer) {
      // Check if we should use deep linking
      if (isMobile() && isIOS() && !isMetaMaskBrowser()) {
        openMetaMaskDeepLink();
        return;
      }
      
      alert(t('burn.walletNotConnected'));
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const contractAddress = getBurnContractAddress();
      const contract = new ethers.Contract(contractAddress, mintAbi, signer);
      
      // Call the contract's claimNFT function
      // フェーズIDを取得
      const phaseId = networkConfig.getPhaseId();
      console.log("[DEBUG] Using phaseId for claim:", phaseId);
      
      // 数量インジケーターから選択された数量を使用
      const claimAmount = mintAmount;

      // Call the contract's claimReward function with phaseId
      const tx = await contract.claimReward(phaseId, claimAmount);
      console.log("[DEBUG] Claim transaction sent:", tx.hash);
      
      // Save transaction hash
      setPendingTx(tx.hash);
      
    } catch (error: any) {
      console.error("Error claiming NFT:", error);
      
      // Set error message
      let userMessage = t('errors.transaction.generic');
      
      if (error.message) {
        if (error.message.includes("execution reverted")) {
          if (error.message.includes("No NFTs to claim")) {
            userMessage = t('errors.claim.noNftsToFlaim');
          } else if (error.message.includes("not enough burned")) {
            userMessage = t('errors.claim.notEnoughBurned');
          }
        } else if (error.message.includes("user rejected transaction")) {
          userMessage = t('errors.transaction.userRejected');
        }
      }
      
      setErrorMessage(userMessage);
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  // クレームボタンのテキスト (言語対応)
  const getClaimButtonText = () => {
    if (loading) {
      return loadingText;
    }
    
    return language === 'ja' 
      ? `${mintAmount}個の${premiumNftName}をクレーム` 
      : `Claim ${mintAmount} ${premiumNftName}${mintAmount > 1 ? 's' : ''}`;
  };

  return (
    <div className="text-center">
      <motion.div
        whileHover={!loading ? { scale: 1.05 } : undefined}
        whileTap={!loading ? { scale: 0.95 } : undefined}
      >
        <button
          className="flex items-center justify-center px-1 py-3 bg-gradient-to-r from-green-400 to-green-300 hover:from-green-300 hover:to-green-400 text-black rounded-full shadow-sm text-lg font-medium w-80 transition-colors disabled:opacity-70"
          onClick={claimNFT}
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Gift className="mr-2 md:mr-2" size={20} />
          )}
          <span>{getClaimButtonText()}</span>
        </button>
      </motion.div>
      
      {/* 数量インジケーター - ミント可能数量が2以上の場合のみ表示（1は表示しない） */}
      {mintableAmount > 1 && !loading && !pendingTx && (
        <div className="mt-4 flex justify-center">
          <QuantityIndicator 
            mintAmount={mintAmount} 
            setMintAmount={setMintAmount} 
            maxMintAmount={Math.min(mintableAmount, 10)} // ミント可能数量と10の小さい方を上限とする
          />
        </div>
      )}
      
      {/* エラーメッセージ - 中央揃え */}
      {errorMessage && (
        <div className="mt-3 mx-auto max-w-md rounded-xl border border-red-500 bg-red-500/10 p-4 text-red-400 text-center">
          {errorMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}