'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTabAnimationStyles } from '@/styles/TabAnimations';

type Tab = {
  id: number;
  label: string;
  icon?: React.ReactNode;
  gradientClass?: string; // カスタムグラデーションクラス
};

type TabNavigationProps = {
  tabs: Tab[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
};

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const [previousTab, setPreviousTab] = useState<number>(activeTab);
  const [tabDirection, setTabDirection] = useState<'right' | 'left'>('right');
  const [exitingTab, setExitingTab] = useState<number | null>(null);
  const { addTabAnimationStyles } = useTabAnimationStyles({
    duration: 0.4, // より速いアニメーション
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' // よりスムーズなイージング
  });
  const exitAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // タブアニメーションスタイルの追加
  useEffect(() => {
    const cleanupStyles = addTabAnimationStyles();
    return () => cleanupStyles();
  }, [addTabAnimationStyles]);

  // タブ切り替え時のアニメーション処理
  const handleTabClick = (tabId: number) => {
    if (tabId === activeTab) return;
    
    // 前のタブをアニメーション用に記録
    setPreviousTab(activeTab);
    setExitingTab(activeTab);
    
    // アニメーションの方向を決定
    setTabDirection(tabId > activeTab ? 'right' : 'left');
    
    // 新しいタブに切り替え
    onTabChange(tabId);
    
    // 退場アニメーション終了後に状態をリセット
    if (exitAnimationTimeoutRef.current) {
      clearTimeout(exitAnimationTimeoutRef.current);
    }
    
    exitAnimationTimeoutRef.current = setTimeout(() => {
      setExitingTab(null);
    }, 400); // アニメーション時間と同じ (0.2秒)
  };

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (exitAnimationTimeoutRef.current) {
        clearTimeout(exitAnimationTimeoutRef.current);
      }
    };
  }, []);

  // 退場アニメーションのクラスを取得
  const getExitAnimationClass = (tabId: number) => {
    if (tabId !== exitingTab) return '';
    
    return tabDirection === 'right' 
      ? 'tab-indicator-exit-left' 
      : 'tab-indicator-exit-right';
  };

  // 入場アニメーションのクラスを取得
  const getEnterAnimationClass = (tabId: number) => {
    if (tabId !== activeTab) return '';
    
    return tabDirection === 'right' 
      ? 'tab-indicator-right' 
      : 'tab-indicator-left';
  };

  // タブのグラデーションクラスを取得
  const getGradientClass = (tab: Tab) => {
    if (tab.gradientClass) return tab.gradientClass;
    return "from-purple-400 to-cyan-400"; // デフォルトのグラデーション
  };

  return (
    <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg relative">
      <div className="border-b border-gray-700">
        <div className="flex items-center w-full">
          <div className="flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative py-3 text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center 
                  ${tab.id === activeTab ? 'text-primary font-semibold' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => handleTabClick(tab.id)}
                style={{ flex: tab.id === 0 ? '0 0 18%' : 1 }}
              >
                {tab.icon && <span className="mr-1 flex-shrink-0">{tab.icon}</span>}
                <span className="truncate">{tab.label}</span>
                
                {/* 入場アニメーション用インジケーター */}
                {tab.id === activeTab && (
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${getGradientClass(tab)} ${getEnterAnimationClass(tab.id)}`}
                  ></span>
                )}
                
                {/* 退場アニメーション用インジケーター */}
                {tab.id === exitingTab && (
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${getGradientClass(tab)} ${getExitAnimationClass(tab.id)}`}
                  ></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;