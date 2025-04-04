"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { getBurnContractAddress } from "@/config/network";
import burnAbi from "@/contracts/BurnNFT.json";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import { useLanguage } from "@/contexts/LanguageContext";
import { Beaker, AlertCircle, Plus, Minus, Check } from "lucide-react";

export default function TestMintButton() {
    const [open, setOpen] = useState(false);
    const [mintAmount, setMintAmount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const { address, isConnected } = useAccount();
    const signer = useEthersSigner();
    const isNetworkCorrect = useNetworkCheck();
    const { t, language } = useLanguage();

    // Only show in development/test environment
    const isDev = process.env.NODE_ENV === 'development' ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('test') ||
        window.location.hostname.includes('staging') ||
        window.location.hostname.includes('villain-burn-nft'); // プロジェクト名を含む

    if (!isDev) {
        return null;
    }

    console.log("[DEBUG] TestMintButton - isDev check:", {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
        hostname: window.location.hostname,
        isDev: isDev
    });

    const handleOpen = () => {
        setOpen(true);
        setError(null);
        setTxHash(null);
        setIsSuccess(false);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMintAmountChange = (newValue: number) => {
        setMintAmount(newValue);
    };

    const incrementAmount = () => {
        setMintAmount(prev => Math.min(prev + 1, 10));
    };

    const decrementAmount = () => {
        setMintAmount(prev => Math.max(prev - 1, 1));
    };

    // Get the mint button text directly based on language and amount
    const getMintButtonText = () => {
        if (isLoading) {
            return t('debug.minting') || (language === 'ja' ? "ミント中..." : "Minting...");
        }

        // Handle the text directly in the component instead of using formatMessage
        if (language === 'ja') {
            return `${mintAmount}個のNFTをミント`;
        } else {
            return `Mint ${mintAmount} NFT${mintAmount > 1 ? 's' : ''}`;
        }
    };

    const mintTestNFTs = async () => {
        if (!isConnected || !signer || !address) {
            setError(t('errors.walletNotConnected') || (language === 'ja' ? "ウォレットが接続されていません" : "Wallet not connected"));
            return;
        }

        if (!isNetworkCorrect) {
            setError(t('errors.wrongNetwork') || (language === 'ja' ? "ネットワークが正しくありません" : "Wrong network"));
            return;
        }

        setIsLoading(true);
        setError(null);
        setTxHash(null);
        setIsSuccess(false);

        try {
            const contractAddress = getBurnContractAddress();
            const contract = new ethers.Contract(contractAddress, burnAbi, signer);

            // Call the batchMintTo function from the contract
            const tx = await contract.batchMintTo(address, mintAmount);
            setTxHash(tx.hash);

            // Wait for transaction to be mined
            const receipt = await tx.wait();

            // Set success state only after transaction confirmation
            if (receipt.status === 1) {
                setIsSuccess(true);
            } else {
                setError(language === 'ja' ? "トランザクションは完了しましたが、失敗した可能性があります" : "Transaction completed but may have failed");
            }

        } catch (err: any) {
            console.error("[DEBUG] Mint error:", err);
            setError(err.message || (language === 'ja' ? "NFTのミントエラーが発生しました" : "Error minting NFTs"));
        } finally {
            setIsLoading(false);
        }
    };

    // Determine the close button text
    const getCloseButtonText = () => {
        if (isSuccess) {
            return t('common.close') || (language === 'ja' ? "閉じる" : "Close");
        }
        return t('common.cancel') || (language === 'ja' ? "キャンセル" : "Cancel");
    };

    return (
        <>
            {/* Tooltip + Button */}
            <div className="relative group">
                <button
                    onClick={handleOpen}
                    className="flex items-center px-6 py-2 text-[#FFD600] border-2 border-dashed border-[#FFD600] rounded-full hover:bg-[#FFD600]/10 transition-colors"
                >
                    <Beaker size={16} className="mr-2" />
                    {t('debug.testMint') || (language === 'ja' ? "テストミント" : "Test Mint")}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#1E1E1E] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('debug.mintTestNFTs') || (language === 'ja' ? "テスト用NFTをミント" : "Mint Test NFTs")}
                </div>
            </div>

            {/* Dialog */}
            {open && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={handleClose}
                    ></div>

                    {/* Dialog Content */}
                    <div className="bg-[#1E1E1E]/90 rounded-3xl w-full max-w-lg mx-4 z-10 overflow-hidden text-white">
                        {/* Dialog Header */}
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex items-center">
                                <Beaker size={20} className="mr-2 text-[#BB86FC]" />
                                <h2 className="text-lg font-medium">
                                    {t('debug.testMintTitle') || (language === 'ja' ? "テスト用NFTをミント" : "Mint Test NFTs")}
                                </h2>
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-[#FFD600]/20 text-[#FFD600] rounded-md">
                                    {t('debug.testOnly') || (language === 'ja' ? "テスト環境専用" : "TEST ONLY")}
                                </span>
                            </div>
                        </div>

                        {/* Dialog Body */}
                        <div className="px-4 py-4">
                            {/* Info Alert */}
                            <div className="mb-6 mt-1 p-4 border border-[#2196F3]/30 rounded-2xl bg-[#2196F3]/10 text-[#2196F3] flex items-start">
                                <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
                                <p className="font-medium">
                                    {t('debug.testMintInfo') || (language === 'ja'
                                        ? "この機能はテスト環境でのみ利用可能で、テスト用のNFT-Aトークンを直接ウォレットにミントします。"
                                        : "This feature is only available in test environments and will mint NFT-A tokens directly to your wallet for testing.")}
                                </p>
                            </div>

                            {/* Amount Selection */}
                            <h3 className="text-lg font-medium mt-4 mb-2">
                                {t('debug.selectAmount') || (language === 'ja' ? "ミント数を選択" : "Select Amount to Mint")}
                            </h3>

                            {/* Amount Controls */}
                            <div className="flex items-center justify-center my-4">
                                <button
                                    onClick={decrementAmount}
                                    disabled={mintAmount <= 1 || isLoading}
                                    className={`p-2 border border-gray-600 rounded-md ${mintAmount <= 1 || isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-[#BB86FC] hover:bg-[#BB86FC]/10'}`}
                                >
                                    <Minus size={18} />
                                </button>

                                <div className="mx-4 w-16 px-2 py-3 text-center font-bold text-lg border border-gray-600 rounded-md bg-[#1E1E1E]">
                                    {mintAmount}
                                </div>

                                <button
                                    onClick={incrementAmount}
                                    disabled={mintAmount >= 10 || isLoading}
                                    className={`p-2 border border-gray-600 rounded-md ${mintAmount >= 10 || isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-[#BB86FC] hover:bg-[#BB86FC]/10'}`}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Slider */}
                            <div className="px-2 my-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={mintAmount}
                                    onChange={(e) => handleMintAmountChange(parseInt(e.target.value))}
                                    disabled={isLoading}
                                    className="w-full accent-[#BB86FC]"
                                />
                                <div className="flex justify-between px-1 text-xs text-gray-400">
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                        <span key={num} className={num === mintAmount ? 'font-bold text-[#BB86FC]' : ''}>
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Success Message */}
                            {isSuccess && txHash && (
                                <div className="mt-6 p-4 border border-[#00E676]/30 rounded-2xl bg-[#00E676]/10 text-[#00E676]">
                                    <p className="mb-1">
                                        {t('debug.mintSuccess') || (language === 'ja'
                                            ? "NFTのミントに成功しました！"
                                            : "NFTs minted successfully!")}
                                    </p>
                                    <p className="text-xs break-all opacity-80">
                                        TX: {txHash}
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-6 p-4 border border-[#CF6679]/30 rounded-2xl bg-[#CF6679]/10 text-[#CF6679]">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Dialog Actions */}
                        <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-2">
                            {/* Mint Button */}
                            {!isSuccess && (
                                <button
                                    onClick={mintTestNFTs}
                                    disabled={isLoading || !isConnected || !isNetworkCorrect}
                                    className={`flex items-center justify-center rounded-full px-6 py-2 font-medium w-full sm:w-auto transition-all hover:-translate-y-0.5
                                        ${isLoading || !isConnected || !isNetworkCorrect
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#BB86FC] to-[#8C61FF] text-black hover:from-[#E2B8FF] hover:to-[#BB86FC]'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </>
                                    ) : (
                                        <Beaker size={16} className="mr-2" />
                                    )}
                                    {getMintButtonText()}
                                </button>
                            )}

                            {/* Cancel/Close Button */}
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className={`rounded-full px-6 py-2 font-medium border-2 w-full sm:w-auto transition-colors
                                    ${isLoading
                                        ? 'border-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'border-[#BB86FC] text-[#BB86FC] hover:bg-[#BB86FC]/10'}`}
                            >
                                {getCloseButtonText()}
                            </button>

                            {/* Success Button */}
                            {isSuccess && (
                                <button
                                    disabled
                                    className="flex items-center justify-center rounded-full px-6 py-2 font-medium bg-gradient-to-r from-[#00E676] to-[#00A896] text-black w-full sm:w-auto"
                                >
                                    <Check size={16} className="mr-2" />
                                    {language === 'ja' ? "ミント完了" : "Mint Complete"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}