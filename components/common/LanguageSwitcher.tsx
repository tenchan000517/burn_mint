"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // レスポンシブ対応のためのブレークポイント検出
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm ブレークポイント
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 動的スタイルは直接スタイルオブジェクトを使用
  const groupStyle = {
    borderRadius: isMobile ? '16px' : '18px',
    height: isMobile ? '32px' : '36px',
  };

  const buttonStyle = {
    height: isMobile ? '32px' : '36px',
    padding: isMobile ? '2px 6px' : '3px 8px',
    fontSize: isMobile ? '0.75rem' : '0.875rem',
  };

  return (
    <div 
      className="inline-flex overflow-hidden" 
      style={groupStyle}
    >
      <button
        className={`min-w-0 text-white/70 transition-all duration-300 ${
          language === 'en' 
            ? 'bg-[#BB86FC] text-black hover:bg-[#985EFF]' 
            : 'hover:bg-white/10'
        }`}
        style={buttonStyle}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        className={`min-w-0 text-white/70 transition-all duration-300 ${
          language === 'ja' 
            ? 'bg-[#BB86FC] text-black hover:bg-[#985EFF]' 
            : 'hover:bg-white/10'
        }`}
        style={buttonStyle}
        onClick={() => setLanguage('ja')}
      >
        JP
      </button>
    </div>
  );
}