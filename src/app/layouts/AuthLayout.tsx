import { Outlet } from 'react-router'
import { LanguageSelector } from '../../shared/ui/LanguageSelector'
import styles from './AuthLayout.module.css'
export function AuthLayout() {
  return (
    <div className={styles.viewport}>
      <div className={styles.content}>
        <div className={styles.language}>
          <LanguageSelector />
        </div>
        <Outlet />
      </div>
    </div>
  )
}
