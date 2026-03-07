#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const options = {
  plan: 'pro',
  monthlyQuota: 1000,
  remote: false,
  local: false,
  dryRun: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  const next = args[i + 1];

  if (arg === '--database') {
    options.database = next;
    i += 1;
  } else if (arg === '--user-id') {
    options.userId = next;
    i += 1;
  } else if (arg === '--login') {
    options.login = next;
    i += 1;
  } else if (arg === '--plan') {
    options.plan = next;
    i += 1;
  } else if (arg === '--monthly-quota') {
    options.monthlyQuota = Number(next);
    i += 1;
  } else if (arg === '--billing-anchor-at') {
    options.billingAnchorAt = next;
    i += 1;
  } else if (arg === '--remote') {
    options.remote = true;
  } else if (arg === '--local') {
    options.local = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  }
}

const usage = `Usage:
  node scripts/set-manual-plan.mjs --database <d1-name> --user-id <id> --login <login> [--plan free|pro] [--monthly-quota 1000] [--billing-anchor-at <ISO>] [--remote|--local] [--dry-run]

Examples:
  node scripts/set-manual-plan.mjs --database sitejson-starter-credits --user-id u1 --login alice --plan pro --remote
  node scripts/set-manual-plan.mjs --database sitejson-starter-credits --user-id u1 --login alice --plan free --remote
`;

if (options.help) {
  console.log(usage);
  process.exit(0);
}

if (!options.database || !options.userId || !options.login) {
  console.error(usage);
  process.exit(1);
}

if (!['free', 'pro'].includes(options.plan)) {
  console.error(`Invalid --plan value: ${options.plan}`);
  process.exit(1);
}

if (!Number.isFinite(options.monthlyQuota) || options.monthlyQuota <= 0) {
  console.error(`Invalid --monthly-quota value: ${options.monthlyQuota}`);
  process.exit(1);
}

if (options.remote && options.local) {
  console.error('Choose only one of --remote or --local.');
  process.exit(1);
}

const billingAnchorAt = options.plan === 'pro'
  ? options.billingAnchorAt ?? new Date().toISOString()
  : null;

const escapeSql = (value) => String(value).replace(/'/g, "''");
const nullableSql = (value) => (value == null ? 'NULL' : `'${escapeSql(value)}'`);
const timestamp = new Date().toISOString();

const statements = [
  `CREATE TABLE IF NOT EXISTS sitejson_account_plans (
    user_id TEXT PRIMARY KEY,
    login TEXT NOT NULL,
    plan TEXT NOT NULL,
    monthly_quota INTEGER NOT NULL DEFAULT 1000,
    billing_anchor_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `INSERT INTO sitejson_account_plans (
    user_id,
    login,
    plan,
    monthly_quota,
    billing_anchor_at,
    created_at,
    updated_at
  ) VALUES (
    '${escapeSql(options.userId)}',
    '${escapeSql(options.login)}',
    '${escapeSql(options.plan)}',
    ${Math.floor(options.monthlyQuota)},
    ${nullableSql(billingAnchorAt)},
    '${escapeSql(timestamp)}',
    '${escapeSql(timestamp)}'
  )
  ON CONFLICT(user_id) DO UPDATE SET
    login = excluded.login,
    plan = excluded.plan,
    monthly_quota = excluded.monthly_quota,
    billing_anchor_at = excluded.billing_anchor_at,
    updated_at = excluded.updated_at;`,
];

const sql = statements.join('\n');
const command = ['wrangler', 'd1', 'execute', options.database, '--command', sql];
if (options.remote) command.push('--remote');
if (options.local) command.push('--local');

console.log(`Plan update target: ${options.login} (${options.userId}) -> ${options.plan}`);
console.log(`Billing anchor: ${billingAnchorAt ?? 'NULL'}`);
console.log(`Monthly quota: ${Math.floor(options.monthlyQuota)}`);

if (options.dryRun) {
  console.log('\nSQL:\n');
  console.log(sql);
  console.log('\nCommand:\n');
  console.log(['npx', ...command].join(' '));
  process.exit(0);
}

const result = spawnSync('npx', command, {
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
