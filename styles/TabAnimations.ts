'use client';

import { useEffect } from 'react';

/**
 * アニメーションオプションの型定義
 */
interface TabAnimationOptions {
  duration?: number;
  easing?: string;
}

/**
 * フックの戻り値の型定義
 */
interface TabAnimationReturn {
  addTabAnimationStyles: () => () => void;
}

/**
 * タブインジケーターのアニメーションスタイルを追加する
 * このフックをタブナビゲーションを使用するコンポーネントでインポートして使用する
 * @param options - アニメーションオプション
 * @returns フックの関数を含むオブジェクト
 */
export const useTabAnimationStyles = (options: TabAnimationOptions = {}): TabAnimationReturn => {
  const {
    duration = 0.4,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
  } = options;

  /**
   * スタイルを追加する関数
   * @returns クリーンアップ関数
   */
  const addTabAnimationStyles = (): (() => void) => {
    // CSSのコンテンツを作成
    const styleContent = `
      /* 新しく選択されたタブのアニメーション */
      @keyframes tabIndicatorRight {
        0% { 
          transform: scaleX(0); 
          transform-origin: left; 
          opacity: 0.7;
        }
        100% { 
          transform: scaleX(1); 
          transform-origin: left; 
          opacity: 1;
        }
      }
      
      @keyframes tabIndicatorLeft {
        0% { 
          transform: scaleX(0); 
          transform-origin: right; 
          opacity: 0.7;
        }
        100% { 
          transform: scaleX(1); 
          transform-origin: right; 
          opacity: 1;
        }
      }
      
      /* 選択解除されるタブのアニメーション */
      @keyframes tabIndicatorExitRight {
        0% { 
          transform: scaleX(1); 
          transform-origin: left; 
          opacity: 1;
        }
        100% { 
          transform: scaleX(0); 
          transform-origin: left; 
          opacity: 0;
        }
      }
      
      @keyframes tabIndicatorExitLeft {
        0% { 
          transform: scaleX(1); 
          transform-origin: right; 
          opacity: 1;
        }
        100% { 
          transform: scaleX(0); 
          transform-origin: right; 
          opacity: 0;
        }
      }
      
      /* アニメーションクラス */
      .tab-indicator-right {
        animation: tabIndicatorRight ${duration}s ${easing} forwards;
        will-change: transform, opacity;
      }
      
      .tab-indicator-left {
        animation: tabIndicatorLeft ${duration}s ${easing} forwards;
        will-change: transform, opacity;
      }
      
      .tab-indicator-exit-right {
        animation: tabIndicatorExitRight ${duration}s ${easing} forwards;
        will-change: transform, opacity;
      }
      
      .tab-indicator-exit-left {
        animation: tabIndicatorExitLeft ${duration}s ${easing} forwards;
        will-change: transform, opacity;
      }
      
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;

    // スタイル要素を作成して追加
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-tab-animation', 'true');
    styleEl.textContent = styleContent;
    
    // 既存のスタイル要素がある場合は削除
    const existingStyle = document.querySelector('style[data-tab-animation="true"]');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(styleEl);

    // クリーンアップ関数
    return () => {
      const styleToRemove = document.querySelector('style[data-tab-animation="true"]');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  };

  return { addTabAnimationStyles };
};

export default useTabAnimationStyles;