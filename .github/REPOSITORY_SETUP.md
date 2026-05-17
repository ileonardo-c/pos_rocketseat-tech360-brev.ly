# Repository Setup Runbook

Target repository:

- Primary: `ileonardo-c/pos_rocketseat-tech360-brev.ly`
- Fallback (if name is rejected): `ileonardo-c/pos-rocketseat-tech360-brevly`

Initial visibility:

- Private (switch to public after final validation).

## 1. Create Repository

Create the repository in GitHub using owner `ileonardo-c`.

Required defaults:

- default branch: `main`
- allow squash merge: enabled
- auto delete branch: enabled

## 2. Push Initial Content

From local project root:

```bash
git branch -M main
git remote add origin https://github.com/ileonardo-c/pos_rocketseat-tech360-brev.ly.git
git add .
git commit -m "chore(init): bootstrap monorepo with governance and CI"
git push -u origin main
```

## 3. Branch Protection (main)

Configure in GitHub settings:

- Require a pull request before merging
- Require status checks to pass before merging
- Required checks:
  - `server`
  - `web`
- Observability check (informativo neste ciclo):
  - `infra`
- Solo maintainer mode (recommended while only one human reviewer exists):
  - `required_approving_review_count=0`
  - `require_code_owner_reviews=true`
- Dismiss stale approvals on new commits (recommended)
- Restrict force pushes and deletion on `main`

### CLI reference (gh + JSON payload)

Use JSON input to avoid boolean/integer parsing issues in PowerShell:

```powershell
$owner = "ileonardo-c"
$repo = "pos_rocketseat-tech360-brev.ly"

@'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["server", "web"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 0
  },
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": false,
  "restrictions": null
}
'@ | Set-Content -Encoding ascii .github/branch-protection-main.json

gh api `
  -X PUT `
  repos/$owner/$repo/branches/main/protection `
  -H "Accept: application/vnd.github+json" `
  --input .github/branch-protection-main.json
```

## 4. Codex Auto Review

Install/enable Codex app for this repository only.

Expected behavior:

- automatic review comments on every pull request;
- no manual trigger required.
- review comments are technical guidance (not formal GitHub approval).

Recommended rollout:

- Phase 1: informational (non-blocking) review
- Phase 2: convert to required check if signal quality is stable

## 5. Validation PR

Create branch `chore/repo-governance-smoke` with a tiny doc change and open PR to validate:

- CI runs (`server`, `web`) + observability (`infra`)
- CODEOWNERS requested reviewer
- Codex review appears automatically
