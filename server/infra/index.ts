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
export const supabaseDbPooler = pooler.connectionString;
export const supabaseAnonKey = pulumi.secret(apiKeys.anonKey);
export const supabaseServiceRoleKey = pulumi.secret(apiKeys.serviceRoleKey);
export const supabaseUrl = pulumi.interpolate`https://${project.id}.supabase.co`;
export const appliedSettingsId = settings.id;
