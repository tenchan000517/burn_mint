// components/common/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Menu, X, LogOut, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetadata } from "@/contexts/MetadataContext";
import LanguageSwitcher from "./LanguageSwitcher";
import WalletConnectButton from "../wallet/WalletConnectButton";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { t } = useLanguage();
  const { metadata } = useMetadata();
  const logoSrc = metadata.project.logo;

  // Client-side only
  useEffect(() => {
    setMounted(true);

    // Handle responsive layout
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Shorten address for display
  const shortenAddress = (address?: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Server-side rendering fallback
  if (!mounted) {
    return (
      <header className="sticky top-0 z-10 bg-transparent">
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="h-16 flex items-center">
            <div className="text-xl font-semibold flex-grow">
              Villain Burn NFT
            </div>
            <div className="w-32 h-9 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#1E1E1E]/80 backdrop-blur-md">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center no-underline text-inherit">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="mr-2"
                />
              ) : null}
              <h6 className={`text-xl font-semibold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent tracking-wider ${logoSrc && isMobile ? 'hidden' : 'block'}`}>
                {metadata.project.shortName}
              </h6>
            </Link>

            {!isMobile && (
              <div className="flex items-center space-x-12">
                <Link href="/" className="no-underline">
                  <button className="text-white/70 hover:text-white transition-colors">
                    {t('header.home')}
                  </button>
                </Link>
                <Link href="/my-nfts" className="no-underline">
                  <button className="text-white/70 hover:text-white transition-colors">
                    {t('header.myNfts')}
                  </button>
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />

              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className={`
                    inline-flex items-center
                    border-2 border-purple-400
                    rounded-full
                    overflow-hidden
                    ${isMobile ? 'h-8 text-xs' : 'h-9 text-sm'}
                  `}>
                    <div className={`
                    flex items-center justify-center
                    bg-purple-400 text-black
                    rounded-full
                    ml-1.5
                    ${isMobile ? 'w-6 h-6' : 'w-7 h-7'}
                  `}>
                      <Wallet size={isMobile ? 14 : 16} />
                    </div>
                    <span className="px-2">
                      {shortenAddress(address)}
                    </span>
                  </div>

                  {!isMobile && (
                    <button
                      onClick={() => disconnect()}
                      className="inline-flex items-center justify-center h-9 w-36 px-4 py-1.5 text-sm bg-transparent border-2 border-pink-400 text-pink-400 rounded-full hover:bg-pink-400/10 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      <span className="truncate">{t('header.disconnect')}</span>
                    </button>
                  )}
                </div>
              ) : (
                <WalletConnectButton />
              )}

              {isMobile && (
                <button
                  aria-label="open drawer"
                  onClick={toggleDrawer}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <Menu size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 
          w-64 
          bg-gray-900
          rounded-l-3xl 
          shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        <div className="pt-4 pb-4 px-6 flex justify-between items-center border-b border-gray-800">
          <h6 className="text-xl font-medium">{t('header.menu')}</h6>
          <button
            onClick={toggleDrawer}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="block w-full px-4 py-3 text-base text-white hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={toggleDrawer}
              >
                {t('header.home')}
              </Link>
            </li>
            <li>
              <Link
                href="/my-nfts"
                className="block w-full px-4 py-3 text-base text-white hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={toggleDrawer}
              >
                {t('header.myNfts')}
              </Link>
            </li>
          </ul>

          <div className="mt-8 px-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center text-sm bg-gray-800 rounded-lg py-2 px-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2 rounded-full bg-purple-400 text-black">
                    <Wallet size={16} className="text-white" />
                  </div>
                  <span className="ml-2 font-medium">{shortenAddress(address)}</span>
                </div>
                <button
                  onClick={() => { disconnect(); toggleDrawer(); }}
                  className="w-full flex items-center justify-center px-4 py-2 text-base bg-transparent border border-pink-400 text-pink-400 rounded-lg hover:bg-pink-400/10 transition-colors"
                >
                  <LogOut size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{t('header.disconnect')}</span>
                </button>
              </div>
            ) : (
              <WalletConnectButton
                className="w-full text-base"
                size="lg"
                onConnect={() => toggleDrawer()}  // 関数を渡す
                />
            )}
          </div>
        </nav>
      </div>

      {/* Overlay for drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleDrawer}
        ></div>
      )}
    </>
  );
}