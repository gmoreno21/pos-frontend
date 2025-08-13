import * as React from 'react'

function cn(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(' ')
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn('input', className)} {...props} />
})
Input.displayName = 'Input'
export { Input }
