import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 未使用変数の警告に変更（エラーにしない）
      "@typescript-eslint/no-unused-vars": "warn",
      
      // any型の使用を警告に変更（エラーにしない）
      "@typescript-eslint/no-explicit-any": "warn",
      
      // 空のインターフェース型の警告を無効化
      "@typescript-eslint/no-empty-object-type": "off",
      
      // useEffectの依存配列の問題を警告に変更
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;