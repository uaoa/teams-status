import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: replace 'teams-status' with your repo name
  base: process.env.GITHUB_PAGES ? "/teams-status/" : "/",
});
