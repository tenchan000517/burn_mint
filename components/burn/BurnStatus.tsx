"use client";

import { CheckCircle, ExternalLink, Link } from "lucide-react";
import { getTransactionUrl } from "@/config/network";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";

interface BurnStatusProps {
  txHash: string;
  onCheckPremium?: () => void;
}

export default function BurnStatus({ txHash, onCheckPremium }: BurnStatusProps) {
  const { t, language } = useLanguage();
  const { getNftTypePrefix } = useMetadata();

  // プレミアムNFTの名前を取得
  const premiumNftName = getNftTypePrefix("premium");
  const burnNftName = getNftTypePrefix("burn");

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`;
  };

  // バーン成功メッセージ (言語対応)
  const getBurnSuccessMessage = () => {
    return language === 'ja'
      ? `選択した5つの${burnNftName}が正常にバーンされました`
      : `The 5 selected ${burnNftName}s were successfully burned`;
  };

  // 次のステップメッセージ (言語対応)
  const getCheckPremiumMessage = () => {
    return language === 'ja'
      ? `${premiumNftName}が利用可能か確認する`
      : `Check if ${premiumNftName} is available`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative overflow-hidden border border-[#CF6679]/20 rounded-2xl bg-gradient-to-br from-[#CF6679]/16 to-[#CF6679]/4 shadow-md">
        {/* Decorative background effect */}
        <div className="absolute w-32 h-32 rounded-full bg-[#CF6679]/10 -top-10 -right-10 z-0" />
        <div className="absolute w-20 h-20 rounded-full bg-[#CF6679]/15 -bottom-8 -left-8 z-0" />

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
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#CF6679]/15">
                <CheckCircle size={36} className="text-[#00E676]" />
              </div>
            </motion.div>

            <h3 className="mb-1 text-xl font-semibold text-[#00E676] font-['Exo_2',Roboto,sans-serif] drop-shadow-sm">
              {t('home.burnSuccess')}
            </h3>

            <p className="mb-6 text-center text-white font-['Exo_2',Roboto,sans-serif] drop-shadow-sm">
              {getBurnSuccessMessage()}
            </p>

            <div className="w-full mb-6 border-t border-gray-200/80" />

            <div className="w-full p-4 mb-6 bg-[#1E1E1E] border border-gray-100/80 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block mb-1 text-sm text-white font-['Exo_2',Roboto,sans-serif]">
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
                <button
                  onClick={onCheckPremium}
                  className="flex items-center px-3 py-2 text-sm text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 rounded-2xl font-['Exo_2',Roboto,sans-serif] cursor-pointer hover:bg-[#00E676]/20 transition-colors shadow-sm"
                >
                  <Link size={16} className="mr-1" />
                  {getCheckPremiumMessage()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}