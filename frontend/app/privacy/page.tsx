import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How the Islamic Society of RMIT collects, uses, stores, and protects the personal information you share with us through theisr.com.au.',
  alternates: { canonical: '/privacy/' },
}

const LAST_UPDATED = '7 August 2026'
const PRIVACY_EMAIL = 'isr@rmit.edu.au'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Legal
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Privacy Policy
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              We keep this simple: we only ask for what we need, we use it only for what you gave
              it to us for, and you can ask us to delete it at any time.
            </p>
            <p className="mt-6 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        {/* Policy Body */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mx-auto max-w-3xl space-y-12">
              {/* Who we are */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 1
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Who this policy covers</h2>
                <div className="space-y-4 leading-relaxed text-gray-600">
                  <p>
                    This policy explains how the Islamic Society of RMIT (&ldquo;ISR&rdquo;,
                    &ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal information collected
                    through this website, theisr.com.au.
                  </p>
                  <p>
                    ISR is a student club affiliated with RUSU (RMIT University Students Union). We
                    are run by student volunteers, not a commercial organisation. We handle your
                    information in line with the Australian Privacy Principles set out in the{' '}
                    <em>Privacy Act 1988</em> (Cth), and we apply those standards regardless of
                    whether they are strictly required of a club our size.
                  </p>
                  <p>
                    This policy covers this website only. RMIT University and RUSU run their own
                    systems under their own privacy policies, and any external site we link to is
                    governed by its own terms.
                  </p>
                </div>
              </div>

              {/* What we collect */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 2
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
                  What we collect, and when
                </h2>
                <p className="mb-6 leading-relaxed text-gray-600">
                  You can browse this website — prayer times, events, announcements, and
                  everything else — without giving us any personal information. We only collect
                  information when you actively choose to send it to us.
                </p>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-isr-cream/50 p-6 ring-1 ring-black/5">
                    <h3 className="mb-2 text-lg font-semibold text-isr-dark-red">
                      Newsletter subscriptions
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      If you subscribe to our newsletter, we collect your email address. We use it
                      solely to send you ISR event announcements and community updates. We do not
                      use it for anything else, and every newsletter includes a way to unsubscribe.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-isr-cream/50 p-6 ring-1 ring-black/5">
                    <h3 className="mb-2 text-lg font-semibold text-isr-dark-red">
                      Contact enquiries
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      If you send us a message through our contact form, we collect your name,
                      email address, and whatever you write in your message. We use this only to
                      read and respond to your enquiry.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-isr-cream/50 p-6 ring-1 ring-black/5">
                    <h3 className="mb-2 text-lg font-semibold text-isr-dark-red">
                      Committee administrator accounts
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      Members of the ISR committee who manage events and announcements sign in to a
                      protected admin area. Their account email and sign-in session are handled by
                      our authentication provider. This applies only to committee members, not to
                      general visitors.
                    </p>
                  </div>
                </div>

                <p className="mt-6 leading-relaxed text-gray-600">
                  We do not ask for and do not want sensitive information — including details about
                  your religious beliefs, health, finances, or background — beyond what you
                  volunteer in a message to us. Please don&apos;t include anything sensitive you
                  wouldn&apos;t want us to hold.
                </p>
              </div>

              {/* Cookies */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 3
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
                  Cookies and tracking
                </h2>
                <div className="space-y-4 leading-relaxed text-gray-600">
                  <p>
                    We do not run advertising trackers, analytics tools, or third-party marketing
                    pixels on this website. We do not build profiles of visitors, and we do not
                    track you across other sites.
                  </p>
                  <p>
                    The only cookies this site sets are essential ones: a secure session cookie
                    that keeps a committee member signed in to the admin area. If you are not
                    signing in as an administrator, no cookie is set for you.
                  </p>
                  <p>
                    Like any website, our hosting provider may keep short-term server logs
                    (including IP addresses) for security and reliability. We do not use these logs
                    to identify individual visitors.
                  </p>
                  <p>
                    If we ever introduce analytics, we will update this policy and note the change
                    here before turning it on.
                  </p>
                </div>
              </div>

              {/* How we use and share */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 4
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
                  How we use and share your information
                </h2>
                <div className="space-y-4 leading-relaxed text-gray-600">
                  <p>
                    We use your information only for the purpose you gave it to us: responding to
                    your enquiry, or sending you the newsletter you signed up for.
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-900">
                      We never sell, rent, or trade your personal information.
                    </strong>{' '}
                    We do not share it with advertisers or data brokers, and we do not pass it to
                    other student clubs or external organisations for their own use.
                  </p>
                  <p>We share information outside the ISR committee only where:</p>
                  <ul className="ml-5 list-disc space-y-2">
                    <li>
                      it is handled by a service provider we use to run the site — our database and
                      authentication provider, our email and hosting providers — strictly on our
                      instructions;
                    </li>
                    <li>you have asked us to, or clearly agreed to it; or</li>
                    <li>we are required to by law.</li>
                  </ul>
                  <p>
                    Some of these providers store data on servers outside Australia. We choose
                    providers that offer appropriate security and privacy protections.
                  </p>
                </div>
              </div>

              {/* Storage and security */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 5
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
                  Storage, security, and how long we keep it
                </h2>
                <div className="space-y-4 leading-relaxed text-gray-600">
                  <p>
                    Information is stored in our managed database and email accounts, protected by
                    encryption in transit and access controls. Only committee members who need
                    access for their role can reach it, and administrator accounts are protected by
                    individual sign-in credentials.
                  </p>
                  <p>
                    We keep newsletter subscriptions until you unsubscribe or ask us to remove you.
                    We keep contact enquiries only as long as we need them to deal with your
                    message and any follow-up, then delete them.
                  </p>
                  <p>
                    No system is perfectly secure. If a breach occurs that is likely to cause you
                    serious harm, we will notify you and the Office of the Australian Information
                    Commissioner as required under the Notifiable Data Breaches scheme.
                  </p>
                </div>
              </div>

              {/* Your rights */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 6
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Your rights</h2>
                <div className="space-y-4 leading-relaxed text-gray-600">
                  <p>At any time, you can ask us to:</p>
                  <ul className="ml-5 list-disc space-y-2">
                    <li>tell you what personal information we hold about you;</li>
                    <li>correct anything that is wrong or out of date;</li>
                    <li>delete your information from our records; or</li>
                    <li>stop sending you the newsletter.</li>
                  </ul>
                  <p>
                    Email us at{' '}
                    <a
                      href={`mailto:${PRIVACY_EMAIL}`}
                      className="font-medium text-isr-turquoise underline underline-offset-2 transition-colors hover:text-isr-bright-red"
                    >
                      {PRIVACY_EMAIL}
                    </a>{' '}
                    and we will action your request within a reasonable time, normally within 30
                    days. There is no charge for this.
                  </p>
                </div>
              </div>

              {/* Children */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 7
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Young people</h2>
                <p className="leading-relaxed text-gray-600">
                  This website is intended for RMIT students and the wider campus community. We do
                  not knowingly collect information from children under 15. If you believe a child
                  has given us their details, contact us and we will delete them.
                </p>
              </div>

              {/* Changes */}
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                  Section 8
                </p>
                <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
                  Changes to this policy
                </h2>
                <p className="leading-relaxed text-gray-600">
                  We may update this policy as the website grows or our practices change. The
                  current version always appears on this page, with the date it was last updated
                  shown at the top. If a change materially affects how we handle information you
                  have already given us, we will make that clear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Questions about your privacy?</h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              If anything here is unclear, or you want to know what we hold about you, just ask —
              a real member of the committee will read your message.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Email {PRIVACY_EMAIL}
              </a>
              <Link
                href="/contact/"
                className="rounded-lg border-2 border-isr-bright-red px-6 py-3 text-sm font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                Other ways to reach us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
