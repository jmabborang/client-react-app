import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Load app.json
const appConfigPath = path.resolve(__dirname, "src/config/app.json");
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf-8"));

// Determine environment
const env = process.env.NODE_ENV || "development";
const port = appConfig['env'][env]?.port || 5173; // fallback if missing

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    port,
    open: true,   // auto-open browser
    strictPort: true, // fails if port is taken
  },
});
