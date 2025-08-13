import * as React from 'react'
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>){
  return <label className="text-sm text-gray-700 dark:text-gray-300" {...props}/>
}
