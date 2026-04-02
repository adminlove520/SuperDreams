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
              'bg-zinc-800 text-zinc-400': variant === 'default',
              'bg-green-500/10 text-green-500 border border-green-500/20': variant === 'primary',
              'bg-orange-500/10 text-orange-500 border border-orange-500/20': variant === 'secondary',
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': variant === 'success',
              'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': variant === 'warning',
              'bg-red-500/10 text-red-500 border border-red-500/20': variant === 'danger',
              'bg-transparent text-zinc-400 border border-zinc-700': variant === 'outline',
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
