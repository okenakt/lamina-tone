# Deploying to GitHub Pages

This project publishes to `https://okenakt.github.io/lamina-tone/` via GitHub
Actions. The workflow is already committed at
`.github/workflows/deploy.yml`; this document covers the one-time repository
setup and the ongoing deploy flow.

## How it works

```mermaid
flowchart LR
    A[Push to main] --> B[build job]
    B -->|npm ci && npm run build| C[dist/]
    C -->|upload-pages-artifact| D[Pages artifact]
    D -->|deploy job: deploy-pages| E[GitHub Pages]
```

- Trigger: any push to `main`, or a manual run via **Actions → Deploy to
  GitHub Pages → Run workflow**.
- Build: `npm ci` then `npm run build` (runs `tsc -b && vite build`),
  producing static assets in `dist/`.
- Deploy: the `dist/` artifact is uploaded and published through GitHub's
  official Pages actions (`actions/upload-pages-artifact`,
  `actions/deploy-pages`).
- Permissions: the workflow requests `pages: write` and `id-token: write`,
  which are required for the OIDC-based Pages deployment.

## One-time repository setup

1. Push `.github/workflows/deploy.yml` to `main` (or merge the PR that adds
   it).
2. In the GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions** (not
   "Deploy from a branch").
4. Confirm **Settings → Actions → General → Workflow permissions** is not
   set to something that blocks `pages: write` (default "Read repository
   contents" permission is fine here, since the Pages permission comes from
   the workflow's own `permissions:` block, not the repo default).

No secrets need to be added manually — the Pages deployment uses the
repository's built-in `GITHUB_TOKEN` with the permissions declared in the
workflow file.

## Confirm the base path

`vite.config.ts` sets:

```ts
base: "/lamina-tone/",
```

This must match the Pages URL path (`https://<user>.github.io/<repo>/`). If
the repository is ever renamed, update this value to match, or the built
assets will 404 under the new path.

## Deploying

Deployment is automatic:

```bash
git push origin main
```

Then watch progress under the repository's **Actions** tab, job "Deploy to
GitHub Pages". Once the `deploy` job finishes, the site is live at:

```
https://okenakt.github.io/lamina-tone/
```

To deploy without pushing new commits (e.g., to re-run after a Pages
settings change), use **Actions → Deploy to GitHub Pages → Run workflow**
(enabled by the `workflow_dispatch` trigger).

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Workflow fails at `deploy-pages` with a permissions error | Pages source is still set to "Deploy from a branch" instead of "GitHub Actions" |
| Site loads but assets 404 | `base` in `vite.config.ts` doesn't match the current repo name |
| Workflow doesn't trigger on push | Push landed on a branch other than `main`, or `.github/workflows/deploy.yml` isn't present on `main` |
