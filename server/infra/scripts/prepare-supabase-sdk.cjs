const { execSync } = require("node:child_process");

function run(command, options = {}) {
  execSync(command, {
    stdio: "inherit",
    shell: true,
    ...options,
  });
}

try {
  run("pulumi package add terraform-provider supabase/supabase");
} catch (error) {
  console.warn(
    "[prepare:supabase-sdk] pulumi package add returned non-zero. Continuing because SDK files may already be generated.",
  );
}

run("npm pkg set dependencies.@pulumi/supabase=file:sdks/supabase");

