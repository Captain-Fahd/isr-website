import 'dotenv/config';

process.env.MOCK_EXTERNALS = '1';
process.env.PORT ??= '4000';
process.env.RESEND_API_KEY ??= 're_e2e_test';
process.env.RESEND_FROM_ADDRESS ??= 'noreply@example.com';
process.env.WEATHER_API_KEY ??= 'weather-e2e-test';
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY ??= 'e2e-anon-key';

await import('../index');
