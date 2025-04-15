'use client';

import { useState, useEffect, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { getBurnContractAddress, getCurrentChainConfig, networkConfig } from "@/config/network";
import mintAbi from "@/config/ThePool.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import NftSelection from "@/components/burn/NftSelection";
import BurnButton from "@/components/burn/BurnButton";
import BurnStatus from "@/components/burn/BurnStatus";
import ClaimButton from "@/components/claim/ClaimButton";
import ClaimStatus from "@/components/claim/ClaimStatus";
import LoadingScreen from "@/components/ui/loadingScreen";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import Head from "next/head";
import dynamic from "next/dynamic";

// react-confettiをクライアントサイドでのみ読み込むようにする
const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false,
});

export default function HomePage() {
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [burnTxHash, setBurnTxHash] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isLoadingHidden, setIsLoadingHidden] = useState(false);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [isCheckingClaims, setIsCheckingClaims] = useState(false);
  const claimSectionRef = useRef<HTMLDivElement>(null);
  
  // 紙吹雪アニメーション用の状態
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const isNetworkCorrect = useNetworkCheck();
  const currentNetwork = getCurrentChainConfig();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const signer = useEthersSigner();
  const { t, formatMessage } = useLanguage();
  const { metadata, getNftName, getFormattedDescription } = useMetadata();

  // ウィンドウサイズの監視
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // タイトルを動的に設定
  useEffect(() => {
    document.title = metadata.project.name;
  }, [metadata.project.name]);

  // Update claim state after burn transaction is completed
  useEffect(() => {
    if (burnTxHash) {
      setClaimTxHash(null);
    }
  }, [burnTxHash]);

  // クレーム成功時の紙吹雪アニメーション
  useEffect(() => {
    if (claimTxHash) {
      // クレームトランザクションが設定されたら紙吹雪を表示
      setShowConfetti(true);
      
      // 5秒後に紙吹雪を非表示に
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [claimTxHash]);

  // Check claim rights
  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!isNetworkCorrect || !address || !signer) return;

      setIsCheckingClaims(true);
      try {
        const contractAddress = getBurnContractAddress();
        const contract = new ethers.Contract(contractAddress, mintAbi, signer);
        const phaseId = networkConfig.getPhaseId();

        try {
          // フェーズIDとアドレスの両方を引数として渡す
          const claimable = await contract.getClaimableAmount(address, phaseId);
          console.log(`[DEBUG] Claimable amount: ${claimable}`);
          setClaimableAmount(Number(claimable));
          
          // フェーズ情報を取得して状態を確認
          const phaseInfo = await contract.getPhaseInfo(phaseId);
          console.log(`[DEBUG] Phase status: ${phaseInfo.status}`);
          
          // Inactiveなら表示しない
          if (Number(phaseInfo.status) === 0) {
            setClaimableAmount(0);
          }
        } catch (error) {
          console.error("[DEBUG] Error calling getClaimableAmount:", error);
          setClaimableAmount(0);
        }
      } catch (error) {
        console.error("[DEBUG] Error in checkClaimStatus:", error);
      }
      setIsCheckingClaims(false);
    };

    checkClaimStatus();
  }, [address, signer, burnTxHash, isNetworkCorrect]);

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPageLoaded) {
      const timer = setTimeout(() => {
        setIsLoadingHidden(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isPageLoaded]);

  return (
    <>
      {/* 紙吹雪アニメーション - クレーム成功時のみ表示 */}
      {showConfetti && (
        <ReactConfetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#FFD700', '#FFA500', '#FF4500', '#FF1493', '#9400D3', '#4B0082']} // お祝いっぽい色
        />
      )}

      {/* メタデータの追加 */}
      <Head>
        <title>{metadata.project.name}</title>
        <meta name="description" content={getFormattedDescription()} />
        <meta property="og:title" content={metadata.project.name} />
        <meta property="og:description" content={getFormattedDescription()} />
        <meta name="twitter:title" content={metadata.project.name} />
        <meta name="twitter:description" content={getFormattedDescription()} />
      </Head>

      {/* Loading animation - LoadingScreenコンポーネントを使用 */}
      <LoadingScreen
        isPageLoaded={isPageLoaded}
        isLoadingHidden={isLoadingHidden}
        message={t('home.loadingMessage')}
      />

      {/* Main content */}
      <div className="container max-w-screen-lg mx-auto my-0 md:my-12 px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h1
                className="text-3xl sm:text-5xl font-bold mb-2 md:mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide"
              >
                {metadata.project.name}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <h6 className="text-sm sm:text-lg text-gray-400 max-w-xl mx-auto mb-2 md:mb-6 leading-relaxed px-4 sm:px-0">
                {getFormattedDescription()}
              </h6>
            </motion.div>
          </div>

          {/* Claim section */}
          {isNetworkCorrect && claimableAmount > 0 && !claimTxHash && (
            <motion.div
              ref={claimSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <div className="mb-6 md:mb-16 bg-gradient-to-r from-green-900/10 to-green-900/1 border border-green-800 rounded-lg shadow-lg shadow-green-900/30">
                <div className="px-2 py-10 md:py-8 flex flex-col items-center justify-center text-center">
                  <h5 className="text-green-400 text-lg md:text-2xl font-semibold mb-6">
                    {formatMessage('home.claimableNfts', {
                      count: claimableAmount,
                      premiumNftName: metadata.nft.premium.prefix
                    })}
                  </h5>
                  <ClaimButton setClaimTxHash={setClaimTxHash} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Claim status - クレーム成功時にはアニメーション付きの表示 */}
          {claimTxHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="mb-16">
                <div className="mb-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.3
                    }}
                    className="inline-block"
                  >
                    <span className="text-4xl md:text-6xl">🎉</span>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-xl md:text-3xl font-bold text-green-400 mt-4"
                  >
                    {t('claim.successTitle') || 'Claim Successful!'}
                  </motion.h2>
                </div>
                <ClaimStatus txHash={claimTxHash} />
              </div>
            </motion.div>
          )}

          {/* NFT selection section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <div className="mb-4 md:mb-16 bg-gray-900 rounded-lg shadow-lg">
              <div className="p-2 sm:p-6">
                <div className="flex items-center py-2 md:mb-6">
                  <Flame className="text-primary mr-2 text-red-400" size={24} />
                  <h5 className="text-xl font-semibold">
                    {t('home.burnSectionTitle')}
                  </h5>
                </div>

                <NftSelection
                  selectedNFTs={selectedNFTs}
                  setSelectedNFTs={setSelectedNFTs}
                  disabled={!isNetworkCorrect || !isConnected}
                  burnTxHash={burnTxHash}
                />
              </div>
            </div>
          </motion.div>

          {/* Burn button section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <div className="mb-6 flex justify-center">
              <BurnButton
                selectedNFTs={selectedNFTs}
                setBurnTxHash={setBurnTxHash}
              />
            </div>
          </motion.div>

          {/* Burn status */}
          {burnTxHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mt-16">
                <BurnStatus
                  txHash={burnTxHash}
                  onCheckPremium={() => {
                    // クレームボタンがアクティブ（claimableAmount > 0）の場合のみスクロール
                    if (claimableAmount > 0) {
                      // ページ最上部へスクロール
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      // クレーム可能でない場合は、ユーザーに通知するかも
                      console.log("まだクレーム可能なNFTがありません");
                      // オプションでアラートなどを表示
                      // alert("現在クレーム可能なプレミアムNFTはありません。");
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}