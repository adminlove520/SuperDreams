import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Variants
            {
              'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]': variant === 'primary',
              'bg-bg-card text-text hover:bg-bg-elevated border border-white/10 active:scale-[0.98]': variant === 'secondary',
              'bg-transparent text-text-muted hover:text-text hover:bg-white/5': variant === 'ghost',
              'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20': variant === 'danger',
            },
            // Sizes
            {
              'h-8 px-3 text-sm': size === 'sm',
              'h-10 px-4 text-sm': size === 'md',
              'h-12 px-6 text-base': size === 'lg',
            },
            className
          )
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
