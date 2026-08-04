# ISR Website Frontend

Islamic Society of RMIT website built with Next.js, React, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Project Structure

```
app/
├── globals.css      # Global styles with Tailwind
├── layout.tsx       # Root layout
└── page.tsx         # Home page

components/
├── Navbar.tsx       # Navigation bar
├── Hero.tsx         # Landing hero section
├── Mission.tsx      # Mission & values section
├── EventsPreview.tsx # Events showcase
├── Contact.tsx      # Contact section
└── Footer.tsx       # Footer

public/              # Static assets (to be added)
pages/               # Additional pages (to be created)
```

## Design

- **Color Palette**: ISR branded colors (Cream, Light Blue, Yellow, Turquoise, Dark Red, Bright Red)
- **Framework**: Tailwind CSS with custom ISR color configuration
- **Responsive**: Mobile-first, fully responsive design

## Branding

The site uses the official ISR color palette defined in `tailwind.config.js`:
- `isr-cream`: #EAE3D8
- `isr-light-blue`: #98AEA8
- `isr-yellow`: #EBE8CB
- `isr-turquoise`: #509589
- `isr-dark-red`: #5B0B05
- `isr-bright-red`: #D43325

## Build

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
