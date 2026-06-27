import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "poe2-fists-of-stone-converter";

export default defineConfig({
  base:
    process.env.GITHUB_PAGES === "true" ? `/${repoName}/` : "/",
  plugins: [react()],
});
