"use client";

import { CheckCircle, ExternalLink, Gift, Sparkles } from "lucide-react";
import { getTransactionUrl } from "@/config/network";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";

interface ClaimStatusProps {
  txHash: string;
}

export default function ClaimStatus({ txHash }: ClaimStatusProps) {
  const { t, language } = useLanguage();
  const { getNftTypePrefix } = useMetadata();
  
  // プレミアムNFTの名前を取得
  const premiumNftName = getNftTypePrefix("premium");
  
  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`;
  };
  
  // クレーム成功メッセージ (言語対応)
  const getClaimSuccessMessage = () => {
    return language === 'ja'
      ? `${premiumNftName}がクレームされました！`
      : `${premiumNftName} was claimed successfully!`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative overflow-hidden border border-[#00E676]/20 rounded-2xl bg-gradient-to-br from-[#00E676]/8 to-[#00E676]/2 backdrop-blur-lg shadow-lg shadow-[#00E676]/15">
        {/* Decorative background effect */}
        <div className="absolute w-32 h-32 rounded-full bg-[#00E676]/10 -top-10 -right-10 z-0" />
        <div className="absolute w-20 h-20 rounded-full bg-[#00E676]/15 -bottom-8 -left-8 z-0" />
        
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
            >
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#00E676]/15">
                <Gift size={32} className="text-[#00E676]" />
              </div>
            </motion.div>
            
            <div className="flex items-center mb-1 gap-2">
              <Sparkles size={20} className="text-[#00E676]" />
              <h3 className="text-[#00E676] text-xl font-semibold font-['Exo_2',Roboto,sans-serif]">
                {t('home.claimSuccess')}
              </h3>
              <Sparkles size={20} className="text-[#00E676]" />
            </div>
            
            <p className="mb-6 text-center text-white/70 font-['Exo_2',Roboto,sans-serif]">
              {getClaimSuccessMessage()}
            </p>
            
            <div className="w-full mb-6 border-t border-white/10" />
            
            <div className="w-full p-4 mb-6 bg-[#1E1E1E] border border-white/20 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block mb-1 text-xs text-white/70 font-['Exo_2',Roboto,sans-serif]">
                    {t('home.txHash')}
                  </span>
                  <span className="text-sm font-medium font-mono text-white">
                    {truncateHash(txHash)}
                  </span>
                </div>
                
                <a
                  href={getTransactionUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1 text-sm border border-[#BB86FC] text-[#BB86FC] rounded-lg no-underline font-medium transition-all duration-300 hover:bg-[#BB86FC]/10 font-['Exo_2',Roboto,sans-serif]"
                >
                  {t('home.viewDetails')}
                  <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex justify-center mt-2">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a
                    href="/my-nfts"
                    className="inline-block px-4 py-2 border border-[#03DAC6] text-[#03DAC6] rounded-full transition-all duration-300 hover:bg-[#03DAC6]/10 font-['Exo_2',Roboto,sans-serif]"
                  >
                    {t('home.viewMyNfts')}
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}