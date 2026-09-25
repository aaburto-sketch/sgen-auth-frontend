import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = '', ...props }: Readonly<TextFieldProps>) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <input {...props} id={inputId} className={`${styles.input} ${className}`} />
    </>
  )
}
