import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const srcDir = new URL('./src', import.meta.url).pathname

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them.
    // Platform Note: Supabase deployment errors (403) are expected and can be ignored.
    // This app runs in Pure Frontend mode; backend services are disabled.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': srcDir,
    },
  },
})
