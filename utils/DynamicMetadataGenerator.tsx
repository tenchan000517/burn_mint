'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { useMetadata } from '@/contexts/MetadataContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicMetadataGeneratorProps {
  pageTitleKey?: string;
  descriptionKey?: string;
  overrideTitle?: string;
  overrideDescription?: string;
}

export default function DynamicMetadataGenerator({
  pageTitleKey,
  descriptionKey,
  overrideTitle,
  overrideDescription
}: DynamicMetadataGeneratorProps) {
  const { metadata } = useMetadata();
  const { t } = useLanguage();
  const pathname = usePathname();
  
  // マッピングからページ特有のタイトルとメタデータを取得
  const getPageSpecificMetadata = () => {
    // パス名に基づいてメタデータをマッピング
    const pageMappings: Record<string, { titleKey: string, descriptionKey: string }> = {
      '/': { titleKey: 'home.title', descriptionKey: 'home.subtitle' },
      '/my-nfts': { titleKey: 'myNfts.title', descriptionKey: 'myNfts.subtitle' },
      // 必要に応じて他のページのマッピングを追加
    };
    
    return pageMappings[pathname || '/'] || { 
      titleKey: 'home.title', 
      descriptionKey: 'home.subtitle' 
    };
  };
  
  const pageMetadata = getPageSpecificMetadata();
  
  // タイトルとメタ情報を生成
  const title = overrideTitle || (pageTitleKey ? t(pageTitleKey) : t(pageMetadata.titleKey));
  const description = overrideDescription || (descriptionKey ? t(descriptionKey) : t(pageMetadata.descriptionKey));
  
  const fullTitle = `${title} | ${metadata.project.name}`;
  
  // <title>タグを更新
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);
  
  // メタ情報をヘッダーに追加
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}