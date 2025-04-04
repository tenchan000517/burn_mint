export type SupportedLanguage = 'en' | 'ja';

export interface Translations {
  header: {
    home: string;
    myNfts: string;
    connectWallet: string;
    disconnect: string;
    menu: string;
  };
  footer: {
    rights: string;
  };
  home: {
    title: string;
    subtitle: string;
    loadingMessage: string;
    burnSectionTitle: string;
    selectNftsInfo: string;
    burnButton: string;
    loadingNfts: string;
    noNftsFound: string;
    refreshButton: string;
    claimableNfts: string;
    claimButton: string;
    burnSuccess: string;
    burnSuccessDesc: string;
    txHash: string;
    viewDetails: string;
    nextSteps: string;
    checkPremiumNft: string;
    claimSuccess: string;
    claimSuccessDesc: string;
    viewMyNfts: string;
  };
  myNfts: {
    title: string;
    subtitle: string;
    allNfts: string;
    burnNfts: string;
    premiumNfts: string;
    totalNfts: string;
    noNftsFound: string;
    updateList: string;
    backToHome: string;
    viewBurnPage: string;
  };
  nftSelection: {
    foundNfts: string;
    updateList: string;
    selectFive: string;
    selectedNfts: string;
  };
  burn: {
    walletNotConnected: string;
    wrongNetwork: string;
    switchNetwork: string;
    selectFiveNfts: string;
    burnNfts: string;
    processingBurn: string;
    transactionConfirming: string;
    errorMessage: string;
  };
  claim: {
    claimNft: string;
    processingClaim: string;
    transactionConfirming: string;
    claimableNfts: string;
  };
  errors: {
    transaction: {
      failed: string;
      monitoring: string;
      userRejected: string;
      generic: string;
    };
    burn: {
      notOwner: string;
      multipleOfFive: string;
    };
    claim: {
      noNftsToFlaim: string;
      notEnoughBurned: string;
    };
    walletNotConnected: string;
    wrongNetwork: string;
  };
  common: {
    loading: string;
    cancel: string;
    refresh: string;
    confirm: string;
    viewDetails: string;
    connectWallet: string;
  };
  nft: {
    burnPrefix: string;
    premiumPrefix: string;
  };
}