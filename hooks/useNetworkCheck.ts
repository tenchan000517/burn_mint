// hooks/useNetworkCheck.ts
import { useChainId } from "wagmi";
import { networkConfig } from "@/config/network";

/**
 * ネットワークの互換性を確認するためのフック
 * @returns ネットワークが一致しているかどうか
 */
export function useNetworkCheck() {
  const chainId = useChainId();
  const expectedChainId = networkConfig.chainId;
  
  // 現在のチェーンIDとアプリケーションが期待するチェーンIDを比較
  return chainId === expectedChainId;
}