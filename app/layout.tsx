// app/layout.tsx
import './globals.css';
import { Exo_2 } from 'next/font/google';
import Web3Context from "@/contexts/Web3Context";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ClientThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MetadataProvider } from '@/contexts/MetadataContext';
import type { Metadata } from 'next';

const exo2 = Exo_2({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// ベースURL
const baseUrl = 'https://burn/0xvillain.com';

// 言語別のメタデータ設定
const metadataConfig = {
  ja: {
    title: "THE POOL",
    description: "5つのNFTをバーンして、NFTをクレームしよう！",
    ogImage: "/images/logo.png",
    keywords: ["NFT", "ヴィラン", "バーンNFT", "Web3", "イーサリアム", "限定NFT"],
  },
  en: {
    title: "THE POOL",
    description: "Burn 5 NFTs to claim a NFT!",
    ogImage: "/images/logo.png",
    keywords: ["NFT", "Villain", "Burn NFT", "Web3", "Ethereum", "Exclusive NFT"],
  }
};

// 言語に基づいたメタデータ生成
export function generateMetadata({ params }: { params?: { locale?: string } }): Metadata {
  // ロケールを取得（デフォルトは日本語）
  const locale = params?.locale === 'en' ? 'en' : 'ja';
  
  // メタデータを取得
  const meta = metadataConfig[locale];
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    icons: {
      icon: '/favicon.ico',
    },
    
    openGraph: {
      type: 'website',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      url: baseUrl,
      title: meta.title,
      description: meta.description,
      siteName: locale === 'ja' ? 'THE POOL' : 'THE POOL',
      images: [
        {
          url: meta.ogImage,
          width: 1200,
          height: 630,
          alt: locale === 'ja' ? 'THE POOL' : 'THE POOL',
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      creator: '@0xMAvillain',
      site: '@0xMAvillain',
      images: [meta.ogImage],
    },
    
    alternates: {
      canonical: baseUrl,
      languages: {
        'ja': `${baseUrl}/ja`,
        'en': `${baseUrl}/en`,
      },
    },
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  // ロケールを取得（デフォルトは日本語）
  const locale = params?.locale === 'en' ? 'en' : 'ja';
  
  return (
    <html lang={locale}>
      <body className={exo2.className}>
        <Web3Context>
          <LanguageProvider>
            <MetadataProvider>
              <ClientThemeProvider>
                <Header />
                <main className="flex-grow container mx-auto py-8 px-4">
                  {children}
                </main>
                <Footer />
              </ClientThemeProvider>
            </MetadataProvider>
          </LanguageProvider>
        </Web3Context>
      </body>
    </html>
  );
}