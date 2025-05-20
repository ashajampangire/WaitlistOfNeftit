import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  const baseClasses = "rounded-lg border border-gray-700 bg-gray-800 shadow-sm"

  const classes = `${baseClasses} ${className || ""}`

  return <div className={classes} ref={ref} {...props} />
})

Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => {
  const baseClasses = "flex flex-col space-y-1.5 p-6"

  const classes = `${baseClasses} ${className || ""}`

  return <div className={classes} ref={ref} {...props} />
})

CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => {
  const baseClasses = "text-2xl font-semibold leading-none tracking-tight text-white"

  const classes = `${baseClasses} ${className || ""}`

  return <h3 className={classes} ref={ref} {...props} />
})

CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = "text-sm text-gray-400"

    const classes = `${baseClasses} ${className || ""}`

    return <p className={classes} ref={ref} {...props} />
  },
)

CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => {
  const baseClasses = "p-6 pt-0"

  const classes = `${baseClasses} ${className || ""}`

  return <div className={classes} ref={ref} {...props} />
})

CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, ...props }, ref) => {
  const baseClasses = "flex items-center p-6 pt-0"

  const classes = `${baseClasses} ${className || ""}`

  return <div className={classes} ref={ref} {...props} />
})

CardFooter.displayName = "CardFooter"
