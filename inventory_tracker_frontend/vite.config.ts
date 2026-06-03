import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite dev server is bound to 0.0.0.0 so it works in containerized environments. */
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  }
});
