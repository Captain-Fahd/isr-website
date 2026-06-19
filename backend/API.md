# ISR Backend API

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