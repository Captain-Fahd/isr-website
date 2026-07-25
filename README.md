# ISR Website

The official website for the **Islamic Society of RMIT (ISR)** — a hub for RMIT Muslim students and the broader RMIT community to find prayer times, stay up to date with events, and connect with ISR.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
- [Colour Palette](#colour-palette)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## Overview

This is a monorepo containing both the **Next.js frontend** and the **Express backend** for the ISR website. The site provides:

- Live prayer times sourced from an external API
- An admin-managed events board
- Information about ISR's mission, vision, and team
- Links to ISR's social platforms and membership registration

**Target audience:** RMIT Muslim students and the general RMIT student community.

**Target launch:** Semester 2, 2026.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | [Next.js](https://nextjs.org/)      |
| Backend   | [Express.js](https://expressjs.com/)|
| Database  | [Supabase](https://supabase.com/)   |
| Auth      | Supabase Auth (admin panel)         |
| Prayer Times | [Aladhan API](https://aladhan.com/prayer-times-api) (or equivalent) |
| Hosting   | TBD                                 |

---

## Project Structure

```
isr-website/
├── frontend/          # Next.js app
│   ├── app/           # App router pages and layouts
│   ├── components/    # Shared UI components
│   └── public/        # Static assets
├── backend/           # Express API server
│   ├── routes/        # API route handlers
│   ├── middleware/     # Auth and other middleware
│   └── index.js       # Entry point
└── README.md
```

---

## Pages & Features

| Page / Feature     | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Home**           | Landing page with hero section, prayer times, and highlights                |
| **Events**         | Upcoming and past ISR events, managed by admins via an authenticated panel  |
| **Mission & Vision** | ISR's core values, mission, and vision statements                         |
| **About Us**       | Information about ISR and its committee                                     |
| **Contact**        | Contact form and links to WhatsApp and Instagram                            |
| **Become a Member**| Redirects to the external ISR membership registration page                  |
| **Admin Panel**    | Protected route for committee members to create, edit, and delete events    |

---

## Colour Palette

Use ISR's exact brand colours throughout the site.

| Name        | Hex       | Preview |
|-------------|-----------|---------|
| Cream       | `#EAE3D8` | ![#EAE3D8](https://placehold.co/16x16/EAE3D8/EAE3D8.png) |
| Light Blue  | `#98AEA8` | ![#98AEA8](https://placehold.co/16x16/98AEA8/98AEA8.png) |
| Yellow-ish  | `#EBE8CB` | ![#EBE8CB](https://placehold.co/16x16/EBE8CB/EBE8CB.png) |
| Turquoise   | `#509589` | ![#509589](https://placehold.co/16x16/509589/509589.png) |
| Dark Red    | `#5B0B05` | ![#5B0B05](https://placehold.co/16x16/5B0B05/5B0B05.png) |
| Bright Red  | `#D43325` | ![#D43325](https://placehold.co/16x16/D43325/D43325.png) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project (see [Environment Variables](#environment-variables))

### Installation

```bash
# Clone the repo
git clone https://github.com/Captain-Fahd/isr-website.git
cd isr-website

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running locally

```bash
# In one terminal — start the backend
cd backend
npm run dev

# In another terminal — start the frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:4000` (or as configured in your `.env`).

---

## Environment Variables

Create a `.env.local` file in `frontend/` and a `.env` file in `backend/`. **Never commit these files.**

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### `backend/.env`

```env
PORT=4000
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
PRAYER_API_URL=https://api.aladhan.com/v1
DATABASE_URL=your_database_url
```

---

## Roadmap

- [ ] Project scaffolding (Next.js + Express + Supabase)
- [ ] Global layout, navigation, and colour system
- [ ] Prayer times page (Aladhan API integration)
- [ ] Events listing page
- [ ] Admin auth and event management panel
- [ ] Mission & Vision and About Us pages
- [ ] Contact page (form + social links)
- [ ] Become a Member redirect
- [ ] Deployment setup
- [ ] Launch — Semester 2, 2026
