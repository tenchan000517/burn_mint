"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { getMintContractAddress } from "@/config/network";
import mintAbi from "@/contracts/MintNFT.json";
import { Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { isMobile, isIOS, isMetaMaskBrowser } from '@/utils/deviceDetection';
import { openMetaMaskDeepLink } from '@/utils/walletConnection';

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
  const { t, language } = useLanguage();
  const { getNftTypePrefix } = useMetadata();

  // プレミアムNFTの名前を取得
  const premiumNftName = getNftTypePrefix("premium");

  useEffect(() => {
    setIsClient(true);
    setLoadingText(t('claim.processingClaim'));
  }, [t]);

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
      const contractAddress = getMintContractAddress();
      const contract = new ethers.Contract(contractAddress, mintAbi, signer);
      
      // Call the contract's claimNFT function
      const tx = await contract.claimNFT();
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
      ? `${premiumNftName}をクレーム` 
      : `Claim ${premiumNftName}`;
  };

  // クレーム可能メッセージ (言語対応)
  // const getClaimableMessage = () => {
  //   return language === 'ja'
  //     ? `クレーム可能な${premiumNftName}があります！`
  //     : `You have claimable ${premiumNftName}s!`;
  // };

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
      
      {/* {!loading && (
        <div className="mt-2 flex items-center justify-center gap-1 text-green-400 animate-pulse">
          <Sparkles size={16} />
          <span className="text-sm font-medium">
            {getClaimableMessage()}
          </span>
          <Sparkles size={16} />
        </div>
      )} */}
      
      {errorMessage && (
        <div className="mt-3 mx-auto max-w-md rounded-xl border border-red-500 bg-red-500/10 p-4 text-red-400">
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