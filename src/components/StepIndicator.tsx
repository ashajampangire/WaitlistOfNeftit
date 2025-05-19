interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 <= currentStep
        const isCurrentStep = index + 1 === currentStep

        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`
                h-2.5 rounded-full transition-all duration-500 ease-out
                ${isActive ? "w-10 bg-gradient-to-r from-indigo-500 to-purple-500" : "w-6 bg-gray-700"}
                ${isCurrentStep ? "shadow-md shadow-purple-900/50" : ""}
              `}
            />
            <span className="text-[10px] text-gray-400 mt-1">
              {index === 0 ? "Email" : index === 1 ? "Twitter" : index === 2 ? "Discord" : "Done"}
            </span>
          </div>
        )
      })}
    </div>
  )
}
