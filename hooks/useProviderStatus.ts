"use client";

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

interface ProviderStatus {
  isConnected: boolean;
  blockNumber: number | null;
  networkName: string | null;
  lastError: string | null;
  checkCount: number;
}

export function useProviderStatus() {
  const publicClient = usePublicClient();
  
  const [status, setStatus] = useState<ProviderStatus>({
    isConnected: false,
    blockNumber: null,
    networkName: null,
    lastError: null,
    checkCount: 0
  });

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;
    
    const checkProvider = async () => {
      try {
        console.log('[DEBUG] useProviderStatus: Checking provider status');
        
        if (!publicClient) {
          if (mounted) {
            setStatus(prev => ({
              ...prev,
              isConnected: false,
              lastError: 'Provider is null',
              checkCount: prev.checkCount + 1
            }));
          }
          return;
        }
        
        try {
          // ネットワーク情報の取得
          const chainId = publicClient.chain.id;
          const networkName = publicClient.chain.name;
          const blockNumber = await publicClient.getBlockNumber();
          
          if (mounted) {
            setStatus(prev => ({
              isConnected: true,
              blockNumber: Number(blockNumber),
              networkName: networkName || 'Unknown',
              lastError: null,
              checkCount: prev.checkCount + 1
            }));
          }
          console.log(`[DEBUG] useProviderStatus: Connected to ${networkName}, block ${blockNumber}`);
        } catch (error) {
          console.error('[DEBUG] useProviderStatus: Error checking provider:', error);
          if (mounted) {
            setStatus(prev => ({
              ...prev,
              isConnected: false,
              lastError: error instanceof Error ? error.message : String(error),
              checkCount: prev.checkCount + 1
            }));
          }
        }
      } catch (error) {
        console.error('[DEBUG] useProviderStatus: Error getting provider:', error);
        if (mounted) {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            lastError: error instanceof Error ? error.message : String(error),
            checkCount: prev.checkCount + 1
          }));
        }
      }
    };
    
    // 初回チェック
    checkProvider();
    
    // 定期的なチェック (5秒ごと)
    intervalId = setInterval(checkProvider, 5000);
    
    // クリーンアップ
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [publicClient]); // statusを依存配列から削除
  
  return status;
}