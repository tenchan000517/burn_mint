// components/wallet/WalletConnectButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { isMobile, isIOS, isMetaMaskBrowser } from '@/utils/deviceDetection';

interface WalletConnectButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onConnect?: () => void;
}

export default function WalletConnectButton({ 
  className = '',
  size = 'md',
  onConnect
}: WalletConnectButtonProps) {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showDeepLink, setShowDeepLink] = useState(false);

  // クライアントサイドでのみ環境検出を実行
  useEffect(() => {
    setMounted(true);
    // iOSモバイルデバイスでMetaMaskブラウザ以外の場合のみディープリンクを表示
    if (isMobile() && isIOS() && !isMetaMaskBrowser()) {
      setShowDeepLink(true);
    } else {
      setShowDeepLink(false);
    }
  }, []);

  // 接続ロジック
  const handleConnect = () => {
    if (!mounted) return;

    // iOSモバイルデバイスのSafariの場合のみMetaMaskディープリンクを使用
    if (showDeepLink) {
      const deepLink = `dapp://${window.location.host}${window.location.pathname}`;
      console.log('Opening MetaMask app with deep link:', deepLink);
      window.location.href = deepLink;
      return;
    }
    
    // その他の環境では標準の接続方法を使用
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
      if (onConnect) onConnect();
    }
  };

  if (!mounted || isConnected) return null;
  
  // ボタンのサイズに応じたスタイル
  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  // 環境に応じたボタンテキストを返す
  const getButtonText = () => {
    if (isPending) {
      return language === 'ja' ? '接続中...' : 'Connecting...';
    }
    
    // iOS SafariではMetaMaskディープリンクを表示
    if (showDeepLink) {
      return language === 'ja' ? 'MetaMaskで開く' : 'Open in MetaMask';
    }
    
    // その他の環境では標準のウォレット接続テキスト
    return t('header.connectWallet') || 'Connect Wallet';
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className={`
        inline-flex items-center justify-center 
        bg-gradient-to-r from-purple-400 to-purple-700 
        hover:from-purple-300 hover:to-purple-400 
        text-white rounded-full 
        shadow-lg shadow-purple-400/20 
        hover:shadow-xl hover:shadow-purple-400/30 
        hover:-translate-y-0.5 
        transition-all duration-300
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <Wallet size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} className="mr-2" />
      )}
      <span>{getButtonText()}</span>
    </button>
  );
}