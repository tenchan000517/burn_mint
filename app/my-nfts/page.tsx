'use client';

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import {
  getBurnContractAddress,
  getMintContractAddress
} from "@/config/network";
import burnAbi from "@/contracts/BurnNFT.json";
import mintAbi from "@/contracts/MintNFT.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import Link from "next/link";
import NFTCard from "@/components/nft/NFTCard";
import {
  RefreshCw,
  ImageOff,
  Rocket,
  Flame,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { NFT } from "@/types/nft";
import Head from "next/head";
import LoadingScreen from "@/components/ui/loadingScreen";
import TabNavigation from "@/components/ui/tabNavigation";

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [isLoadingHidden, setIsLoadingHidden] = useState<boolean>(false);
  const [exitingTab, setExitingTab] = useState<number | null>(null);
  const exitAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Filtered NFT lists for each tab
  const allNfts = nfts;
  const burnNfts = nfts.filter(nft => nft.type === "burn");
  const premiumNfts = nfts.filter(nft => nft.type === "premium");

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

  // Fetch NFT data
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!isConnected || !address || !signer || !isNetworkCorrect) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        // Get burn target NFTs
        const burnContractAddress = getBurnContractAddress();
        const burnContract = new ethers.Contract(burnContractAddress, burnAbi, signer);

        // Get minted premium NFTs
        const mintContractAddress = getMintContractAddress();
        const mintContract = new ethers.Contract(mintContractAddress, mintAbi, signer);

        // Fetch both NFT types in parallel
        const [ownedBurnTokenIds, ownedMintTokenIds] = await Promise.all([
          burnContract.tokensOwnedBy(address),
          mintContract.tokensOwnedBy(address)
        ]);

        // Format burn NFT data
        const burnNftData: NFT[] = ownedBurnTokenIds.map((tokenId: ethers.BigNumberish) => {
          const numTokenId = Number(tokenId);
          return {
            tokenId: numTokenId,
            name: getNftName("burn", numTokenId),
            image: getNftImageUrl("burn", numTokenId),
            type: "burn" as const
          };
        });

        // Format premium NFT data
        const mintNftData: NFT[] = ownedMintTokenIds.map((tokenId: ethers.BigNumberish) => {
          const numTokenId = Number(tokenId);
          return {
            tokenId: numTokenId,
            name: getNftName("premium", numTokenId),
            image: getNftImageUrl("premium", numTokenId),
            type: "premium" as const
          };
        });

        // Merge both NFT types and set state
        setNfts([...burnNftData, ...mintNftData]);
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
  }, [address, signer, isConnected, isNetworkCorrect, refreshCounter, language, getNftName, getNftImageUrl, t]);

  // Dynamically generated description
  const getMyNftsSubtitle = () => {
    const burnNftName = getNftTypePrefix("burn");
    const premiumNftName = getNftTypePrefix("premium");

    return language === 'ja'
      ? `あなたが所有している${burnNftName}と${premiumNftName}を確認できます。`
      : `View your owned ${burnNftName} and ${premiumNftName} NFTs in one place.`;
  };

  // NFT counts for each type
  const burnNftCount = nfts.filter(nft => nft.type === "burn").length;
  const premiumNftCount = nfts.filter(nft => nft.type === "premium").length;

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
          <div key={`${nft.type}-${nft.tokenId}`}>
            <NFTCard
              tokenId={nft.tokenId}
              type={nft.type}
              animationDelay={index * 0.05}
            />
          </div>
        ))}
      </div>
    );
  };

  // 表示すべきNFTリストを取得
  const getCurrentNFTList = () => {
    switch (tabValue) {
      case 0: return allNfts;
      case 1: return burnNfts;
      case 2: return premiumNfts;
      default: return allNfts;
    }
  };

  // タブ定義
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

  // タブ変更ハンドラ
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

      {/* Loading animation - 改良版LoadingScreenコンポーネントを使用 */}
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
              {/* シンプルなタブナビゲーション - モバイルフレンドリー */}
              <div className="mb-4">
                {/* タブ統計情報 - モバイルではTotal NFTsを非表示 */}
                <div className="px-1 py-2 mb-2 flex flex-wrap gap-2 justify-center">
                  {/* Total NFTs - モバイルでは非表示 */}
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

                {/* 改良されたタブバー - TabNavigationコンポーネントを使用 */}
                <div className="relative">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={tabValue}
                    onTabChange={handleTabChange}
                  />
                  
                  {/* デスクトップのリロードボタン */}
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

              {/* タブコンテンツを直接表示 - 複雑なSwipeableViewsなし */}
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