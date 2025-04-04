// utils/deviceDetection.ts
export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  }
  
  export function isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  }
  
  export function isAndroid(): boolean {
    return /Android/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  }
  
  export function isMetaMaskBrowser(): boolean {
    return typeof navigator !== 'undefined' && 
      navigator.userAgent.includes('MetaMaskMobile');
  }