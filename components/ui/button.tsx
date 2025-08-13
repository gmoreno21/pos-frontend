import * as React from 'react'

function cn(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(' ')
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base =
      variant === 'outline' ? 'btn-outline' :
      variant === 'ghost'   ? 'btn-ghost'   :
                              'btn'
    return <button ref={ref} className={cn(base, className)} {...props} />
  }
)
Button.displayName = 'Button'
export { Button }
