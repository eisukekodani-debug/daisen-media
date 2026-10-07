// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 公開先は環境変数で切り替える（独自ドメインが決まったら SITE_URL をそのドメインに、BASE_PATH は "/" にする）
const site = process.env.SITE_URL ?? 'https://example.com';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404'), lastmod: new Date() })],
});
