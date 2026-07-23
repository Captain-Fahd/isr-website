import MissionContent from '@/components/MissionContent'

export default function Mission() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container-isr max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-isr-dark-red">
          Our Mission & Vision
        </h2>

        <div className="w-16 h-1 bg-isr-bright-red mx-auto mb-12"></div>

        <MissionContent showCoreValues />
      </div>
    </section>
  )
}
