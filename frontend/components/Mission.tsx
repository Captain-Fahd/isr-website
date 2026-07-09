import { HandshakeIcon, StarOrnament, BookIcon, GlobeIcon } from '@/components/Icons'

export default function Mission() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container-isr max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-isr-dark-red">
          Our Mission & Values
        </h2>
        
        <div className="w-16 h-1 bg-isr-bright-red mx-auto mb-12"></div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-isr-cream rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-bold text-isr-turquoise mb-4">Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To create a welcoming and inclusive community for Muslim students at RMIT, 
              fostering spiritual growth, academic excellence, and meaningful social connections 
              through shared experiences and mutual support.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-isr-yellow rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-bold text-isr-dark-red mb-4">Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To be a beacon of faith and community at RMIT, recognized for promoting understanding, 
              celebrating diversity, and empowering Muslim students to achieve their personal, 
              spiritual, and professional aspirations.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-isr-dark-red mb-8">Core Values</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: HandshakeIcon, title: 'Community', desc: 'Supporting one another' },
              { Icon: StarOrnament, title: 'Faith', desc: 'Spiritual connection' },
              { Icon: BookIcon, title: 'Knowledge', desc: 'Learning & growth' },
              { Icon: GlobeIcon, title: 'Inclusivity', desc: 'Open to all' },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="mb-2 text-isr-turquoise">
                  <value.Icon />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
