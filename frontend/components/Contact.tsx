import Link from 'next/link'
import { MailIcon, WhatsappIcon, InstagramIcon, LocationIcon } from '@/components/Icons'

export default function Contact() {
  return (
    <section className="py-12 px-4 bg-isr-cream">
      <div className="container-isr max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-isr-dark-red">
          Get In Touch
        </h2>

        <div className="w-12 h-0.5 bg-isr-bright-red mx-auto mb-8"></div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-isr-turquoise mb-3">Contact ISR</h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="text-isr-turquoise mt-0.5">
                  <MailIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <a href="mailto:isr@rmit.edu.au" className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    isr@rmit.edu.au
                  </a>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="text-isr-turquoise mt-0.5">
                  <WhatsappIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <a href="https://wa.me/61" className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    Message us
                  </a>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="text-isr-turquoise mt-0.5">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Instagram</p>
                  <a href="https://www.instagram.com/islamicsocietyofrmit?igsh=enZoZnM0ZnVydHY=" target="_blank" rel="noreferrer" className="text-sm text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    @islamicsocietyofrmit
                  </a>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="text-isr-turquoise mt-0.5">
                  <LocationIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Location</p>
                  <p className="text-sm text-gray-700">RMIT University, Melbourne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-isr-turquoise mb-3">Quick Links</h3>

            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Learn About ISR
              </Link>
              <Link href="/mission" className="block text-sm text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Our Mission & Values
              </Link>
              <Link href="/prayer-times" className="block text-sm text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Prayer Times
              </Link>
              <Link href="/events" className="block text-sm text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Upcoming Events
              </Link>
              <a href="https://campus.hellorubric.com/?s=10733" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Join ISR
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white rounded-lg p-5 shadow-md text-center">
          <h3 className="text-base font-bold text-isr-dark-red mb-2">Stay Updated</h3>
          <p className="text-sm text-gray-700 mb-4">Subscribe to get news about events and community updates.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-isr-turquoise"
            />
            <button className="px-4 py-1.5 text-sm bg-isr-bright-red text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
