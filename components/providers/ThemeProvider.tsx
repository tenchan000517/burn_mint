// components/providers/ThemeProvider.tsx
"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { StarsBackground } from "@/components/common/StarsBackground";
import theme from '@/types/theme'; // テーマをインポート

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StarsBackground />
      <div className="flex flex-col min-h-screen relative z-10">
        {children}
      </div>
    </ThemeProvider>
  );
}