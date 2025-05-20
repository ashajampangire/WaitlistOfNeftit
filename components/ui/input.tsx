
import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const baseClasses =
    "flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"

  const classes = `${baseClasses} ${className || ""}`

  return <input className={classes} ref={ref} {...props} />
})

Input.displayName = "Input"
