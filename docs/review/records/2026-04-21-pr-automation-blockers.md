# 2026-04-21 PR Automation Blockers Record

## Background
During the post-merge workflow, we attempted to automate "single-shot commit + push + Draft PR creation". Push and merge operations succeeded, but automated Draft PR creation was blocked by authentication and tooling constraints.

## Key Implementation Details
1. GitHub MCP write-action failure:
   - `github/create_pull_request` returned `Authentication Failed: Requires authentication`.
   - Read-only calls (`github/list_pull_requests`) still worked.
   - This indicates connector availability with insufficient write authorization (or missing PR write scope).
2. Browser automation fallback was also blocked:
   - Playwright MCP reported extension bridge timeout.
   - Manual browser page showed `ERR_BLOCKED_BY_CLIENT` for the extension URL (`chrome-extension://...`), meaning client-side blocking prevented automated page interaction.
3. SSH push issue was identified and mitigated:
   - Remote uses `ssh://git@ssh.github.com:443/...`.
   - Local SSH config only matched `github.com`, so initial push failed with `Permission denied (publickey)`.
   - Push succeeded using an explicit one-shot command:
     - `GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_github_d2ff3cult -o IdentitiesOnly=yes -p 443' git push ...`
4. Operational decision for this phase:
   - User opted to skip PR workflow temporarily.
   - Branch was fast-forward merged into `develop` and pushed successfully.

## Verification Evidence
1. `github/create_pull_request` failure message:
   - `Mcp error: -32603: Authentication Failed: Requires authentication`.
2. Playwright fallback failure:
   - `Extension connection timeout` from Playwright MCP.
   - Browser-side error page: `ERR_BLOCKED_BY_CLIENT`.
3. Git push/merge success:
   - Branch push succeeded after explicit `GIT_SSH_COMMAND` override.
   - `develop` fast-forwarded to commit `6889052` and pushed to `origin/develop`.
4. Cleanup completed:
   - Local and remote `codex/visual-regression-gate` branches were deleted after merge.

## Risks and Follow-ups
1. If PR automation is needed later, GitHub MCP must be re-authorized with write permissions (PR/repo write scope).
2. Install and authenticate `gh` CLI as a fallback path for PR creation when MCP auth is unavailable.
3. Resolve browser client blocking (extension allowlist / adblock exceptions) only if browser-driven automation is still desired.
4. For current solo workflow, continue direct-merge path but keep running `pnpm ci:gate` before each merge to reduce regression risk.
