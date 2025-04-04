"use client";

import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import DiscordIcon from "@/components/ui/discordIcon";
import XIcon from "@/components/ui/xIcon";
import HomeIcon from "@/components/ui/homeIcon";

interface FooterProps {
  twitterUrl?: string;
  discordUrl?: string;
  homeUrl?: string; // ホームページのURLを指定するためのプロパティ
}

export default function Footer({ 
  twitterUrl, 
  discordUrl,
  homeUrl // デフォルト値を削除
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const { metadata } = useMetadata();
  
  // メタデータからソーシャルリンクを取得（またはpropsから）
  const twitterLink = twitterUrl || metadata.social.twitter;
  const discordLink = discordUrl || metadata.social.discord;
  const homepageLink = homeUrl || metadata.social.website;
  
  return (
    <footer className="py-4 mt-auto border-t border-white/10 relative overflow-hidden">
      {/* Decorative background circles */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(187,134,252,0.1)_0%,transparent_70%)] top-[-100px] right-[10%] z-0"
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(3,218,198,0.1)_0%,transparent_70%)] bottom-[-150px] left-[5%] z-0"
      />
      
      <div className="container mx-auto px-4 max-w-screen-lg relative z-[1]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
          <div className="flex items-center mb-2 sm:mb-0">
            <div
              className="font-semibold text-xl bg-gradient-to-r from-[#BB86FC] to-[#03DAC6] bg-clip-text text-transparent tracking-wider"
            >
              {metadata.project.name}
            </div>
          </div>
          
          <div className="flex gap-1">
            {/* ホームページアイコン - homepageLinkが存在する場合のみ表示 */}
            {homepageLink && (
              <a
                className="inline-flex items-center justify-center p-2 rounded-full bg-[#BB86FC]/10 hover:bg-[#BB86FC]/20 transition-colors"
                href={homepageLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Home"
              >
                <HomeIcon size={18} />
              </a>
            )}
            
            {/* Xアイコン - twitterLinkが存在する場合のみ表示 */}
            {twitterLink && (
              <a
                className="inline-flex items-center justify-center p-2 rounded-full bg-[#BB86FC]/10 hover:bg-[#BB86FC]/20 transition-colors"
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <XIcon size={18} />
              </a>
            )}
            
            {/* Discordアイコン - discordLinkが存在する場合のみ表示 */}
            {discordLink && (
              <a
                className="inline-flex items-center justify-center p-2 rounded-full bg-[#BB86FC]/10 hover:bg-[#BB86FC]/20 transition-colors"
                href={discordLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <DiscordIcon size={18} />
              </a>
            )}
          </div>
        </div>
        
        <div className="border-t border-white/10 mb-2" />
        
        <div className="flex justify-center items-center">
          <p className="text-sm text-white/70">
            © {currentYear} {metadata.project.name}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}