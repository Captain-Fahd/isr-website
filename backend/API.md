# ISR Backend APIs

Base URL (dev): `http://localhost:4000`

---

## Health

### `GET /health`

Liveness check.

**Response** `200 OK`
```
OK
```

---

## Prayer Times

All prayer times endpoints proxy the [Al-Adhan API](https://aladhan.com/prayer-times-api) for **Melbourne, Australia** using calculation method **3 (Muslim World League)**.

Returned timings: `Fajr`, `Sunrise`, `Dhuhr`, `Asr`, `Sunset`, `Maghrib`, `Isha`.

---

### `GET /api/prayer-times`

Today's prayer times.

**Response** `200 OK`
```json
{
  "data": {
    "timings": {
      "Fajr": "06:01",
      "Sunrise": "07:35",
      "Dhuhr": "12:21",
      "Asr": "14:50",
      "Sunset": "17:08",
      "Maghrib": "17:08",
      "Isha": "18:37"
    },
    "date": {
      "readable": "19 Jun 2026",
      "timestamp": "1781816400",
      "hijri": {
        "date": "04-01-1448",
        "day": "4",
        "weekday": { "en": "Al Juma'a" },
        "month": { "number": 1, "en": "Muḥarram" },
        "year": "1448"
      },
      "gregorian": {
        "date": "19-06-2026",
        "weekday": { "en": "Friday" },
        "month": { "number": 6, "en": "June" },
        "year": "2026"
      }
    },
    "meta": {
      "timezone": "Australia/Melbourne",
      "method": { "id": 3, "name": "Muslim World League" }
    }
  }
}
```

**Error** `502 Bad Gateway` — upstream Al-Adhan API unreachable.

---

### `GET /api/prayer-times/:date`

Prayer times for a specific date.

**Path parameter**

| Parameter | Format | Example |
|---|---|---|
| `date` | `DD-MM-YYYY` | `19-06-2026` |

**Response** `200 OK` — same shape as `GET /api/prayer-times`.

**Errors**

| Status | Condition |
|---|---|
| `400` | `date` is not in `DD-MM-YYYY` format |
| `502` | Upstream Al-Adhan API unreachable |

```json
{ "error": "Date must be in DD-MM-YYYY format" }
```

---

### `GET /api/prayer-times/calendar`

Full monthly prayer times calendar.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `year` | integer | current year | 4-digit year, e.g. `2026` |
| `month` | integer | current month | 1–12 |

**Example**
```
GET /api/prayer-times/calendar?year=2026&month=6
```

**Response** `200 OK`
```json
{
  "data": [
    {
      "timings": { "Fajr": "...", "Sunrise": "...", "Dhuhr": "...", "Asr": "...", "Sunset": "...", "Maghrib": "...", "Isha": "..." },
      "date": { ... },
      "meta": { ... }
    }
    // one entry per day (28–31 items)
  ]
}
```

**Error** `502 Bad Gateway` — upstream Al-Adhan API unreachable.

---

## Auth

Admin authentication via Supabase. Protected routes require `Authorization: Bearer <access_token>` and `app_metadata.role === "admin"`.

---

### `POST /api/auth/signin`

Sign in with email and password.

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password` | string | yes |

**Response** `200 OK`
```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "admin@isr.org",
      "app_metadata": { "role": "admin" }
    },
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_in": 3600,
      "token_type": "bearer"
    }
  }
}
```

Returns the Supabase auth payload wrapped in `{ "data": ... }`. Use `data.session.access_token` for protected requests.

**Error** `400 Bad Request`

```json
{ "error": "Invalid login credentials" }
```

---

### `GET /api/auth/me`

Return the authenticated admin user.

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Response** `200 OK`
```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "admin@isr.org",
      "app_metadata": { "role": "admin" }
    }
  }
}
```

**Errors**

| Status | Body |
|---|---|
| `401` | `{ "error": "Unauthorized" }` — missing, malformed, or invalid token |
| `403` | `{ "error": "Forbidden" }` — valid token but user is not an admin |

---

## Weather

Current weather for Melbourne via [WeatherAPI](https://www.weatherapi.com/).

---

### `GET /api/weather`

Returns current weather conditions for Melbourne, Australia.

**Response** `200 OK`
```json
{
  "data": {
    "location": {
      "name": "Melbourne",
      "region": "Victoria",
      "country": "Australia",
      "localtime": "2026-07-24 14:30"
    },
    "current": {
      "temp_c": 12.1,
      "feelslike_c": 9.8,
      "humidity": 72,
      "wind_kph": 20.5,
      "wind_dir": "SW",
      "condition": {
        "text": "Partly cloudy",
        "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
        "code": 1003
      },
      "uv": 2.0,
      "vis_km": 10.0,
      "precip_mm": 0.0
    }
  }
}
```

**Errors**

| Status | Body |
|---|---|
| `500` | `{ "error": "Weather API key not configured" }` — `WEATHER_API_KEY` missing from environment |
| `502` | `{ "error": "Invalid Weather API key" }` — key rejected by WeatherAPI |
| `502` | `{ "error": "Weather API responded with <status>" }` — other upstream error |
| `502` | `{ "error": "Failed to fetch weather data" }` — network failure |

---

## Events

Event data is stored in Postgres (via Prisma) and event poster images are stored in Supabase
Storage. Read endpoints are **public**; create/update/delete are **admin-only** (require
`Authorization: Bearer <access_token>` with `app_metadata.role === "admin"`).

An event has the shape:

```json
{
  "id": 1,
  "name": "Eid Dinner",
  "date": "2026-08-01T18:00:00.000Z",
  "imageUrl": "https://<project>.supabase.co/storage/v1/object/public/event-images/...",
  "description": "Community Eid celebration dinner.",
  "ticketUrl": "https://tickets.example.com/eid"
}
```

Create/update requests use **`multipart/form-data`** (not JSON), because they include the image
file. Text fields (`name`, `date`, `description`, `ticketUrl`) are sent as form fields alongside
an `image` file field.

---

### `GET /api/events`

List all events, ordered by date.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `filter` | string | Optional. `upcoming` → events with `date >= now` (ascending). `past` → events with `date < now` (descending). Omit for all events (ascending). |

**Response** `200 OK`
```json
{ "data": [ { "id": 1, "name": "Eid Dinner", "date": "...", "imageUrl": "...", "description": "...", "ticketUrl": "..." } ] }
```

**Error** `500` — `{ "error": "Failed to fetch events" }`

---

### `GET /api/events/:id`

Fetch a single event by id.

**Response** `200 OK`
```json
{ "data": { "id": 1, "name": "Eid Dinner", "date": "...", "imageUrl": "...", "description": "...", "ticketUrl": "..." } }
```

**Errors**

| Status | Body |
|---|---|
| `400` | `{ "error": "Invalid event id" }` |
| `404` | `{ "error": "Event not found" }` |
| `500` | `{ "error": "Failed to fetch event" }` |

---

### `POST /api/events`

Create an event. **Admin only.** `multipart/form-data`.

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Form fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | |
| `date` | string | yes | Any value parseable by `Date` (e.g. ISO 8601 `2026-08-01T18:00:00Z`) |
| `description` | string | yes | |
| `ticketUrl` | string | yes | |
| `image` | file | yes | Image mimetype only, max 5 MB. Uploaded to Supabase Storage. |

**Response** `201 Created`
```json
{ "data": { "id": 1, "name": "Eid Dinner", "date": "...", "imageUrl": "...", "description": "...", "ticketUrl": "..." } }
```

**Errors**

| Status | Body |
|---|---|
| `400` | `{ "error": "name, date, description and ticketUrl are required" }` / `{ "error": "date must be a valid date" }` / `{ "error": "An image file is required" }` |
| `401` | `{ "error": "Unauthorized" }` |
| `403` | `{ "error": "Forbidden" }` |
| `500` | `{ "error": "Failed to create event" }` |

---

### `PUT /api/events/:id`

Update an event. **Admin only.** `multipart/form-data`. All fields are optional — only the
provided fields are changed. If an `image` file is included, the new image is uploaded and the
old one is removed from storage; otherwise the existing `imageUrl` is kept.

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Form fields** — same as `POST`, but all optional (including `image`).

**Response** `200 OK`
```json
{ "data": { "id": 1, "name": "Eid Dinner (updated)", "date": "...", "imageUrl": "...", "description": "...", "ticketUrl": "..." } }
```

**Errors**

| Status | Body |
|---|---|
| `400` | `{ "error": "Invalid event id" }` / `{ "error": "date must be a valid date" }` |
| `401` | `{ "error": "Unauthorized" }` |
| `403` | `{ "error": "Forbidden" }` |
| `404` | `{ "error": "Event not found" }` |
| `500` | `{ "error": "Failed to update event" }` |

---

### `DELETE /api/events/:id`

Delete an event and its stored image. **Admin only.**

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Response** `200 OK`
```json
{ "data": { "id": 1 } }
```

**Errors**

| Status | Body |
|---|---|
| `400` | `{ "error": "Invalid event id" }` |
| `401` | `{ "error": "Unauthorized" }` |
| `403` | `{ "error": "Forbidden" }` |
| `404` | `{ "error": "Event not found" }` |
| `500` | `{ "error": "Failed to delete event" }` |