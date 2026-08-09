/**
 * Standing campus / worship details used in SEO-critical static copy.
 * Sourced from the ISR Jumu'ah flyer (jumah.jpeg). Confirm each semester.
 */
export const CAMPUS = {
  university: 'RMIT University',
  campus: 'City Campus',
  city: 'Melbourne',
  localityLabel: 'RMIT University City Campus, Melbourne',
  prayerSpaceSummary:
    'On-campus musallah and Jumu\'ah venues are available for Muslim students at RMIT City and Bundoora. Student ID is required for musallah access at City campus.',
  jumuah: {
    day: 'Friday',
    summary:
      'Jumu\'ah (Friday prayer) is held every Friday at RMIT City and RMIT Bundoora, organised by the Islamic Society of RMIT (ISR).',
    hedge:
      'Bundoora start times can shift with daylight saving and are announced weekly — message ISR on WhatsApp if you are unsure.',
    flyerImage: '/images/jumah.jpeg',
    locations: [
      {
        id: 'city',
        name: 'RMIT City',
        building: 'Building 47',
        address: '8 Orr St, Carlton VIC 3053',
        timing: '1:30pm',
        timingNote: 'All year round',
        brothers: 'Level 2 and Level 3',
        sisters: 'Level 1',
        accessNote: 'Student ID is required for musallah access.',
      },
      {
        id: 'bundoora',
        name: 'RMIT Bundoora',
        building: 'Building 202',
        address: 'Plenty Rd, Bundoora VIC 3082',
        timing: 'Commences between 12:30pm and 1:30pm',
        timingNote:
          'Jumu\'ah timings depend on daylight saving and will be announced weekly.',
        brothers: 'Room 202.03.30',
        sisters: 'Room 202.04.01',
        accessNote: null,
      },
    ],
  },
  whatsappUrl: 'https://api.whatsapp.com/send?phone=61418835013',
  email: 'isr@rmit.edu.au',
} as const
