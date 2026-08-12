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
  /**
   * Dedicated prayer rooms by campus. Room numbers and hours are published by
   * RMIT — confirm each semester alongside the Jumu'ah details below.
   */
  prayerSpaces: [
    {
      id: 'city',
      name: 'City Campus',
      status: 'Confirmed',
      description: "Main musallah and the City Friday prayer location.",
      building: 'Building 47, Levels 1–3',
      rooms: 'Brothers: Levels 2 & 3 • Sisters: Level 1',
      hours: '9:00 am–5:00 pm, Monday–Friday',
      brothers: 'Building 47, Level 2 and Level 3',
      sisters: 'Building 47, Level 1',
      wudu: 'Contact ISR if you need current wudu directions.',
      accessibility: 'Student ID is required for musallah access at City campus.',
    },
    {
      id: 'brunswick',
      name: 'Brunswick Campus',
      status: 'Confirmed',
      description: 'Dedicated Islamic prayer rooms at Brunswick.',
      building: 'Building 514, Level 2',
      rooms: 'Brothers: 514.2.07 • Sisters: 514.2.06',
      hours: '9:00 am–5:00 pm, Monday–Friday',
      brothers: 'Building 514, Level 2, Room 07 (514.2.07)',
      sisters: 'Building 514, Level 2, Room 06 (514.2.06)',
      wudu: 'Contact ISR if you need current wudu directions.',
      accessibility: 'Contact ISR if you need accessibility or access guidance.',
    },
    {
      id: 'bundoora-east',
      name: 'Bundoora East',
      status: 'Confirmed',
      description: 'Dedicated Islamic prayer rooms at Bundoora East.',
      building: 'Building 254, Level 1',
      rooms: 'Brothers: 254.1.02 • Sisters: 254.1.03',
      hours: '9:00 am–5:00 pm, Monday–Thursday',
      brothers: 'Building 254, Level 1, Room 02 (254.1.02)',
      sisters: 'Building 254, Level 1, Room 03 (254.1.03)',
      wudu: 'Contact ISR if you need current wudu directions.',
      accessibility: 'Contact ISR if you need accessibility or access guidance.',
    },
    {
      id: 'bundoora-west',
      name: 'Bundoora West',
      status: 'Confirmed',
      description: 'Daily prayer rooms and the Bundoora Friday prayer location.',
      building: 'Building 202',
      rooms: 'Brothers: 202.04.29 • Sisters: 202.04.01',
      hours: '9:00 am–5:00 pm, Monday–Friday',
      brothers: 'Building 202, Level 4, Room 29 (202.04.29)',
      sisters: 'Building 202, Level 4, Room 01 (202.04.01)',
      wudu: 'Contact ISR if you need current wudu directions.',
      accessibility: 'Contact ISR if you need accessibility or access guidance.',
    },
  ],
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
