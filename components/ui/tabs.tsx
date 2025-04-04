'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

// タブのコンテキスト型定義
type TabsContextType = {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  defaultValue?: string;
} | null;

// タブコンテキストの作成
const TabsContext = React.createContext<TabsContextType>(null);

// Tabsコンポーネントのプロップ型定義
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

// メインのTabsコンポーネント
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  // 内部状態としてのタブ選択値
  const [selectedTab, setSelectedTab] = React.useState<string>(
    value || defaultValue || ""
  );

  // 外部から値が変更された場合に状態を更新（制御されたコンポーネント対応）
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);

  // タブ変更ハンドラ
  const handleTabChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setSelectedTab(newValue);
      }
      onValueChange?.(newValue);
    },
    [onValueChange, value]
  );

  return (
    <TabsContext.Provider
      value={{ selectedTab, setSelectedTab: handleTabChange, defaultValue }}
    >
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// タブリストのプロップ型定義
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

// タブのリストを表示するコンポーネント
export function TabsList({
  className,
  children,
  ...props
}: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// タブトリガーのプロップ型定義
export interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// タブを切り替えるトリガーコンポーネント
export function TabsTrigger({
  className,
  value,
  disabled = false,
  children,
  icon,
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { selectedTab, setSelectedTab } = context;
  const isSelected = selectedTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950",
        isSelected
          ? "bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        className
      )}
      onClick={() => setSelectedTab(value)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

// タブコンテンツのプロップ型定義
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

// タブコンテンツを表示するコンポーネント
export function TabsContent({
  className,
  value,
  forceMount,
  children,
  ...props
}: TabsContentProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { selectedTab } = context;
  const isSelected = selectedTab === value;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`trigger-${value}`}
      tabIndex={0}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:ring-offset-gray-950",
        isSelected ? "animate-in fade-in-0" : "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}