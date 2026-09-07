export interface Env {
  SESSIONS_KV: KVNamespace;
  DB: D1Database;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  JWT_SECRET?: string;
  ASSETS?: Fetcher;
}
