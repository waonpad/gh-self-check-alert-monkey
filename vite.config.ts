import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        icon: "https://vitejs.dev/logo.svg",
        namespace: "npm/vite-plugin-monkey",
        match: [
          // GitHub
          "https://github.com/*",
          // GitLab
          "https://gitlab.com/*",
          // リポジトリがセルフホストされている場合、ここにリポジトリURLを記載
          // "<リポジトリURL>/*"
        ],
      },
    }),
  ],
});
