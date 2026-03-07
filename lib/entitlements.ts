import {
  AUTH_PROVIDER_GITHUB,
  BILLING_MODE_MANUAL,
  FREE_RATE_LIMIT_RPM,
  PRO_MONTHLY_QUOTA,
  PRO_RATE_LIMIT_RPM,
  type SessionPayload,
} from '@/lib/auth/session';
import { getStarterCreditsSummary, type StarterCreditsSummary } from '@/lib/starter-credits';
import { readRuntimeBinding, readRuntimeEnv } from '@/lib/runtime-env';

const DEFAULT_D1_BINDING = 'SITEJSON_CREDITS_DB';
const MEMORY_STORE_MODE = 'memory';
const D1_STORE_MODE = 'd1';

type EntitlementsIdentity = Pick<SessionPayload, 'sub' | 'login'>;
type EffectivePlan = SessionPayload['plan'];

type PlanAccountRecord = {
  userId: string;
  login: string;
  plan: EffectivePlan;
  monthlyQuota: number;
  billingAnchorAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type MonthlyUsageRecord = {
  userId: string;
  cycleStartAt: string;
  cycleEndAt: string;
  quotaTotal: number;
  quotaUsed: number;
  createdAt: string;
  updatedAt: string;
};

type D1PreparedStatementLike = {
  bind: (...values: unknown[]) => D1PreparedStatementLike;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  run: () => Promise<unknown>;
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatementLike;
};

type PlanAccountRow = {
  user_id: string;
  login: string;
  plan: EffectivePlan;
  monthly_quota: number | string;
  billing_anchor_at: string | null;
  created_at: string;
  updated_at: string;
};

type MonthlyUsageRow = {
  user_id: string;
  cycle_start_at: string;
  cycle_end_at: string;
  quota_total: number | string;
  quota_used: number | string;
  created_at: string;
  updated_at: string;
};

export type MonthlyQuotaSummary = {
  total: number;
  remaining: number;
  used: number;
  active: boolean;
  resetAt: string | null;
  cycleStartAt: string | null;
  cycleEndAt: string | null;
  billingAnchorAt: string | null;
};

export type MonthlyQuotaMutationResult = {
  applied: boolean;
  summary: MonthlyQuotaSummary;
};

export type UserEntitlements = {
  plan: EffectivePlan;
  authProvider: typeof AUTH_PROVIDER_GITHUB;
  billingMode: typeof BILLING_MODE_MANUAL;
  paymentCheckoutAvailable: false;
  rateLimitPerMinute: number;
  starterCredits: StarterCreditsSummary;
  monthlyQuota: MonthlyQuotaSummary;
};

type MonthlyQuotaMutation = {
  amount: number;
  reason: 'api_request' | 'api_refund';
};

type EntitlementsStore = {
  ensurePlan(identity: EntitlementsIdentity): Promise<PlanAccountRecord>;
  getMonthlyQuotaSummary(identity: EntitlementsIdentity): Promise<MonthlyQuotaSummary>;
  mutateMonthlyQuota(identity: EntitlementsIdentity, mutation: MonthlyQuotaMutation): Promise<MonthlyQuotaMutationResult>;
  setPlan(
    identity: EntitlementsIdentity,
    options: {
      plan: EffectivePlan;
      monthlyQuota?: number;
      billingAnchorAt?: string | null;
    },
  ): Promise<PlanAccountRecord>;
  reset?(): void;
};

export class AccountEntitlementsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountEntitlementsConfigurationError';
  }
}

