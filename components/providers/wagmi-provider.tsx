// "use client";

// import React from "react";
// import { createConfig, http, WagmiProvider } from "wagmi";
// import { mainnet, sepolia } from "wagmi/chains";
// import { injected } from "wagmi/connectors";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// // クエリクライアントの作成
// const queryClient = new QueryClient();

// // 代替のRPCエンドポイントを設定
// // Alchemy, Infura, QuickNodeなど任意のプロバイダーのURLを使用できます
// const MAINNET_RPC_URL = "https://eth.llamarpc.com";
// const SEPOLIA_RPC_URL = "https://ethereum-sepolia.publicnode.com";

// // wagmi設定の作成
// const config = createConfig({
//   chains: [mainnet, sepolia],
//   connectors: [injected()],
//   transports: {
//     [mainnet.id]: http(MAINNET_RPC_URL),
//     [sepolia.id]: http(SEPOLIA_RPC_URL),
//   },
// });

// export default function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         {children}
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }