import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ 修复路径问题
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ 把 @ 指向 src 目录
    },
  },
});
