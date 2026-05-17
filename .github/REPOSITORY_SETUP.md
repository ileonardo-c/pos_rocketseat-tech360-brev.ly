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
- Solo maintainer mode (recommended while only one human reviewer exists):
  - `required_approving_review_count=0`
  - `require_code_owner_reviews=true`
- Dismiss stale approvals on new commits (recommended)
- Restrict force pushes and deletion on `main`

### Replicable policy (versioned + script)

- Policy file (versioned in repository):
  - `.github/policies/branch-protection-main.json`
- Script (PowerShell):
  - `.github/scripts/apply-branch-protection.ps1`
- Script (Bash):
  - `.github/scripts/apply-branch-protection.sh`

PowerShell:

```powershell
$owner = "ileonardo-c"
$repo = "pos_rocketseat-tech360-brev.ly"

.\.github\scripts\apply-branch-protection.ps1 -Owner $owner -Repo $repo -Branch "main"
```

Bash:

```bash
bash .github/scripts/apply-branch-protection.sh ileonardo-c pos_rocketseat-tech360-brev.ly main
```

### Validation checklist (post-apply)

Confirm with:

```bash
gh api repos/<owner>/<repo>/branches/main/protection --jq "{required_checks: .required_status_checks.contexts, strict: .required_status_checks.strict, approvals: .required_pull_request_reviews.required_approving_review_count, codeowners: .required_pull_request_reviews.require_code_owner_reviews, conversation_resolution: .required_conversation_resolution.enabled}"
```

Expected:

- `required_checks`: `["server","web"]`
- `strict`: `true`
- `approvals`: `0` (solo maintainer mode)
- `codeowners`: `true`
- `conversation_resolution`: `true`

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

- CI runs (`server`, `web`)
- CODEOWNERS requested reviewer
- Codex review appears automatically
