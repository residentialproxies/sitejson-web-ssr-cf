CREATE TABLE IF NOT EXISTS sitejson_starter_credit_accounts (
  user_id TEXT PRIMARY KEY,
  login TEXT NOT NULL,
  plan TEXT NOT NULL,
  granted_credits INTEGER NOT NULL,
  remaining_credits INTEGER NOT NULL,
  used_credits INTEGER NOT NULL DEFAULT 0,
  starter_granted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sitejson_starter_credit_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  login TEXT NOT NULL,
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES sitejson_starter_credit_accounts(user_id)
);

CREATE INDEX IF NOT EXISTS idx_sitejson_starter_credit_ledger_user_created
  ON sitejson_starter_credit_ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sitejson_starter_credit_ledger_request_id
  ON sitejson_starter_credit_ledger (request_id);
