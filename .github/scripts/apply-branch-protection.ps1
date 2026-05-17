param(
  [Parameter(Mandatory = $true)]
  [string]$Owner,

  [Parameter(Mandatory = $true)]
  [string]$Repo,

  [string]$Branch = "main",

  [string]$PolicyFile = ".github/policies/branch-protection-main.json"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) is not installed or not available in PATH."
}

if (-not (Test-Path $PolicyFile)) {
  throw "Policy file not found: $PolicyFile"
}

Write-Host "Applying branch protection..."
gh api `
  -X PUT `
  "repos/$Owner/$Repo/branches/$Branch/protection" `
  -H "Accept: application/vnd.github+json" `
  --input $PolicyFile | Out-Null

Write-Host "Validating branch protection..."
$result = gh api "repos/$Owner/$Repo/branches/$Branch/protection" --jq "{required_checks: .required_status_checks.contexts, strict: .required_status_checks.strict, approvals: .required_pull_request_reviews.required_approving_review_count, codeowners: .required_pull_request_reviews.require_code_owner_reviews, conversation_resolution: .required_conversation_resolution.enabled}"
$parsed = $result | ConvertFrom-Json

if (-not ($parsed.required_checks -contains "server" -and $parsed.required_checks -contains "web")) {
  throw "Validation failed: required checks must include server and web."
}

if (-not $parsed.strict) {
  throw "Validation failed: strict status checks must be true."
}

if ($parsed.approvals -ne 0) {
  throw "Validation failed: required_approving_review_count must be 0 for solo maintainer mode."
}

if (-not $parsed.codeowners) {
  throw "Validation failed: require_code_owner_reviews must be true."
}

if (-not $parsed.conversation_resolution) {
  throw "Validation failed: required_conversation_resolution must be true."
}

Write-Host "Branch protection applied and validated successfully."
Write-Host $result
