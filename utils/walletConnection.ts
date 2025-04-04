// utils/walletConnection.ts
import { isIOS, isMetaMaskBrowser } from './deviceDetection';

export function openMetaMaskDeepLink() {
  if (typeof window === 'undefined') return false;
  
  // Only proceed with deep linking if on iOS and not already in MetaMask browser
  if (isIOS() && !isMetaMaskBrowser()) {
    const deepLink = `dapp://${window.location.host}${window.location.pathname}`;
    console.log('Opening MetaMask app with deep link:', deepLink);
    window.location.href = deepLink;
    return true;
  }
  
  return false;
}