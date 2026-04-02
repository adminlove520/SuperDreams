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
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Variants
            {
              'bg-green-500 text-white hover:bg-green-600 active:scale-[0.98]': variant === 'primary',
              'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 active:scale-[0.98]': variant === 'secondary',
              'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50': variant === 'ghost',
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
