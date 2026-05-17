import * as pulumi from "@pulumi/pulumi";
import * as supabase from "@pulumi/supabase";

const config = new pulumi.Config();

const organizationId = config.require("organizationId");
const projectName = config.get("projectName") ?? "brevly";
const region = config.get("region") ?? "us-east-1";
const databasePassword = config.requireSecret("databasePassword");

const project = new supabase.Project("brevly-project", {
  organizationId,
  name: projectName,
  region,
  databasePassword,
});

const settings = new supabase.Settings("brevly-settings", {
  projectRef: project.id,
});

const pooler = supabase.getPoolerOutput({
  projectRef: project.id,
});

const apiKeys = supabase.getApikeysOutput({
  projectRef: project.id,
});

export const supabaseProjectRef = project.id;
export const supabaseRegion = region;
export const supabaseDbPoolerUrls = pulumi.secret(pooler.url);
export const supabaseDbPooler = pulumi.secret(
  pooler.url.apply(
    (urls) => urls.transaction ?? urls.session ?? urls.pooler ?? Object.values(urls)[0] ?? "",
  ),
);
export const supabaseAnonKey = pulumi.secret(apiKeys.anonKey);
export const supabaseServiceRoleKey = pulumi.secret(apiKeys.serviceRoleKey);
export const supabaseUrl = pulumi.interpolate`https://${project.id}.supabase.co`;
export const appliedSettingsId = settings.id;
