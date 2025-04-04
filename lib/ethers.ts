// lib/ethers.ts
import { ethers } from "ethers";
import { getProvider as configGetProvider } from "@/config/network";

// デバッグ用の呼び出し回数カウンター
let getProviderCallCount = 0;
let getContractCallCount = 0;

export const getProvider = () => {
  getProviderCallCount++;
  console.log(`[DEBUG] lib/ethers.ts: getProvider called (call #${getProviderCallCount})`);
  console.log(`[ETHERS LIB] getProvider called from API`);

  try {
    const provider = configGetProvider();
    console.log(`[DEBUG] lib/ethers.ts: Provider obtained successfully`);
    console.log(`[ETHERS LIB] Provider obtained: ${provider ? 'Success' : 'Null'}`);

    return provider;
  } catch (error) {
    console.error(`[DEBUG] lib/ethers.ts: Error getting provider:`, error);
    throw error;
  }
};

export const getContract = (address: string, abi: any) => {
  getContractCallCount++;
  console.log(`[DEBUG] lib/ethers.ts: getContract called for address ${address} (call #${getContractCallCount})`);
  
  try {
    const provider = getProvider();
    
    if (!provider) {
      console.error(`[DEBUG] lib/ethers.ts: Provider is null or undefined in getContract`);
      throw new Error("プロバイダーが初期化されていません");
    }
    
    console.log(`[DEBUG] lib/ethers.ts: Creating contract instance`);
    const contract = new ethers.Contract(address, abi, provider);
    return contract;
  } catch (error) {
    console.error(`[DEBUG] lib/ethers.ts: Error creating contract:`, error);
    throw error;
  }
};

export const getSignerContract = (address: string, abi: any, signer: ethers.Signer) => {
  console.log(`[DEBUG] lib/ethers.ts: getSignerContract called for address ${address}`);
  
  try {
    console.log(`[DEBUG] lib/ethers.ts: Creating contract with signer`);
    return new ethers.Contract(address, abi, signer);
  } catch (error) {
    console.error(`[DEBUG] lib/ethers.ts: Error creating contract with signer:`, error);
    throw error;
  }
};

// バーン操作用のヘルパー関数
export const burnNFT = async (
  contractAddress: string, 
  tokenId: number, 
  abi: any, 
  signer: ethers.Signer
) => {
  console.log(`[DEBUG] lib/ethers.ts: burnNFT called for token ${tokenId}`);
  
  try {
    const contract = getSignerContract(contractAddress, abi, signer);
    console.log(`[DEBUG] lib/ethers.ts: Calling burn method`);
    const tx = await contract.burn(tokenId);
    console.log(`[DEBUG] lib/ethers.ts: Burn transaction sent: ${tx.hash}`);
    return await tx.wait();
  } catch (error) {
    console.error("NFTバーン処理中にエラーが発生しました:", error);
    throw error;
  }
};

// ミント操作用のヘルパー関数
export const mintNFT = async (
  contractAddress: string,
  to: string,
  tokenId: number,
  abi: any,
  signer: ethers.Signer
) => {
  console.log(`[DEBUG] lib/ethers.ts: mintNFT called for token ${tokenId} to ${to}`);
  
  try {
    const contract = getSignerContract(contractAddress, abi, signer);
    console.log(`[DEBUG] lib/ethers.ts: Calling mint method`);
    const tx = await contract.mint(to, tokenId);
    console.log(`[DEBUG] lib/ethers.ts: Mint transaction sent: ${tx.hash}`);
    return await tx.wait();
  } catch (error) {
    console.error("NFTミント処理中にエラーが発生しました:", error);
    throw error;
  }
};