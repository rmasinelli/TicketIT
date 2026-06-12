import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Change 'ramtech-ticketit' to match your GitHub repo name exactly
export default defineConfig({
  plugins: [react()],
  base: '/ramtech-ticketit/',
});
