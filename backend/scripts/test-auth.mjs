import 'dotenv/config'

const res = await fetch('http://localhost:4000/api/auth/signin', {
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
