import path from 'path';
import { defineConfig } from 'vite';

// Usunęliśmy 'loadEnv', ponieważ nie wczytujemy już zmiennych środowiskowych do frontendu.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // Usunęliśmy całą sekcję 'define', która poprzednio przekazywała klucz API.
  server: {
    watch: {
      usePolling: true,
    }
  }
});

