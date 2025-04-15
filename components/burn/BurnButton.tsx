'use client';

import { useState, useEffect } from "react";
import { useAccount, useChainId, useConfig, useSwitchChain, useConnect } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { getBurnContractAddress, networkConfig, NETWORKS } from "@/config/network";
import burnAbi from "@/config/ThePool.json";
import { motion } from "framer-motion";
import { Flame, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { isMobile, isIOS, isAndroid, isMetaMaskBrowser } from '@/utils/deviceDetection';

interface BurnButtonProps {
  selectedNFTs: Record<number, number>; // tokenId => count
  setBurnTxHash: (hash: string | null) => void;
}

export default function BurnButton({ selectedNFTs, setBurnTxHash }: BurnButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBurnNFT_A, setIsBurnNFT_A] = useState<boolean | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const [pendingTx, setPendingTx] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const signer = useEthersSigner();
  const chainId = useChainId();
  const config = useConfig();
  const { switchChain, isPending } = useSwitchChain();
  const { t, formatMessage, language } = useLanguage();
  const { getNftTypePrefix } = useMetadata();

  // バーン対象のNFT名を取得
  const burnNftName = getNftTypePrefix("burn");

  // Set initial loading text
  useEffect(() => {
    setLoadingText(t('burn.processingBurn'));
  }, [t]);

  // Expected chain ID
  const expectedChainId = networkConfig.chainId;
  const isNetworkCorrect = chainId === expectedChainId;

  // Check contract type
  useEffect(() => {
    const checkContractType = async () => {
      if (!signer) return;

      try {
        const contractAddress = getBurnContractAddress();
        const contract = new ethers.Contract(contractAddress, burnAbi, signer);

        // Check if this is VillainNFT_A by looking for the burnNFT method
        const fragments = Object.values(contract.interface.fragments)
          .filter((fragment: any) => fragment.type === 'function')
          .map((fragment: any) => fragment.name);

        setIsBurnNFT_A(fragments.includes('burnNFT'));
        console.log("[DEBUG] Is VillainNFT_A:", fragments.includes('burnNFT'));

      } catch (error) {
        console.error("[DEBUG] Error checking contract type:", error);
      }
    };

    checkContractType();
  }, [signer]);

  // Monitor transaction progress
  useEffect(() => {
    if (!pendingTx || !signer) return;

    let isSubscribed = true;

    const monitorTransaction = async () => {
      try {
        setLoadingText(t('burn.transactionConfirming'));

        const provider = signer.provider;
        if (!provider) return;

        const receipt = await provider.waitForTransaction(pendingTx, 1);

        if (!isSubscribed) return;

        if (receipt && receipt.status === 1) {
          console.log("[DEBUG] Burn transaction confirmed:", receipt);
          setBurnTxHash(pendingTx);
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
          setIsLoading(false);
          setLoadingText(t('burn.processingBurn'));
        }
      }
    };

    monitorTransaction();

    return () => {
      isSubscribed = false;
    };
  }, [pendingTx, signer, setBurnTxHash, t]);

  // Get expected network name
  const getExpectedNetworkName = () => {
    return expectedChainId === 1 ? NETWORKS.ETHEREUM_MAINNET.name : NETWORKS.SEPOLIA_TESTNET.name;
  };

  // Handle network switch
  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: expectedChainId });
    } else {
      alert(formatMessage('burn.wrongNetwork', { network: getExpectedNetworkName() }));
    }
  };

  // Handle wallet connect using wagmi's useConnect hook directly
  const handleConnectWallet = () => {
    if (isMobile() && isIOS() && !isMetaMaskBrowser()) {
      // iOS Safari → Use deep link to open MetaMask
      const currentUrl = window.location.href;
      const deepLink = `dapp://${window.location.host}${window.location.pathname}`;

      console.log('Opening MetaMask app with deep link:', deepLink);
      window.location.href = deepLink;
      return;
    }

    // For all other cases, use the standard connector approach
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };


  const handleBurn = async () => {
    const totalSelected = Object.values(selectedNFTs).reduce((a, b) => a + b, 0);
    if (totalSelected !== 5) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const contractAddress = getBurnContractAddress();
      const contract = new ethers.Contract(contractAddress, burnAbi, signer);

      console.log("[DEBUG] Attempting to burn NFTs:", selectedNFTs);

      const burnAmount = Object.values(selectedNFTs).reduce((a, b) => a + b, 0);
      const phaseId = networkConfig.getPhaseId();

      // Use the correct burn method based on contract type
      let tx;

      if (isBurnNFT_A) {
        // This is VillainNFT_A, which uses burnNFT with an array argument
        console.log("[DEBUG] Using VillainNFT_A.burnNFT method");
        tx = await contract.burnTokens(phaseId, burnAmount)
      } else {
        // Try using burnMultiple for custom contracts
        console.log("[DEBUG] Using burnMultiple method");
        tx = await contract.burnTokens(phaseId, burnAmount)
      }

      console.log("[DEBUG] Burn transaction sent:", tx.hash);

      // Save transaction hash
      setPendingTx(tx.hash);

    } catch (error: any) {
      console.error("[DEBUG] Error in burn transaction:", error);

      // Create user-friendly error message
      let userMessage = t('burn.errorMessage');

      if (error.message) {
        if (error.message.includes("execution reverted")) {
          if (error.message.includes("Must burn in multiples of 5")) {
            userMessage = t('errors.burn.multipleOfFive');
          } else if (error.message.includes("Not token owner")) {
            userMessage = t('errors.burn.notOwner');
          }
        } else if (error.message.includes("user rejected transaction")) {
          userMessage = t('errors.transaction.userRejected');
        }
      }

      setErrorMessage(userMessage);
      setIsLoading(false);
    }
  };

  // ダイナミックなバーンボタンテキスト (言語対応)
  const getBurnButtonText = () => {
    if (isLoading) {
      return loadingText;
    }

    return language === 'ja'
      ? `5つの${burnNftName}をバーン`
      : `Burn 5 ${burnNftName}s`;
  };

  // Wallet not connected
  const buttonStyles = `
  inline-flex items-center justify-center 
  bg-gradient-to-r from-purple-400 to-purple-700 
  hover:from-purple-300 hover:to-purple-400 
  text-white rounded-full 
  shadow-lg shadow-purple-400/20 
  hover:shadow-xl hover:shadow-purple-400/30 
  hover:-translate-y-0.5 
  transition-all duration-300
`;

  // Wallet not connected
  if (!isConnected) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <button
          onClick={handleConnectWallet}
          disabled={isConnectPending}
          className={`${buttonStyles} py-4 px-8 text-xl font-medium min-w-60 disabled:opacity-70`}
        >
          {isConnectPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Wallet className="mr-2" size={20} />
          )}
          {t('burn.walletNotConnected')}
        </button>
      </motion.div>
    );
  }

  // Wrong network
  if (!isNetworkCorrect) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <button
          onClick={handleSwitchNetwork}
          disabled={isPending}
          className="flex items-center justify-center py-6 px-16 bg-amber-500 text-white rounded-full shadow-lg text-base font-medium min-w-72 hover:bg-amber-600 transition-all duration-300 disabled:opacity-70"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <RefreshCw className="mr-2" size={20} />
          )}
          {isPending ? (
            t('burn.switchNetwork')
          ) : (
            formatMessage('burn.wrongNetwork', { network: getExpectedNetworkName() })
          )}
        </button>
      </motion.div>
    );
  }

  const selectedCount = Object.values(selectedNFTs).reduce((a, b) => a + b, 0);

  // Not enough NFTs selected - 言語対応版
  if (selectedCount !== 5) {
    const selectNftsText = language === 'ja'
      ? `5つのNFTを選択してください`
      : `Please select 5 NFTs`;
  
    return (
      <div className="group relative">
        <button
          disabled
          className="flex items-center justify-center px-2 py-4 bg-gray-300 text-gray-600 rounded-full shadow-sm text-base font-medium w-80 transition-colors"
        >
          <Flame className="mr-0 md:mr-2 opacity-50" size={20} />
          {selectNftsText} {selectedCount > 0 ? `(${selectedCount}/5)` : ''}
        </button>
        {selectedCount > 0 && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 transition-all duration-200 pointer-events-none z-10 whitespace-nowrap after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-800">
            {t('burn.selectFiveNfts')}
            <span className="block h-2"></span>
          </div>
        )}
      </div>
    );
  }

  // Normal active state
  return (
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={!isLoading ? { scale: 1.05 } : undefined}
        whileTap={!isLoading ? { scale: 0.95 } : undefined}
      >
        <button
          onClick={handleBurn}
          disabled={isLoading}
          className="flex items-center justify-center px-2 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm text-base font-medium w-80 transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Flame className="mr-0 md:mr-2" size={20} />
          )}
          {getBurnButtonText()}
        </button>
      </motion.div>

      {errorMessage && (
        <div className="mt-12 max-w-md p-4 border border-red-500 bg-red-50 bg-opacity-10 text-red-500 rounded-xl">
          {errorMessage}
        </div>
      )}
    </div>
  );
}