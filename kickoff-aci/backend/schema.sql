-- Cloudflare D1: ejecutar antes de exponer la API.
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  folio TEXT NOT NULL UNIQUE,
  product TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'web',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  employee_reference TEXT DEFAULT '',
  simulation_json TEXT NOT NULL,
  source TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  state TEXT NOT NULL DEFAULT 'recibida',
  assignee TEXT NOT NULL DEFAULT '',
  mail_status TEXT NOT NULL DEFAULT 'pendiente',
  mail_error TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_email_time ON requests(email,created_at);
CREATE INDEX IF NOT EXISTS idx_requests_state ON requests(state);
