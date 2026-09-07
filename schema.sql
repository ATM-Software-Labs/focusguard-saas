-- FocusGuard 3-Tier Enterprise D1 Database Schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  hmac_secret TEXT NOT NULL,
  master_switch INTEGER DEFAULT 1, -- 1 = Filtering Active, 0 = Paused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tenant_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'block', -- 'block' or 'allow'
  category TEXT DEFAULT 'custom',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL, -- e.g. "Homework Lockout", "Bedtime Lock"
  start_time TEXT NOT NULL, -- "17:00"
  end_time TEXT NOT NULL, -- "21:00"
  days TEXT NOT NULL, -- "Mon,Tue,Wed,Thu,Fri"
  categories_blocked TEXT NOT NULL, -- "social,gaming,entertainment"
  active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  blocked INTEGER DEFAULT 1, -- 1 = Blocked, 0 = Resolved Safe
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
