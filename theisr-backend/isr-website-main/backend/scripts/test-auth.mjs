import 'dotenv/config'

const baseUrl = process.env.BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const res = await fetch(`${baseUrl}/api/auth/signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@isr.org',
    password: process.env.ADMIN_PASSWORD,
  }),
})

const json = await res.json()
console.log('signin status', res.status)
console.log(json.error ?? 'OK')
