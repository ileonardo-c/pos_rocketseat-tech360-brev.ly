import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#app": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts"],
    environment: "node",
    globals: true,
    coverage: {
      enabled: false,
    },
  },
});
