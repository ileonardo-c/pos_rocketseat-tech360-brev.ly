import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

// Cross-platform demo video runner for Brev.ly.
// Sets E2E_DEMO_VIDEO=true and runs playwright test e2e/demo-video.spec.ts
const env = {
  ...process.env,
  E2E_DEMO_VIDEO: "true",
  E2E_BASE_URL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
};

console.log("[e2e-demo-video] Starting Brevly demo video test...");

const result = spawnSync(
  "pnpm",
  ["--filter", "web", "exec", "playwright", "test", "e2e/demo-video.spec.ts"],
  {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  },
);

if (result.error) {
  console.error(`[e2e-demo-video] Unable to start command: ${result.error.message}`);
  process.exit(1);
}

// Post-processing: delete .zip traces and rename video with timestamp
if (result.status === 0) {
  const postprocess = resolve(process.cwd(), "scripts", "e2e-demo-video-postprocess.mjs");
  const pp = spawnSync("node", [postprocess], {
    stdio: "inherit",
    cwd: process.cwd(),
    shell: process.platform === "win32",
  });
  if (pp.error) {
    console.error(`[e2e-demo-video] Post-processing failed: ${pp.error.message}`);
  }
}

process.exit(result.status ?? 0);
