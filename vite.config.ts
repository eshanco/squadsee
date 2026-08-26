import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// Must match the GitHub repo name for GitHub Pages project sites
// (https://<user>.github.io/squadsee/). Change this if the repo is named differently.
const base = '/squadsee/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        id: base,
        name: 'SquadSee',
        short_name: 'SquadSee',
        description: 'Youth soccer team roster, schedule, attendance, and lineup manager',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#166534',
        theme_color: '#166534',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
