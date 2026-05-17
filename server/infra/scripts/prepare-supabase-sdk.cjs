const { execSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const SUPABASE_PROVIDER_VERSION = "1.9.1";
const SUPABASE_DEPENDENCY = "file:sdks/supabase";

function run(command, options = {}) {
  execSync(command, {
    stdio: "inherit",
    shell: true,
    ...options,
  });
}

try {
  run(`pulumi package add terraform-provider supabase/supabase ${SUPABASE_PROVIDER_VERSION}`);
} catch (error) {
  console.warn(
    "[prepare:supabase-sdk] pulumi package add returned non-zero. Continuing because SDK files may already be generated.",
  );
}

ensureSupabaseDependency();

function ensureSupabaseDependency() {
  const packageJsonPath = resolve(__dirname, "..", "package.json");
  const packageJsonRaw = readFileSync(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageJsonRaw);

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  if (packageJson.dependencies["@pulumi/supabase"] === SUPABASE_DEPENDENCY) {
    return;
  }

  packageJson.dependencies["@pulumi/supabase"] = SUPABASE_DEPENDENCY;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

