import { FREE_STARTER_CREDITS, type SessionPayload } from '@/lib/auth/session';
import { readRuntimeBinding, readRuntimeEnv } from '@/lib/runtime-env';

const DEFAULT_D1_BINDING = 'SITEJSON_CREDITS_DB';
const MEMORY_STORE_MODE = 'memory';
const D1_STORE_MODE = 'd1';

type CreditLedgerReason = 'starter_grant' | 'api_request' | 'api_refund';

type StarterCreditsIdentity = Pick<SessionPayload, 'sub' | 'login' | 'plan'>;

type StarterCreditsAccountRecord = {
  userId: string;
  login: string;
  plan: SessionPayload['plan'];
  totalCredits: number;
  remainingCredits: number;
  usedCredits: number;
  starterGrantedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type StarterCreditsSummary = {
  totalCredits: number;
  remainingCredits: number;
  usedCredits: number;
  exhausted: boolean;
  starterGrantedAt: string;
  updatedAt: string;
};

export type StarterCreditActivity = {
  id: string;
  delta: number;
  reason: CreditLedgerReason;
  endpoint: string;
  method: string;
  requestId: string;
  balanceAfter: number;
  createdAt: string;
};

type StarterCreditsMutation = {
  amount: number;
  endpoint: string;
  method: string;
  requestId: string;
  reason: Extract<CreditLedgerReason, 'api_request' | 'api_refund'>;
};

type StarterCreditsMutationResult = {
  applied: boolean;
  summary: StarterCreditsSummary;
  activity?: StarterCreditActivity;
};

type D1PreparedStatementLike = {
  bind: (...values: unknown[]) => D1PreparedStatementLike;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  run: () => Promise<unknown>;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatementLike;
};

type StarterCreditsStore = {
  ensureAccount(identity: StarterCreditsIdentity): Promise<StarterCreditsAccountRecord>;
  mutate(identity: StarterCreditsIdentity, mutation: StarterCreditsMutation): Promise<StarterCreditsMutationResult>;
  listRecentActivity(identity: StarterCreditsIdentity, limit: number): Promise<StarterCreditActivity[]>;
  reset?(): void;
};

type StarterCreditsRow = {
  user_id: string;
  login: string;
  plan: SessionPayload['plan'];
  granted_credits: number | string;
  remaining_credits: number | string;
  used_credits: number | string;
  starter_granted_at: string;
  created_at: string;
  updated_at: string;
};

type StarterCreditsLedgerRow = {
  id: string;
  delta: number | string;
  reason: CreditLedgerReason;
  endpoint: string;
  method: string;
  request_id: string;
  balance_after: number | string;
  created_at: string;
};

export class StarterCreditsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StarterCreditsConfigurationError';
  }
}

