import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 静的ファイルの設定
  vite: {
    build: {
      assetsInlineLimit: 0, // 静的ファイルをインライン化しない
    },
    server: {
      fs: {
        strict: false, // ファイルシステムの制限を緩和
      },
    },
  },
  // 本番環境でのベースパスを設定
  base: '/',
  // 静的ファイルのパブリックディレクトリ
  publicDir: 'public',
});
