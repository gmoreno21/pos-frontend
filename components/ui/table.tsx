import * as React from 'react'

export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className="table" {...props} />
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}
export function TH(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="th" {...props} />
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}
export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="tr" {...props} />
}
export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="td" {...props} />
}
