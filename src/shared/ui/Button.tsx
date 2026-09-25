import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export function Button({ children, className = '', type = 'button', ...props }: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button {...props} type={type} className={`${styles.button} ${className}`}>
      {children}
    </button>
  )
}
