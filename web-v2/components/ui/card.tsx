import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-xl p-5 transition-all duration-200',
            // Variants
            {
              'bg-bg-card border border-white/5': variant === 'default',
              'bg-gradient-to-br from-bg-card to-bg-elevated border border-white/5 shadow-xl': variant === 'elevated',
              'glass rounded-2xl': variant === 'glass',
            },
            // Hover effect
            hover && 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
            className
          )
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('flex items-center justify-between mb-4'), className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={twMerge(clsx('text-lg font-semibold text-text'), className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('text-text-muted'), className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
