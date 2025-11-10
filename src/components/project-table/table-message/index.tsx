import clsx from "clsx"
import * as React from "react"
import { twMerge } from "tailwind-merge"

export interface TableMessageProps {
  message: string
  testId: string
  className?: string
}

export const TableMessage: React.FC<TableMessageProps> = ({ message, testId, className }) => (
  <tr>
    <td
      colSpan={3}
      className={twMerge(clsx(`text-center align-middle`, className))}
      data-testid={testId}
    >
      {message}
    </td>
  </tr>
)