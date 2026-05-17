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
- Dismiss stale approvals on new commits (recommended)
- Restrict force pushes and deletion on `main`

## 4. Codex Auto Review

Install/enable Codex app for this repository only.

Expected behavior:

- automatic review comments on every pull request;
- no manual trigger required.

Recommended rollout:

- Phase 1: informational (non-blocking) review
- Phase 2: convert to required check if signal quality is stable

## 5. Validation PR

Create branch `chore/repo-governance-smoke` with a tiny doc change and open PR to validate:

- CI runs (`server`, `web`) + observability (`infra`)
- CODEOWNERS requested reviewer
- Codex review appears automatically
