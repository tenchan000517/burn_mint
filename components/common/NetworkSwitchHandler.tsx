"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useConfig, useChainId, useSwitchChain } from "wagmi";
import { networkConfig, NETWORKS } from "@/config/network";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from "@/contexts/LanguageContext";

export default function NetworkSwitchHandler() {
  const { isConnected } = useAccount();
  const config = useConfig();
  const chainId = useChainId();
  const { switchChain, isPending, variables } = useSwitchChain();
  const [showAlert, setShowAlert] = useState(false);
  const { t, formatMessage, language } = useLanguage();

  // 期待されるチェーンID（アプリケーション設定から）
  const expectedChainId = networkConfig.chainId;

  // 期待されるネットワーク名を取得
  const getExpectedNetworkName = () => {
    return expectedChainId === 1 ? NETWORKS.ETHEREUM_MAINNET.name : NETWORKS.SEPOLIA_TESTNET.name;
  };

  // ネットワークミスマッチの検出
  useEffect(() => {
    if (isConnected && chainId) {
      if (chainId !== expectedChainId) {
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }
    } else {
      setShowAlert(false);
    }
  }, [isConnected, chainId, expectedChainId]);

  // ネットワーク切り替え処理
  const handleSwitchNetwork = () => {
    if (switchChain) {
      // switchChainの引数形式が変わったため、オブジェクトとして渡す
      switchChain({ chainId: expectedChainId });
    } else {
      // switchChainが利用できない場合のフォールバック（メタマスクへの指示など）
      alert(formatMessage('burn.wrongNetwork', { network: getExpectedNetworkName() }));
    }
  };

  if (!showAlert) return null;

  // i18n対応したアラートテキスト
  const networkMismatchTitle = language === 'ja' ? 
    'ネットワークが一致していません' : 
    'Network Mismatch';
  
  const networkMismatchDescription = language === 'ja' ? 
    `このアプリケーションは ${getExpectedNetworkName()} で動作しますが、あなたのウォレットは ${config.chains.find(c => c.id === chainId)?.name || "不明なネットワーク"} に接続されています。` : 
    `This application requires ${getExpectedNetworkName()}, but your wallet is connected to ${config.chains.find(c => c.id === chainId)?.name || "Unknown Network"}.`;

  return (
    <div className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-md p-4">
      <Alert className="bg-yellow-50 border-yellow-300 shadow-lg">
        <AlertTitle className="text-yellow-800 text-lg font-bold">
          {networkMismatchTitle}
        </AlertTitle>
        <AlertDescription className="text-yellow-700">
          <p className="mb-3">
            {networkMismatchDescription}
          </p>
          <Button
            onClick={handleSwitchNetwork}
            disabled={isPending}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            {isPending && variables && variables.chainId === expectedChainId
              ? t('burn.switchNetwork')
              : formatMessage('burn.wrongNetwork', { network: getExpectedNetworkName() })}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}