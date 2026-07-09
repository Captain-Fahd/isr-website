import Link from 'next/link'
import { LocationIcon, ArrowRight } from '@/components/Icons'

export default function EventsPreview() {
  // Mock events data - will be replaced with API calls
  const upcomingEvents = [
    {
      id: 1,
      title: 'Weekly Jumuah Prayer',
      date: 'Every Friday',
      time: '1:30 PM',
      location: 'Building 47',
      description: 'Join us for our weekly congregation.',
      color: 'isr-turquoise',
    },
    {
      id: 2,
      title: 'Study Circle',
      date: 'Wednesday',
      time: '5:00 PM - 6:30 PM',
      location: 'Library, Meeting Room A',
      description: 'Quranic study and discussion group.',
      color: 'isr-bright-red',
    },
    {
      id: 3,
      title: 'Community Iftar',
      date: 'During Ramadan',
      time: 'Sunset Time',
      location: 'Student Hub',
      description: 'Break fast together as a community.',
      color: 'isr-dark-red',
    },
  ]

  return (
    <section className="py-20 px-4 bg-isr-light-blue bg-opacity-10">
      <div className="container-isr max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-isr-dark-red">
          Events & Activities
        </h2>
        
        <div className="w-16 h-1 bg-isr-bright-red mx-auto mb-12"></div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`h-2 bg-isr-${event.color}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-isr-dark-red mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{event.date}</strong> • {event.time}
                </p>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <LocationIcon className="w-4 h-4 text-gray-600" />
                  <span>{event.location}</span>
                </p>
                <p className="text-gray-700 mb-6">
                  {event.description}
                </p>
                <button className="text-isr-turquoise font-semibold hover:text-isr-bright-red transition-colors text-sm inline-flex items-center">
                  Learn More
                  <ArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/events"
            className="inline-block px-8 py-3 bg-isr-turquoise text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}
