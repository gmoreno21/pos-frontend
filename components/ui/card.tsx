import * as React from 'react'
function cn(...c: Array<string | false | undefined>) { return c.filter(Boolean).join(' ') }

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="card-header" {...props} />
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="card-content" {...props} />
}
