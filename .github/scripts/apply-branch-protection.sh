#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-}"
REPO="${2:-}"
BRANCH="${3:-main}"
POLICY_FILE="${4:-.github/policies/branch-protection-main.json}"

if [[ -z "$OWNER" || -z "$REPO" ]]; then
  echo "Usage: .github/scripts/apply-branch-protection.sh <owner> <repo> [branch] [policy-file]"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found in PATH."
  exit 1
fi

if [[ ! -f "$POLICY_FILE" ]]; then
  echo "Policy file not found: $POLICY_FILE"
  exit 1
fi

echo "Applying branch protection..."
gh api \
  -X PUT \
  "repos/$OWNER/$REPO/branches/$BRANCH/protection" \
  -H "Accept: application/vnd.github+json" \
  --input "$POLICY_FILE" >/dev/null

echo "Validating branch protection..."
RESULT="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '{required_checks: .required_status_checks.contexts, strict: .required_status_checks.strict, approvals: .required_pull_request_reviews.required_approving_review_count, codeowners: .required_pull_request_reviews.require_code_owner_reviews, conversation_resolution: .required_conversation_resolution.enabled}')"
echo "$RESULT"

CHECKS="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '.required_status_checks.contexts | join(\" \")')"
STRICT="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '.required_status_checks.strict')"
APPROVALS="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '.required_pull_request_reviews.required_approving_review_count')"
CODEOWNERS="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '.required_pull_request_reviews.require_code_owner_reviews')"
CONVERSATION="$(gh api "repos/$OWNER/$REPO/branches/$BRANCH/protection" --jq '.required_conversation_resolution.enabled')"

if [[ "$CHECKS" != *"server"* || "$CHECKS" != *"web"* ]]; then
  echo "Validation failed: required checks must include server and web."
  exit 1
fi

if [[ "$STRICT" != "true" ]]; then
  echo "Validation failed: strict must be true."
  exit 1
fi

if [[ "$APPROVALS" != "0" ]]; then
  echo "Validation failed: required_approving_review_count must be 0."
  exit 1
fi

if [[ "$CODEOWNERS" != "true" || "$CONVERSATION" != "true" ]]; then
  echo "Validation failed: codeowners and conversation resolution must be true."
  exit 1
fi

echo "Branch protection applied and validated successfully."
