import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center font-medium rounded-full',
            // Variants
            {
              'bg-bg-elevated text-text-muted': variant === 'default',
              'bg-primary/10 text-primary border border-primary/20': variant === 'primary',
              'bg-accent/10 text-accent border border-accent/20': variant === 'secondary',
              'bg-green-500/10 text-green-500 border border-green-500/20': variant === 'success',
              'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': variant === 'warning',
              'bg-red-500/10 text-red-500 border border-red-500/20': variant === 'danger',
              'bg-transparent text-text-muted border border-white/10': variant === 'outline',
            },
            // Sizes
            {
              'px-2 py-0.5 text-xs': size === 'sm',
              'px-3 py-1 text-sm': size === 'md',
            },
            className
          )
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
