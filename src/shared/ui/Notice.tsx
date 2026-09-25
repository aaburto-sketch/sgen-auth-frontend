import type { HTMLAttributes } from 'react'
import styles from './Notice.module.css'

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'neutral' | 'warning'
}

export function Notice({ children, className = '', variant = 'neutral', ...props }: Readonly<NoticeProps>) {
  return (
    <div {...props} className={`${styles.notice} ${styles[variant]} ${className}`}>
      {children}
    </div>
  )
}
