import Link from 'next/link'
import { MailIcon, WhatsappIcon, InstagramIcon, LocationIcon } from '@/components/Icons'

export default function Contact() {
  return (
    <section className="py-20 px-4 bg-isr-cream">
      <div className="container-isr max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-isr-dark-red">
          Get In Touch
        </h2>
        
        <div className="w-16 h-1 bg-isr-bright-red mx-auto mb-12"></div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-isr-turquoise mb-6">Contact ISR</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="text-isr-turquoise mt-1">
                  <MailIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:isr@rmit.edu.au" className="text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    isr@rmit.edu.au
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-isr-turquoise mt-1">
                  <WhatsappIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <a href="https://wa.me/61" className="text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    Message us
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-isr-turquoise mt-1">
                  <InstagramIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Instagram</p>
                  <a href="https://instagram.com" className="text-isr-turquoise hover:text-isr-bright-red transition-colors">
                    @isr.rmit
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-isr-turquoise mt-1">
                  <LocationIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-700">RMIT University, Melbourne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-bold text-isr-turquoise mb-6">Quick Links</h3>
            
            <div className="space-y-3">
              <Link href="/about" className="block text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Learn About ISR
              </Link>
              <Link href="/mission" className="block text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Our Mission & Values
              </Link>
              <Link href="/prayer-times" className="block text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Prayer Times
              </Link>
              <Link href="/events" className="block text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Upcoming Events
              </Link>
              <Link href="/membership" className="block text-gray-700 hover:text-isr-bright-red font-medium transition-colors">
                → Join ISR
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <h3 className="text-xl font-bold text-isr-dark-red mb-4">Stay Updated</h3>
          <p className="text-gray-700 mb-6">Subscribe to get news about events and community updates.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-isr-turquoise"
            />
            <button className="px-6 py-2 bg-isr-bright-red text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
