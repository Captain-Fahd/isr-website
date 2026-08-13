import 'dotenv/config';
import { assertDisposableDatabase } from './guard';

// The e2e run exercises admin write routes, so this server must never be
// pointed at a real database — `dotenv` above would otherwise fall back to the
// production DATABASE_URL in backend/.env.
assertDisposableDatabase('e2e API server');

process.env.MOCK_EXTERNALS = '1';
process.env.PORT ??= '4000';
process.env.RESEND_API_KEY ??= 're_e2e_test';
process.env.RESEND_FROM_ADDRESS ??= 'noreply@example.com';
process.env.WEATHER_API_KEY ??= 'weather-e2e-test';
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY ??= 'e2e-anon-key';

await import('../index');
