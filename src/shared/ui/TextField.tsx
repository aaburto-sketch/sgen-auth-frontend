import { useId, type InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = 'input-field', ...props }: Readonly<TextFieldProps>) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <>
      <label className="visually-hidden" htmlFor={inputId}>{label}</label>
      <input {...props} id={inputId} className={className} />
    </>
  )
}
