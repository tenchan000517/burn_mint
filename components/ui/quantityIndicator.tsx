"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuantityIndicatorProps {
  mintAmount: number;
  setMintAmount: React.Dispatch<React.SetStateAction<number>>;
  maxMintAmount?: number;
}

export default function QuantityIndicator({ 
  mintAmount,
  setMintAmount,
  maxMintAmount = 10
}: QuantityIndicatorProps) {
  const { t, language } = useLanguage();
  
  const handleMintAmountChange = (newValue: number): void => {
    setMintAmount(newValue);
  };

  const incrementAmount = (): void => {
    setMintAmount((prev: number) => Math.min(prev + 1, maxMintAmount));
  };

  const decrementAmount = (): void => {
    setMintAmount((prev: number) => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* 数量コントロール */}
      <h3 className="text-lg font-medium mt-4 mb-2">
        {language === 'ja' ? '数量を選択' : 'Select Amount'}
      </h3>

      {/* 数量調整ボタン */}
      <div className="flex items-center justify-center my-4">
        <button
          onClick={decrementAmount}
          disabled={mintAmount <= 1}
          className={`p-2 border border-gray-600 rounded-md ${mintAmount <= 1 ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:bg-green-400/10'}`}
        >
          <Minus size={18} />
        </button>

        <div className="mx-4 w-16 px-2 py-3 text-center font-bold text-lg border border-gray-600 rounded-md bg-[#1E1E1E]">
          {mintAmount}
        </div>

        <button
          onClick={incrementAmount}
          disabled={mintAmount >= maxMintAmount}
          className={`p-2 border border-gray-600 rounded-md ${mintAmount >= maxMintAmount ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:bg-green-400/10'}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* スライダー */}
      <div className="px-2 my-4 w-80">
        <input
          type="range"
          min="1"
          max={maxMintAmount}
          step="1"
          value={mintAmount}
          onChange={(e) => handleMintAmountChange(parseInt(e.target.value))}
          className="w-full accent-green-400"
        />
        <div className="flex justify-between px-1 text-xs text-gray-400">
          {Array.from({ length: maxMintAmount }, (_, i) => i + 1).map(num => (
            <span key={num} className={num === mintAmount ? 'font-bold text-green-400' : ''}>
              {num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}