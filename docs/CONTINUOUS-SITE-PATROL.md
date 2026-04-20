# Continuous Site Patrol

This project now includes a repeatable patrol chain for ongoing website health checks.

## What It Checks

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- Live production probes when `SITE_PATROL_BASE_URL` is set:
  - homepage returns `200`
  - homepage title contains `SiteJSON`
  - `robots.txt` returns `200` and exposes a sitemap
  - `sitemap.xml` returns `200` and contains `<urlset`
  - a guaranteed-missing route returns `404`
  - the 404 page contains `noindex`
  - the 404 page contains `Page not found`

## Local Run

```bash
npm run patrol
```

To include live probes:

```bash
SITE_PATROL_BASE_URL=https://sitejson.com npm run patrol
```

## GitHub Actions Schedule

The workflow is defined in `.github/workflows/site-patrol.yml`.

- Runs every 15 minutes
- Can be started manually with `workflow_dispatch`
- Uploads `.site-patrol/automation-latest.log` as an artifact
- Opens or updates a GitHub issue titled `Site Patrol Alert` on failure
- Closes the alert issue automatically after recovery

## Operational Notes

- This is the practical replacement for a literal always-open terminal session.
- GitHub-hosted cron is not real-time and can drift by a few minutes.
- If you need paging to Slack, email, or PagerDuty, wire that on top of the alert issue or add a webhook secret to the workflow later.