const normalizeCount = (value: number | string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const nowIso = (): string => new Date().toISOString();

const normalizeQuota = (value: number | undefined, fallback = PRO_MONTHLY_QUOTA): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const toPlanRecord = (row: PlanAccountRow): PlanAccountRecord => ({
  userId: row.user_id,
  login: row.login,
  plan: row.plan,
  monthlyQuota: normalizeCount(row.monthly_quota),
  billingAnchorAt: row.billing_anchor_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toMonthlyUsageRecord = (row: MonthlyUsageRow): MonthlyUsageRecord => ({
  userId: row.user_id,
  cycleStartAt: row.cycle_start_at,
  cycleEndAt: row.cycle_end_at,
  quotaTotal: normalizeCount(row.quota_total),
  quotaUsed: normalizeCount(row.quota_used),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toMonthlyQuotaSummary = (
  record: MonthlyUsageRecord | null,
  planRecord: PlanAccountRecord,
  cycle?: { startAt: string; endAt: string },
): MonthlyQuotaSummary => {
  if (planRecord.plan !== 'pro' || !record || !cycle) {
    return {
      total: 0,
      remaining: 0,
      used: 0,
      active: false,
      resetAt: null,
      cycleStartAt: null,
      cycleEndAt: null,
      billingAnchorAt: planRecord.billingAnchorAt,
    };
  }

  return {
    total: record.quotaTotal,
    remaining: Math.max(record.quotaTotal - record.quotaUsed, 0),
    used: record.quotaUsed,
    active: true,
    resetAt: cycle.endAt,
    cycleStartAt: cycle.startAt,
    cycleEndAt: cycle.endAt,
    billingAnchorAt: planRecord.billingAnchorAt,
  };
};

const getRateLimitPerMinute = (plan: EffectivePlan): number => (plan === 'pro' ? PRO_RATE_LIMIT_RPM : FREE_RATE_LIMIT_RPM);

const getDaysInMonthUtc = (year: number, monthIndex: number): number =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const addMonthsFromAnchor = (anchor: Date, monthOffset: number): Date => {
  const normalized = new Date(Date.UTC(
    anchor.getUTCFullYear(),
    anchor.getUTCMonth() + monthOffset,
    1,
    anchor.getUTCHours(),
    anchor.getUTCMinutes(),
    anchor.getUTCSeconds(),
    anchor.getUTCMilliseconds(),
  ));
  const day = Math.min(anchor.getUTCDate(), getDaysInMonthUtc(normalized.getUTCFullYear(), normalized.getUTCMonth()));

  return new Date(Date.UTC(
    normalized.getUTCFullYear(),
    normalized.getUTCMonth(),
    day,
    anchor.getUTCHours(),
    anchor.getUTCMinutes(),
    anchor.getUTCSeconds(),
    anchor.getUTCMilliseconds(),
  ));
};

const resolveBillingCycle = (billingAnchorAt: string, now = new Date()): { startAt: string; endAt: string } => {
  const anchor = new Date(billingAnchorAt);
  if (Number.isNaN(anchor.getTime())) {
    throw new Error(`Invalid billing anchor timestamp: ${billingAnchorAt}`);
  }

  let monthOffset =
    (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - anchor.getUTCMonth());

  let cycleStart = addMonthsFromAnchor(anchor, monthOffset);
  while (cycleStart > now) {
    monthOffset -= 1;
    cycleStart = addMonthsFromAnchor(anchor, monthOffset);
  }

  let cycleEnd = addMonthsFromAnchor(anchor, monthOffset + 1);
  while (cycleEnd <= now) {
    monthOffset += 1;
    cycleStart = cycleEnd;
    cycleEnd = addMonthsFromAnchor(anchor, monthOffset + 1);
  }

  return {
    startAt: cycleStart.toISOString(),
    endAt: cycleEnd.toISOString(),
  };
};

class MemoryEntitlementsStore implements EntitlementsStore {
  private readonly planAccounts = new Map<string, PlanAccountRecord>();

  private readonly monthlyUsage = new Map<string, MonthlyUsageRecord>();

  private getUsageKey(userId: string, cycleStartAt: string): string {
    return `${userId}:${cycleStartAt}`;
  }

  private async ensureMonthlyUsageRecord(
    planRecord: PlanAccountRecord,
  ): Promise<{ planRecord: PlanAccountRecord; usageRecord: MonthlyUsageRecord | null; cycle: { startAt: string; endAt: string } | null }> {
    if (planRecord.plan !== 'pro' || !planRecord.billingAnchorAt) {
      return { planRecord, usageRecord: null, cycle: null };
    }

    const cycle = resolveBillingCycle(planRecord.billingAnchorAt);
    const key = this.getUsageKey(planRecord.userId, cycle.startAt);
    const existing = this.monthlyUsage.get(key);
    if (existing) {
      return { planRecord, usageRecord: existing, cycle };
    }

    const timestamp = nowIso();
    const created: MonthlyUsageRecord = {
      userId: planRecord.userId,
      cycleStartAt: cycle.startAt,
      cycleEndAt: cycle.endAt,
      quotaTotal: planRecord.monthlyQuota,
      quotaUsed: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.monthlyUsage.set(key, created);

    return { planRecord, usageRecord: created, cycle };
  }

  async ensurePlan(identity: EntitlementsIdentity): Promise<PlanAccountRecord> {
    const existing = this.planAccounts.get(identity.sub);
    if (existing) {
      const updated: PlanAccountRecord = {
        ...existing,
        login: identity.login,
      };
      this.planAccounts.set(identity.sub, updated);
      return updated;
    }

    const timestamp = nowIso();
    const created: PlanAccountRecord = {
      userId: identity.sub,
      login: identity.login,
      plan: 'free',
      monthlyQuota: PRO_MONTHLY_QUOTA,
      billingAnchorAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.planAccounts.set(identity.sub, created);
    return created;
  }

  async getMonthlyQuotaSummary(identity: EntitlementsIdentity): Promise<MonthlyQuotaSummary> {
    const planRecord = await this.ensurePlan(identity);
    const { usageRecord, cycle } = await this.ensureMonthlyUsageRecord(planRecord);
    return toMonthlyQuotaSummary(usageRecord, planRecord, cycle ?? undefined);
  }

  async mutateMonthlyQuota(
    identity: EntitlementsIdentity,
    mutation: MonthlyQuotaMutation,
  ): Promise<MonthlyQuotaMutationResult> {
    const planRecord = await this.ensurePlan(identity);
    const { usageRecord, cycle } = await this.ensureMonthlyUsageRecord(planRecord);
    const summary = toMonthlyQuotaSummary(usageRecord, planRecord, cycle ?? undefined);

    if (!usageRecord || !cycle) {
      return {
        applied: false,
        summary,
      };
    }

    if (mutation.reason === 'api_request') {
      if (usageRecord.quotaUsed + mutation.amount > usageRecord.quotaTotal) {
        return {
          applied: false,
          summary,
        };
      }
      usageRecord.quotaUsed += mutation.amount;
    } else {
      usageRecord.quotaUsed = Math.max(usageRecord.quotaUsed - mutation.amount, 0);
    }

    usageRecord.updatedAt = nowIso();
    this.monthlyUsage.set(this.getUsageKey(identity.sub, cycle.startAt), usageRecord);

    return {
      applied: true,
      summary: toMonthlyQuotaSummary(usageRecord, planRecord, cycle),
    };
  }

  async setPlan(
    identity: EntitlementsIdentity,
    options: {
      plan: EffectivePlan;
      monthlyQuota?: number;
      billingAnchorAt?: string | null;
    },
  ): Promise<PlanAccountRecord> {
    const current = await this.ensurePlan(identity);
    const timestamp = nowIso();
    const next: PlanAccountRecord = {
      ...current,
      login: identity.login,
      plan: options.plan,
      monthlyQuota: normalizeQuota(options.monthlyQuota, current.monthlyQuota),
      billingAnchorAt: options.plan === 'pro' ? options.billingAnchorAt ?? current.billingAnchorAt ?? timestamp : null,
      updatedAt: timestamp,
    };

    this.planAccounts.set(identity.sub, next);
    return next;
  }

  reset(): void {
    this.planAccounts.clear();
    this.monthlyUsage.clear();
  }
}

let d1TablesReady = false;
let d1TablesReadyPromise: Promise<void> | null = null;

class D1EntitlementsStore implements EntitlementsStore {
  constructor(private readonly db: D1DatabaseLike) {}

  private async ensureTables(): Promise<void> {
    if (d1TablesReady) return;
    if (!d1TablesReadyPromise) {
      d1TablesReadyPromise = (async () => {
        await this.db.prepare(
          `CREATE TABLE IF NOT EXISTS sitejson_account_plans (
            user_id TEXT PRIMARY KEY,
            login TEXT NOT NULL,
            plan TEXT NOT NULL,
            monthly_quota INTEGER NOT NULL DEFAULT 1000,
            billing_anchor_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
        ).run();

        await this.db.prepare(
          `CREATE TABLE IF NOT EXISTS sitejson_monthly_usage (
            user_id TEXT NOT NULL,
            cycle_start_at TEXT NOT NULL,
            cycle_end_at TEXT NOT NULL,
            quota_total INTEGER NOT NULL,
            quota_used INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_id, cycle_start_at)
          )`,
        ).run();

        d1TablesReady = true;
      })();
    }

    await d1TablesReadyPromise;
  }

  private async selectPlan(userId: string): Promise<PlanAccountRecord | null> {
    const row = await this.db.prepare(
      `SELECT
        user_id,
        login,
        plan,
        monthly_quota,
        billing_anchor_at,
        created_at,
        updated_at
      FROM sitejson_account_plans
      WHERE user_id = ?`,
    ).bind(userId).first<PlanAccountRow>();

    return row ? toPlanRecord(row) : null;
  }

  private async ensureMonthlyUsageRecord(planRecord: PlanAccountRecord): Promise<{
    planRecord: PlanAccountRecord;
    usageRecord: MonthlyUsageRecord | null;
    cycle: { startAt: string; endAt: string } | null;
  }> {
    if (planRecord.plan !== 'pro' || !planRecord.billingAnchorAt) {
      return { planRecord, usageRecord: null, cycle: null };
    }

    const cycle = resolveBillingCycle(planRecord.billingAnchorAt);
    const timestamp = nowIso();

    await this.db.prepare(
      `INSERT OR IGNORE INTO sitejson_monthly_usage (
        user_id,
        cycle_start_at,
        cycle_end_at,
        quota_total,
        quota_used,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, ?)`,
    ).bind(
      planRecord.userId,
      cycle.startAt,
      cycle.endAt,
      planRecord.monthlyQuota,
      timestamp,
      timestamp,
    ).run();

    const usageRow = await this.db.prepare(
      `SELECT
        user_id,
        cycle_start_at,
        cycle_end_at,
        quota_total,
        quota_used,
        created_at,
        updated_at
      FROM sitejson_monthly_usage
      WHERE user_id = ? AND cycle_start_at = ?`,
    ).bind(planRecord.userId, cycle.startAt).first<MonthlyUsageRow>();

    return {
      planRecord,
      usageRecord: usageRow ? toMonthlyUsageRecord(usageRow) : null,
      cycle,
    };
  }

  async ensurePlan(identity: EntitlementsIdentity): Promise<PlanAccountRecord> {
    await this.ensureTables();

    const existing = await this.selectPlan(identity.sub);
    if (existing) {
      if (existing.login !== identity.login) {
        await this.db.prepare(
          `UPDATE sitejson_account_plans
          SET login = ?, updated_at = ?
          WHERE user_id = ?`,
        ).bind(identity.login, nowIso(), identity.sub).run();
      }

      return {
        ...existing,
        login: identity.login,
      };
    }

    const timestamp = nowIso();
    await this.db.prepare(
      `INSERT INTO sitejson_account_plans (
        user_id,
        login,
        plan,
        monthly_quota,
        billing_anchor_at,
        created_at,
        updated_at
      ) VALUES (?, ?, 'free', ?, NULL, ?, ?)`,
    ).bind(identity.sub, identity.login, PRO_MONTHLY_QUOTA, timestamp, timestamp).run();

    const created = await this.selectPlan(identity.sub);
    if (!created) {
      throw new Error(`Failed to create entitlement plan record for user ${identity.sub}`);
    }

    return created;
  }

  async getMonthlyQuotaSummary(identity: EntitlementsIdentity): Promise<MonthlyQuotaSummary> {
    await this.ensureTables();
    const planRecord = await this.ensurePlan(identity);
    const { usageRecord, cycle } = await this.ensureMonthlyUsageRecord(planRecord);
    return toMonthlyQuotaSummary(usageRecord, planRecord, cycle ?? undefined);
  }

  async mutateMonthlyQuota(
    identity: EntitlementsIdentity,
    mutation: MonthlyQuotaMutation,
  ): Promise<MonthlyQuotaMutationResult> {
    await this.ensureTables();
    const planRecord = await this.ensurePlan(identity);
    const { usageRecord, cycle } = await this.ensureMonthlyUsageRecord(planRecord);
    const summary = toMonthlyQuotaSummary(usageRecord, planRecord, cycle ?? undefined);

    if (!usageRecord || !cycle) {
      return {
        applied: false,
        summary,
      };
    }

    if (mutation.reason === 'api_request') {
      const result = await this.db.prepare(
        `UPDATE sitejson_monthly_usage
        SET quota_used = quota_used + ?, updated_at = ?
        WHERE user_id = ? AND cycle_start_at = ? AND quota_used + ? <= quota_total`,
      ).bind(mutation.amount, nowIso(), identity.sub, cycle.startAt, mutation.amount).run();

      const changed = Number((result as { meta?: { changes?: unknown } })?.meta?.changes ?? 0);
      const refreshed = await this.ensureMonthlyUsageRecord(planRecord);

      return {
        applied: changed > 0,
        summary: toMonthlyQuotaSummary(refreshed.usageRecord, planRecord, refreshed.cycle ?? undefined),
      };
    }

    await this.db.prepare(
      `UPDATE sitejson_monthly_usage
      SET quota_used = CASE
        WHEN quota_used - ? < 0 THEN 0
        ELSE quota_used - ?
      END,
      updated_at = ?
      WHERE user_id = ? AND cycle_start_at = ?`,
    ).bind(mutation.amount, mutation.amount, nowIso(), identity.sub, cycle.startAt).run();

    const refreshed = await this.ensureMonthlyUsageRecord(planRecord);
    return {
      applied: true,
      summary: toMonthlyQuotaSummary(refreshed.usageRecord, planRecord, refreshed.cycle ?? undefined),
    };
  }

  async setPlan(
    identity: EntitlementsIdentity,
    options: {
      plan: EffectivePlan;
      monthlyQuota?: number;
      billingAnchorAt?: string | null;
    },
  ): Promise<PlanAccountRecord> {
    await this.ensureTables();
    const current = await this.ensurePlan(identity);
    const timestamp = nowIso();
    const nextBillingAnchorAt =
      options.plan === 'pro'
        ? options.billingAnchorAt ?? current.billingAnchorAt ?? timestamp
        : null;

    await this.db.prepare(
      `INSERT INTO sitejson_account_plans (
        user_id,
        login,
        plan,
        monthly_quota,
        billing_anchor_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        login = excluded.login,
        plan = excluded.plan,
        monthly_quota = excluded.monthly_quota,
        billing_anchor_at = excluded.billing_anchor_at,
        updated_at = excluded.updated_at`,
    ).bind(
      identity.sub,
      identity.login,
      options.plan,
      normalizeQuota(options.monthlyQuota, current.monthlyQuota),
      nextBillingAnchorAt,
      current.createdAt,
      timestamp,
    ).run();

    const updated = await this.selectPlan(identity.sub);
    if (!updated) {
      throw new Error(`Failed to update entitlement plan record for user ${identity.sub}`);
    }

    return updated;
  }
}

const memoryStore = new MemoryEntitlementsStore();

const resolveStoreMode = (): string | undefined => readRuntimeEnv('SITEJSON_ENTITLEMENTS_STORE')?.trim().toLowerCase();

const resolveD1Database = (): D1DatabaseLike | undefined => {
  const bindingName =
    readRuntimeEnv('SITEJSON_ENTITLEMENTS_D1_BINDING') ??
    readRuntimeEnv('SITEJSON_STARTER_CREDITS_D1_BINDING') ??
    DEFAULT_D1_BINDING;
  return readRuntimeBinding<D1DatabaseLike>(bindingName);
};

const getStore = (): EntitlementsStore => {
  const mode = resolveStoreMode();
  if (mode === MEMORY_STORE_MODE) return memoryStore;

  const d1 = resolveD1Database();
  if (d1) {
    return new D1EntitlementsStore(d1);
  }

  if (mode === D1_STORE_MODE || process.env.NODE_ENV === 'production') {
    throw new AccountEntitlementsConfigurationError(
      'Account entitlements require a Cloudflare D1 binding. Configure SITEJSON_CREDITS_DB or SITEJSON_ENTITLEMENTS_D1_BINDING.',
    );
  }

  return memoryStore;
};

export const isAccountEntitlementsConfigurationError = (
  error: unknown,
): error is AccountEntitlementsConfigurationError => error instanceof AccountEntitlementsConfigurationError;

export const getEffectivePlan = async (identity: EntitlementsIdentity): Promise<EffectivePlan> => {
  const planRecord = await getStore().ensurePlan(identity);
  return planRecord.plan;
};

export const getUserEntitlements = async (identity: EntitlementsIdentity): Promise<UserEntitlements> => {
  const store = getStore();
  const planRecord = await store.ensurePlan(identity);
  const [starterCredits, monthlyQuota] = await Promise.all([
    getStarterCreditsSummary({ ...identity, plan: 'free' }),
    store.getMonthlyQuotaSummary(identity),
  ]);

  return {
    plan: planRecord.plan,
    authProvider: AUTH_PROVIDER_GITHUB,
    billingMode: BILLING_MODE_MANUAL,
    paymentCheckoutAvailable: false,
    rateLimitPerMinute: getRateLimitPerMinute(planRecord.plan),
    starterCredits,
    monthlyQuota,
  };
};

export const reserveMonthlyQuota = async (
  identity: EntitlementsIdentity,
  options?: { amount?: number },
): Promise<MonthlyQuotaMutationResult> =>
  getStore().mutateMonthlyQuota(identity, {
    amount: options?.amount ?? 1,
    reason: 'api_request',
  });

export const refundMonthlyQuota = async (
  identity: EntitlementsIdentity,
  options?: { amount?: number },
): Promise<MonthlyQuotaMutationResult> =>
  getStore().mutateMonthlyQuota(identity, {
    amount: options?.amount ?? 1,
    reason: 'api_refund',
  });

export const createMonthlyQuotaHeaders = (
  summary: MonthlyQuotaSummary,
  options?: {
    chargedUnits?: number;
    refundedUnits?: number;
  },
): Record<string, string> => {
  const headers: Record<string, string> = {
    'x-sitejson-monthly-quota-total': String(summary.total),
    'x-sitejson-monthly-quota-used': String(summary.used),
    'x-sitejson-monthly-quota-remaining': String(summary.remaining),
    'x-sitejson-monthly-quota-active': String(summary.active),
  };

  if (summary.resetAt) {
    headers['x-sitejson-monthly-quota-reset'] = summary.resetAt;
  }

  if (typeof options?.chargedUnits === 'number') {
    headers['x-sitejson-quota-cost'] = String(options.chargedUnits);
  }

  if (typeof options?.refundedUnits === 'number' && options.refundedUnits > 0) {
    headers['x-sitejson-quota-refunded'] = String(options.refundedUnits);
  }

  return headers;
};

export const setManualPlanForUser = async (
  identity: EntitlementsIdentity,
  options: {
    plan: EffectivePlan;
    monthlyQuota?: number;
    billingAnchorAt?: string | null;
  },
): Promise<UserEntitlements> => {
  const store = getStore();
  await store.setPlan(identity, options);
  return getUserEntitlements(identity);
};

export const resetEntitlementsTestState = (): void => {
  memoryStore.reset?.();
  d1TablesReady = false;
  d1TablesReadyPromise = null;
};
