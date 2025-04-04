'use client';

import { useEffect } from 'react';
import { Rocket } from 'lucide-react';

type LoadingScreenProps = {
    isPageLoaded: boolean;
    isLoadingHidden: boolean;
    message?: string;
};

const LoadingScreen = ({
    isPageLoaded,
    isLoadingHidden,
    message = 'Loading...'
}: LoadingScreenProps) => {
    // プログレスバーアニメーションのためのスタイル
    useEffect(() => {
        // スタイル要素を作成
        const styleEl = document.createElement('style');
        styleEl.textContent = `
      @keyframes smoothProgress {
        0% { transform: translateX(-95%); }
        100% { transform: translateX(0); }
      }
      .animate-smooth-progress {
        width: 100%;
        animation: smoothProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
        background-size: 200% 200%;
      }
    `;
        document.head.appendChild(styleEl);

        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    if (isLoadingHidden) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center bg-black/90 z-50 transition-opacity duration-700 ${isPageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <div className="text-center">
                <div className="flex justify-center mb-3">
                    <Rocket size={40} className="text-primary animate-pulse" />
                </div>
                <h5 className="text-white text-xl tracking-wide">
                    {message}
                </h5>
                <div className="w-48 mt-3 mx-auto">
                    <div className="h-1.5 w-full bg-gray-700 rounded-lg overflow-hidden">
                        <div className="h-full animate-smooth-progress"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;