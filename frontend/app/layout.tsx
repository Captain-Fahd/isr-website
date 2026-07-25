import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Islamic Society of RMIT',
  description: 'ISR - Supporting Muslim students at RMIT University. Weekly Jumuah, events, and community.',
  icons: {
    icon: '/images/isr_logo_dark.JPG',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
