import { CommunityIcon, FaithIcon, BookIcon, GlobeIcon } from '@/components/Icons'
import { coreValues, missionText, visionText } from '@/lib/missionContent'

const valueIcons = [CommunityIcon, FaithIcon, BookIcon, GlobeIcon] as const

type MissionContentProps = {
  showCoreValues?: boolean
}

export default function MissionContent({ showCoreValues = false }: MissionContentProps) {
  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="rounded-lg bg-isr-yellow p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Vision</h2>
          <p className="leading-relaxed text-gray-700">{visionText}</p>
        </div>

        <div className="rounded-lg bg-isr-cream p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-isr-turquoise">Mission</h2>
          <p className="leading-relaxed text-gray-700">{missionText}</p>
        </div>
      </div>

      {showCoreValues && (
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-isr-dark-red">Core Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {coreValues.map((value, index) => {
              const Icon = valueIcons[index]
              return (
                <div key={value.title} className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
