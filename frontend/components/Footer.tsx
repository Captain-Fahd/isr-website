import { InstagramIcon, WhatsappIcon, MailIcon, FacebookIcon, LinkedInIcon } from '@/components/Icons'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-isr-dark-red text-white py-12 px-4">
      <div className="container-isr max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-lg mb-4">Islamic Society of RMIT</h4>
            <p className="text-sm text-gray-300">
              Supporting Muslim students at RMIT University City Campus, Melbourne.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/prayer-times/" className="hover:text-white transition-colors">Prayer Times</a></li>
              <li><a href="/events/" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="/about/" className="hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><a href="/contact/" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="https://campus.hellorubric.com/?s=10733" className="hover:text-white transition-colors">Membership</a></li>
              <li><a href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <NewsletterSignup variant="footer" />
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Follow Us</h4>
            <div className="flex flex-wrap gap-2">
              <a href="https://www.instagram.com/islamicsocietyofrmit/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Instagram</span>
              </a>
              <a href="https://www.facebook.com/RMITIS/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
              <a href="https://au.linkedin.com/company/islamic-society-rmit-isr" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a href="https://api.whatsapp.com/send?phone=61418835013" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition-colors" aria-label="WhatsApp">
                <WhatsappIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <a href="mailto:isr@rmit.edu.au" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition-colors" aria-label="Email">
                <MailIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Mail</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white border-opacity-20 pt-8 text-center text-sm text-gray-300">
          <p>
            © {currentYear} Islamic Society of RMIT. All rights reserved. Affiliated with RUSU (RMIT University Students Union).
          </p>
        </div>
      </div>
    </footer>
  )
}
