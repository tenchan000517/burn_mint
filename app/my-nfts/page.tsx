'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import poolAbi from "@/config/ThePool.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import Link from "next/link";
import NFTCard from "@/components/nft/NFTCard";
import {
  RefreshCw,
  ImageOff,
  Rocket,
  Flame,
  Loader2,
  Info,
  Hash
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { NFT } from "@/types/nft";
import Head from "next/head";
import LoadingScreen from "@/components/ui/loadingScreen";
import TabNavigation from "@/components/ui/tabNavigation";
import { getBurnContractAddress, networkConfig } from "@/config/network";

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [isLoadingHidden, setIsLoadingHidden] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const isNetworkCorrect = useNetworkCheck();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const { t, language } = useLanguage();
  const { metadata, getNftName, getNftImageUrl, getNftTypePrefix, getFormattedDescription } = useMetadata();

  // Page title setup
  useEffect(() => {
    const pageName = t('myNfts.pageTitle');
    document.title = `${pageName} | ${metadata.project.name}`;
  }, [metadata.project.name, language, t]);

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPageLoaded) {
      const timer = setTimeout(() => {
        setIsLoadingHidden(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isPageLoaded]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshCounter(prev => prev + 1);
  };

  // デバッグ情報の表示切り替え
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // フェーズ選択ハンドラー
  const handlePhaseSelect = (phaseId: number | null) => {
    setSelectedPhase(phaseId);
    setRefreshCounter(prev => prev + 1);
  };

  // Fetch NFT data from ERC1155 contract
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !address || !signer || !isNetworkCorrect) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const contractAddress = getBurnContractAddress();
        const contract = new ethers.Contract(contractAddress, poolAbi, signer);

        console.log("[DEBUG] Fetching NFTs for address", address);

        // 利用可能なフェーズIDを取得
        const phaseId = selectedPhase !== null ? selectedPhase : networkConfig.getPhaseId();
        const phasesToCheck = [phaseId]; // 選択されたフェーズまたはデフォルトフェーズのみを確認

        const allNftData: NFT[] = [];

        // すべての利用可能なフェーズのNFTを取得
        for (const phaseId of phasesToCheck) {
          try {
            // フェーズ情報を取得
            const phaseInfo = await contract.getPhaseInfo(phaseId);
            console.log(`[DEBUG] Phase info for phase ${phaseId}:`, phaseInfo);

            if (phaseInfo) {
              const burnTokenId = Number(phaseInfo.burnTokenId);
              const rewardTokenId = Number(phaseInfo.rewardTokenId);

              console.log(`[DEBUG] burnTokenId: ${burnTokenId}, rewardTokenId: ${rewardTokenId}`);
              console.log(`[DEBUG] Phase status: ${phaseInfo.status}`); // 0=Inactive, 1=Active, 2=ClaimOnly

              // Get balances for both burn and premium token IDs
              const [burnBalance, premiumBalance] = await Promise.all([
                contract.balanceOf(address, burnTokenId),
                contract.balanceOf(address, rewardTokenId)
              ]);

              // ここにログを追加
              console.log(`[DEBUG] Address: ${address}`);
              console.log(`[DEBUG] Burn token ID: ${burnTokenId}, Balance: ${burnBalance}`);
              console.log(`[DEBUG] Premium token ID: ${rewardTokenId}, Balance: ${premiumBalance}`);

              const numBurnBalance = Number(burnBalance);
              const numPremiumBalance = Number(premiumBalance);

              console.log(`[DEBUG] User has ${numBurnBalance} burn NFTs and ${numPremiumBalance} premium NFTs in phase ${phaseId}`);

              // プレミアムNFTのメタデータをログに出力（あれば）
              if (numPremiumBalance > 0) {
                console.log(`[DEBUG] Premium NFT name: ${getNftName("premium", rewardTokenId)}`);
                console.log(`[DEBUG] Premium NFT image URL: ${getNftImageUrl("premium", rewardTokenId)}`);
              }

              // Format burn NFT data
              for (let i = 0; i < numBurnBalance; i++) {
                allNftData.push({
                  tokenId: burnTokenId,
                  instanceId: i + 1, // Instance ID for UI display
                  name: getNftName("burn", burnTokenId),
                  image: getNftImageUrl("burn", burnTokenId),
                  type: "burn" as const,
                  phaseId: phaseId
                });
              }

              // Format premium NFT data
              for (let i = 0; i < numPremiumBalance; i++) {
                allNftData.push({
                  tokenId: rewardTokenId,
                  instanceId: i + 1, // Instance ID for UI display
                  name: getNftName("premium", rewardTokenId),
                  image: getNftImageUrl("premium", rewardTokenId),
                  type: "premium" as const,
                  phaseId: phaseId
                });
              }
            }
          } catch (error) {
            console.error(`[DEBUG] Error fetching NFTs for phase ${phaseId}:`, error);
          }
        }

        setNfts(allNftData);
      } catch (error) {
        console.error("[DEBUG] Error fetching NFTs:", error);
        setLoadError(language === 'ja'
          ? "NFTの読み込み中にエラーが発生しました。再試行してください。"
          : "An error occurred while loading NFTs. Please try again.");
        setNfts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNFTs();
  }, [
    address,
    signer,
    isConnected,
    isNetworkCorrect,
    refreshCounter,
    language,
    getNftName,
    getNftImageUrl,
    selectedPhase,
    t
  ]);

  // Filtered NFT lists for each tab
  const allNfts = nfts;
  const burnNfts = nfts.filter(nft => nft.type === "burn");
  const premiumNfts = nfts.filter(nft => nft.type === "premium");

  // Dynamically generated description
  const getMyNftsSubtitle = () => {
    const burnNftName = getNftTypePrefix("burn");
    const premiumNftName = getNftTypePrefix("premium");

    return language === 'ja'
      ? `あなたが所有している${burnNftName}と${premiumNftName}を確認できます。`
      : `View your owned ${burnNftName} and ${premiumNftName} NFTs in one place.`;
  };

  // NFT counts for each type
  const burnNftCount = burnNfts.length;
  const premiumNftCount = premiumNfts.length;

  // Function to render NFT grid
  const renderNftGrid = (nftList: NFT[]) => {
    if (nftList.length === 0) {
      return (
        <div className="py-5 text-center">
          <div className="mb-3">
            <ImageOff size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">
              {tabValue === 0
                ? t('myNfts.noNftsFound')
                : `${getNftTypePrefix(tabValue === 1 ? "burn" : "premium")}${language === 'ja' ? 'が見つかりません' : ' not found'}`
              }
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <button
              className="inline-flex items-center px-3 py-2 border border-primary text-primary rounded-full hover:bg-primary hover:bg-opacity-10 focus:outline-none transition-colors"
              onClick={handleRefresh}
            >
              <RefreshCw size={16} className="mr-2" />
              {t('myNfts.updateList')}
            </button>

            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 bg-secondary text-white rounded-full hover:bg-secondary-dark focus:outline-none transition-colors"
            >
              {t('myNfts.backToHome')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {nftList.map((nft, index) => (
          <div key={`${nft.type}-${nft.tokenId}-${nft.instanceId}-${nft.phaseId}`}>
            <NFTCard
              tokenId={nft.tokenId}
              type={nft.type}
              animationDelay={index * 0.05}
              showBadge={true}
              showDetails={true}
            />
          </div>
        ))}
      </div>
    );
  };

  // Get current NFT list based on selected tab
  const getCurrentNFTList = () => {
    switch (tabValue) {
      case 0: return allNfts;
      case 1: return burnNfts;
      case 2: return premiumNfts;
      default: return allNfts;
    }
  };

  // Tab definitions
  const tabs = [
    { id: 0, label: t('myNfts.allNfts') },
    {
      id: 1,
      label: getNftTypePrefix("burn"),
      icon: <Flame size={16} className="text-red-500" />,
      gradientClass: "from-red-400 to-red-600"
    },
    {
      id: 2,
      label: getNftTypePrefix("premium"),
      icon: <Rocket size={16} className="text-green-500" />,
      gradientClass: "from-green-400 to-green-600"
    }
  ];

  // Tab change handler
  const handleTabChange = (newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <>
      {/* Metadata */}
      <Head>
        <title>{`${t('myNfts.pageTitle')} | ${metadata.project.name}`}</title>
        <meta name="description" content={getFormattedDescription()} />
        <meta property="og:title" content={`${t('myNfts.pageTitle')} | ${metadata.project.name}`} />
        <meta property="og:description" content={getFormattedDescription()} />
      </Head>

      {/* Loading animation */}
      <LoadingScreen
        isPageLoaded={isPageLoaded}
        isLoadingHidden={isLoadingHidden}
        message={t('home.loadingMessage')}
      />

      {/* Main content */}
      <div className="container px-0 sm:px-0 mx-auto my-0 max-w-screen-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h1
                className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide"
              >
                {t('myNfts.title')}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <h6
                className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-2 leading-relaxed px-4 sm:px-0"
              >
                {getMyNftsSubtitle()}
              </h6>
            </motion.div>
          </div>

          {/* Connection error message */}
          {!isConnected && (
            <div
              className="max-w-xl mx-auto mb-4 p-3 border border-blue-300 rounded-lg bg-blue-50 bg-opacity-10"
            >
              <p className="text-center text-gray-800">
                {t('myNfts.walletNotConnected')}
              </p>
            </div>
          )}

          {/* Network error message */}
          {isConnected && !isNetworkCorrect && (
            <div
              className="max-w-xl mx-auto mb-4 p-3 border border-yellow-300 rounded-lg bg-yellow-50 bg-opacity-10"
            >
              <p className="text-center">
                {t('myNfts.wrongNetwork')}
              </p>
            </div>
          )}

          {/* Main content area */}
          {isConnected && isNetworkCorrect && (
            <div>
              {/* Simple tab navigation - mobile friendly */}
              <div className="mb-4">
                {/* Tab statistics */}
                <div className="px-1 py-2 mb-2 flex flex-wrap gap-2 justify-center">
                  {/* Total NFTs - hidden on mobile */}
                  <span
                    className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full border border-primary bg-primary bg-opacity-10 text-sm font-medium"
                  >
                    {t('myNfts.totalNfts')}
                    <span className="ml-1.5 font-bold">{nfts.length}</span>
                  </span>

                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-red-500 bg-red-500 bg-opacity-10 text-sm font-medium"
                  >
                    <Flame size={16} className="mr-1.5 text-white" />
                    {getNftTypePrefix("burn")}
                    <span className="ml-1.5 font-bold">{burnNftCount}</span>
                  </span>

                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-green-500 bg-green-500 bg-opacity-10 text-sm font-medium"
                  >
                    <Rocket size={16} className="mr-1.5 text-white" />
                    {getNftTypePrefix("premium")}
                    <span className="ml-1.5 font-bold">{premiumNftCount}</span>
                  </span>
                </div>

                {/* Improved tab bar - using TabNavigation component */}
                <div className="relative">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={tabValue}
                    onTabChange={handleTabChange}
                  />

                  {/* Desktop reload button */}
                  <div className="hidden sm:block absolute top-2 right-2">
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded-full focus:outline-none disabled:opacity-50"
                      title={t('nftSelection.updateList')}
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <RefreshCw size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="py-5 text-center">
                  <div className="max-w-60 mx-auto mb-3 h-1.5 bg-gray-700 rounded-lg overflow-hidden">
                    <div className="h-full w-full progress-gradient transition-all duration-300 ease-out"></div>
                  </div>
                  <p className="text-gray-400 mt-2">
                    {t('home.loadingNfts')}
                  </p>
                </div>
              )}

              {/* Error state */}
              {!isLoading && loadError && (
                <div
                  className="max-w-md mx-auto mb-3 mt-4 p-3 border border-red-500 rounded-lg bg-red-500 bg-opacity-10"
                >
                  {loadError}
                  <div className="mt-2 flex justify-center">
                    <button
                      className="px-3 py-2 border border-primary text-primary rounded-full hover:bg-primary hover:bg-opacity-10 focus:outline-none inline-flex items-center"
                      onClick={handleRefresh}
                    >
                      <RefreshCw size={16} className="mr-2" />
                      {t('myNfts.retry')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab content */}
              {!isLoading && !loadError && (
                <div className="min-h-[200px]">
                  {renderNftGrid(getCurrentNFTList())}
                </div>
              )}

              {/* Action buttons (if collection exists) */}
              {!isLoading && nfts.length > 0 && (
                <div className="mt-5 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white px-6 py-2.5 rounded-full text-base font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Flame size={18} className="mr-2" />
                    {language === 'ja' ? 'バーン/クレームページへ' : 'Go to Burn/Claim Page'}
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}