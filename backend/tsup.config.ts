import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "node20",
  sourcemap: false,
  clean: true,
  bundle: true,
});