const normalizeCount = (value: number | string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toSummary = (record: StarterCreditsAccountRecord): StarterCreditsSummary => ({
  totalCredits: record.totalCredits,
  remainingCredits: record.remainingCredits,
  usedCredits: record.usedCredits,
  exhausted: record.remainingCredits <= 0,
  starterGrantedAt: record.starterGrantedAt,
  updatedAt: record.updatedAt,
});

const nowIso = (): string => new Date().toISOString();

const toRecord = (row: StarterCreditsRow): StarterCreditsAccountRecord => ({
  userId: row.user_id,
  login: row.login,
  plan: row.plan,
  totalCredits: normalizeCount(row.granted_credits),
  remainingCredits: normalizeCount(row.remaining_credits),
  usedCredits: normalizeCount(row.used_credits),
  starterGrantedAt: row.starter_granted_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toActivity = (row: StarterCreditsLedgerRow): StarterCreditActivity => ({
  id: row.id,
  delta: normalizeCount(row.delta),
  reason: row.reason,
  endpoint: row.endpoint,
  method: row.method,
  requestId: row.request_id,
  balanceAfter: normalizeCount(row.balance_after),
  createdAt: row.created_at,
});

const getMutationMetaChanges = (result: unknown): number => {
  if (!result || typeof result !== 'object') return 0;

  const meta = (result as { meta?: { changes?: unknown } }).meta;
  const parsed = Number(meta?.changes);
  return Number.isFinite(parsed) ? parsed : 0;
};

class MemoryStarterCreditsStore implements StarterCreditsStore {
  private readonly accounts = new Map<string, StarterCreditsAccountRecord>();

  private readonly activity = new Map<string, StarterCreditActivity[]>();

  private addActivity(userId: string, item: StarterCreditActivity) {
    const existing = this.activity.get(userId) ?? [];
    existing.unshift(item);
    this.activity.set(userId, existing);
  }

  async ensureAccount(identity: StarterCreditsIdentity): Promise<StarterCreditsAccountRecord> {
    const existing = this.accounts.get(identity.sub);
    if (existing) {
      const updated: StarterCreditsAccountRecord = {
        ...existing,
        login: identity.login,
        updatedAt: existing.updatedAt,
      };
      this.accounts.set(identity.sub, updated);
      return updated;
    }

    const timestamp = nowIso();
    const created: StarterCreditsAccountRecord = {
      userId: identity.sub,
      login: identity.login,
      plan: identity.plan,
      totalCredits: FREE_STARTER_CREDITS,
      remainingCredits: FREE_STARTER_CREDITS,
      usedCredits: 0,
      starterGrantedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.accounts.set(identity.sub, created);
    this.addActivity(identity.sub, {
      id: crypto.randomUUID(),
      delta: FREE_STARTER_CREDITS,
      reason: 'starter_grant',
      endpoint: 'starter/grant',
      method: 'SYSTEM',
      requestId: `starter-grant:${identity.sub}`,
      balanceAfter: FREE_STARTER_CREDITS,
      createdAt: timestamp,
    });

    return created;
  }

  async mutate(identity: StarterCreditsIdentity, mutation: StarterCreditsMutation): Promise<StarterCreditsMutationResult> {
    const current = await this.ensureAccount(identity);
    const direction = mutation.reason === 'api_refund' ? 1 : -1;

    if (direction < 0 && current.remainingCredits < mutation.amount) {
      return {
        applied: false,
        summary: toSummary(current),
      };
    }

    const timestamp = nowIso();
    const nextRemaining =
      direction < 0
        ? current.remainingCredits - mutation.amount
        : Math.min(current.totalCredits, current.remainingCredits + mutation.amount);
    const nextUsed =
      direction < 0
        ? current.usedCredits + mutation.amount
        : Math.max(0, current.usedCredits - mutation.amount);

    const updated: StarterCreditsAccountRecord = {
      ...current,
      login: identity.login,
      remainingCredits: nextRemaining,
      usedCredits: nextUsed,
      updatedAt: timestamp,
    };

    this.accounts.set(identity.sub, updated);

    const activity: StarterCreditActivity = {
      id: crypto.randomUUID(),
      delta: direction * mutation.amount,
      reason: mutation.reason,
      endpoint: mutation.endpoint,
      method: mutation.method,
      requestId: mutation.requestId,
      balanceAfter: nextRemaining,
      createdAt: timestamp,
    };

    this.addActivity(identity.sub, activity);

    return {
      applied: true,
      summary: toSummary(updated),
      activity,
    };
  }

  async listRecentActivity(identity: StarterCreditsIdentity, limit: number): Promise<StarterCreditActivity[]> {
    await this.ensureAccount(identity);
    return (this.activity.get(identity.sub) ?? []).slice(0, limit);
  }

  reset() {
    this.accounts.clear();
    this.activity.clear();
  }
}

class D1StarterCreditsStore implements StarterCreditsStore {
  constructor(private readonly db: D1DatabaseLike) {}

  private async insertStarterGrant(identity: StarterCreditsIdentity, timestamp: string) {
    await this.db
      .prepare(
        `INSERT INTO sitejson_starter_credit_ledger (
          id,
          user_id,
          login,
          delta,
          balance_after,
          reason,
          endpoint,
          method,
          request_id,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        identity.sub,
        identity.login,
        FREE_STARTER_CREDITS,
        FREE_STARTER_CREDITS,
        'starter_grant',
        'starter/grant',
        'SYSTEM',
        `starter-grant:${identity.sub}`,
        timestamp,
      )
      .run();
  }

  private async selectAccount(userId: string): Promise<StarterCreditsAccountRecord> {
    const row = await this.db
      .prepare(
        `SELECT
          user_id,
          login,
          plan,
          granted_credits,
          remaining_credits,
          used_credits,
          starter_granted_at,
          created_at,
          updated_at
        FROM sitejson_starter_credit_accounts
        WHERE user_id = ?`,
      )
      .bind(userId)
      .first<StarterCreditsRow>();

    if (!row) {
      throw new StarterCreditsConfigurationError('Starter credits account lookup failed after initialization.');
    }

    return toRecord(row);
  }

  async ensureAccount(identity: StarterCreditsIdentity): Promise<StarterCreditsAccountRecord> {
    const timestamp = nowIso();
    const insertResult = await this.db
      .prepare(
        `INSERT OR IGNORE INTO sitejson_starter_credit_accounts (
          user_id,
          login,
          plan,
          granted_credits,
          remaining_credits,
          used_credits,
          starter_granted_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      )
      .bind(
        identity.sub,
        identity.login,
        identity.plan,
        FREE_STARTER_CREDITS,
        FREE_STARTER_CREDITS,
        timestamp,
        timestamp,
        timestamp,
      )
      .run();

    if (getMutationMetaChanges(insertResult) > 0) {
      await this.insertStarterGrant(identity, timestamp);
    } else {
      await this.db
        .prepare(
          `UPDATE sitejson_starter_credit_accounts
          SET login = ?, updated_at = ?
          WHERE user_id = ? AND login <> ?`,
        )
        .bind(identity.login, timestamp, identity.sub, identity.login)
        .run();
    }

    return this.selectAccount(identity.sub);
  }

  async mutate(identity: StarterCreditsIdentity, mutation: StarterCreditsMutation): Promise<StarterCreditsMutationResult> {
    await this.ensureAccount(identity);
    const timestamp = nowIso();

    if (mutation.reason === 'api_request') {
      const chargeResult = await this.db
        .prepare(
          `UPDATE sitejson_starter_credit_accounts
          SET
            login = ?,
            remaining_credits = remaining_credits - ?,
            used_credits = used_credits + ?,
            updated_at = ?
          WHERE user_id = ? AND remaining_credits >= ?`,
        )
        .bind(identity.login, mutation.amount, mutation.amount, timestamp, identity.sub, mutation.amount)
        .run();

      const summary = toSummary(await this.selectAccount(identity.sub));
      if (getMutationMetaChanges(chargeResult) === 0) {
        return {
          applied: false,
          summary,
        };
      }

      const activity: StarterCreditActivity = {
        id: crypto.randomUUID(),
        delta: -mutation.amount,
        reason: mutation.reason,
        endpoint: mutation.endpoint,
        method: mutation.method,
        requestId: mutation.requestId,
        balanceAfter: summary.remainingCredits,
        createdAt: timestamp,
      };

      await this.db
        .prepare(
          `INSERT INTO sitejson_starter_credit_ledger (
            id,
            user_id,
            login,
            delta,
            balance_after,
            reason,
            endpoint,
            method,
            request_id,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          activity.id,
          identity.sub,
          identity.login,
          activity.delta,
          activity.balanceAfter,
          activity.reason,
          activity.endpoint,
          activity.method,
          activity.requestId,
          activity.createdAt,
        )
        .run();

      return {
        applied: true,
        summary,
        activity,
      };
    }

    await this.db
      .prepare(
        `UPDATE sitejson_starter_credit_accounts
        SET
          login = ?,
          remaining_credits = CASE
            WHEN remaining_credits + ? > granted_credits THEN granted_credits
            ELSE remaining_credits + ?
          END,
          used_credits = CASE
            WHEN used_credits - ? < 0 THEN 0
            ELSE used_credits - ?
          END,
          updated_at = ?
        WHERE user_id = ?`,
      )
      .bind(
        identity.login,
        mutation.amount,
        mutation.amount,
        mutation.amount,
        mutation.amount,
        timestamp,
        identity.sub,
      )
      .run();

    const summary = toSummary(await this.selectAccount(identity.sub));
    const activity: StarterCreditActivity = {
      id: crypto.randomUUID(),
      delta: mutation.amount,
      reason: mutation.reason,
      endpoint: mutation.endpoint,
      method: mutation.method,
      requestId: mutation.requestId,
      balanceAfter: summary.remainingCredits,
      createdAt: timestamp,
    };

    await this.db
      .prepare(
        `INSERT INTO sitejson_starter_credit_ledger (
          id,
          user_id,
          login,
          delta,
          balance_after,
          reason,
          endpoint,
          method,
          request_id,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        activity.id,
        identity.sub,
        identity.login,
        activity.delta,
        activity.balanceAfter,
        activity.reason,
        activity.endpoint,
        activity.method,
        activity.requestId,
        activity.createdAt,
      )
      .run();

    return {
      applied: true,
      summary,
      activity,
    };
  }

  async listRecentActivity(identity: StarterCreditsIdentity, limit: number): Promise<StarterCreditActivity[]> {
    await this.ensureAccount(identity);
    const result = await this.db
      .prepare(
        `SELECT
          id,
          delta,
          reason,
          endpoint,
          method,
          request_id,
          balance_after,
          created_at
        FROM sitejson_starter_credit_ledger
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
      )
      .bind(identity.sub, limit)
      .all<StarterCreditsLedgerRow>();

    return (result.results ?? []).map(toActivity);
  }
}

const memoryStore = new MemoryStarterCreditsStore();

const resolveStoreMode = (): string | undefined => {
  const configured = readRuntimeEnv('SITEJSON_STARTER_CREDITS_STORE');
  return configured?.trim().toLowerCase();
};

const resolveD1Database = (): D1DatabaseLike | undefined => {
  const bindingName = readRuntimeEnv('SITEJSON_STARTER_CREDITS_D1_BINDING') ?? DEFAULT_D1_BINDING;
  return readRuntimeBinding<D1DatabaseLike>(bindingName);
};

const getStore = (): StarterCreditsStore => {
  const mode = resolveStoreMode();
  if (mode === MEMORY_STORE_MODE) return memoryStore;

  const d1 = resolveD1Database();
  if (d1) {
    return new D1StarterCreditsStore(d1);
  }

  if (mode === D1_STORE_MODE || process.env.NODE_ENV === 'production') {
    throw new StarterCreditsConfigurationError(
      'Starter credits require a Cloudflare D1 binding. Configure SITEJSON_CREDITS_DB (or SITEJSON_STARTER_CREDITS_D1_BINDING).',
    );
  }

  return memoryStore;
};

export const isStarterCreditsConfigurationError = (error: unknown): error is StarterCreditsConfigurationError =>
  error instanceof StarterCreditsConfigurationError;

export const getStarterCreditsSummary = async (identity: StarterCreditsIdentity): Promise<StarterCreditsSummary> => {
  const record = await getStore().ensureAccount(identity);
  return toSummary(record);
};

export const reserveStarterCredits = async (
  identity: StarterCreditsIdentity,
  options: {
    amount?: number;
    endpoint: string;
    method: string;
    requestId: string;
  },
): Promise<StarterCreditsMutationResult> => {
  return getStore().mutate(identity, {
    amount: options.amount ?? 1,
    endpoint: options.endpoint,
    method: options.method,
    requestId: options.requestId,
    reason: 'api_request',
  });
};

export const refundStarterCredits = async (
  identity: StarterCreditsIdentity,
  options: {
    amount?: number;
    endpoint: string;
    method: string;
    requestId: string;
  },
): Promise<StarterCreditsMutationResult> => {
  return getStore().mutate(identity, {
    amount: options.amount ?? 1,
    endpoint: options.endpoint,
    method: options.method,
    requestId: options.requestId,
    reason: 'api_refund',
  });
};

export const listRecentStarterCreditActivity = async (
  identity: StarterCreditsIdentity,
  limit = 10,
): Promise<StarterCreditActivity[]> => getStore().listRecentActivity(identity, limit);

export const createStarterCreditsHeaders = (
  summary: StarterCreditsSummary,
  options?: {
    chargedCredits?: number;
    refundedCredits?: number;
    requestId?: string;
  },
): Record<string, string> => {
  const headers: Record<string, string> = {
    'x-sitejson-credits-total': String(summary.totalCredits),
    'x-sitejson-credits-used': String(summary.usedCredits),
    'x-sitejson-credits-remaining': String(summary.remainingCredits),
    'x-sitejson-credits-exhausted': String(summary.exhausted),
  };

  if (typeof options?.chargedCredits === 'number') {
    headers['x-sitejson-credit-cost'] = String(options.chargedCredits);
  }

  if (typeof options?.refundedCredits === 'number' && options.refundedCredits > 0) {
    headers['x-sitejson-credit-refunded'] = String(options.refundedCredits);
  }

  if (options?.requestId) {
    headers['x-sitejson-request-id'] = options.requestId;
  }

  return headers;
};

export const resetStarterCreditsTestState = () => {
  memoryStore.reset?.();
};
