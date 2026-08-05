/**
 * Integration tests need a real Postgres URL plus dummy values for modules
 * that validate env at import time (Supabase, Resend, Weather).
 */
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/isr_integration';
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY ??= 'integration-anon-key';
process.env.RESEND_API_KEY ??= 're_integration_test';
process.env.RESEND_FROM_ADDRESS ??= 'noreply@example.com';
process.env.WEATHER_API_KEY ??= 'weather-integration-test';
