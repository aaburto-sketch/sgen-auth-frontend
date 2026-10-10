// Este componente sirve como cascarón visual para la futura implementación de MFA.
// No está conectado al flujo funcional porque aún no hay endpoint de verificación TOTP.

import { useState } from 'react'
import { Notice } from '../../../shared/ui/Notice'
import styles from '../../pages/AuthPage.module.css'

export function MfaVerification({ onVerify }: { onVerify?: (code: string) => void }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6 && onVerify) {
      onVerify(code)
    }
  }

  return (
    <div className={styles.stepContainer}>
      <h1 className={styles.title} style={{ textAlign: 'left', margin: 0 }}>Verificación en dos pasos</h1>
      <Notice variant="neutral" style={{ background: '#E6ECFB', color: '#23306E', border: 'none' }}>
        Se detectó un inicio de sesión desde un dispositivo nuevo. Ingrese el código de su aplicación autenticadora.
      </Notice>
      
      <form onSubmit={handleSubmit} className={styles.inputGroup} style={{ marginTop: '8px' }}>
        <label htmlFor="mfaCode" className={styles.label}>Código de 6 dígitos</label>
        <input 
          id="mfaCode" 
          type="text" 
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className={styles.input}
          style={{ height: '52px', fontSize: '24px', letterSpacing: '0.4em', fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'center' }}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />
        <button type="submit" className={styles.buttonPrimary} style={{ marginTop: '14px' }} disabled={code.length !== 6}>
          Verificar
        </button>
      </form>
    </div>
  )
}
