import type { ErrorCode } from '../../api/errors'

export const en = {
  app: {
    name: 'SGEn',
    title: 'SGEn Auth',
    documentTitle: '{{title}} | {{module}}',
    missingApiKey: 'Set <key>{{variable}}</key> in the {{file}} file',
  },
  modules: {
    login: 'Sign in',
    register: 'Registration',
  },
  auth: {
    modeLabel: 'Access options',
    loginTab: 'Sign in',
    registerTab: 'Sign up',
    loginForm: 'Sign in',
    registerForm: 'Create account',
    emailLabel: 'Email address',
    emailPlaceholder: 'Email Address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password',
    loginButton: 'Sign in',
    registerButton: 'Register',
    processing: 'Processing...',
    loginSuccess: 'Login successful! JWT received. {{tokenPreview}}...',
    registrationSuccess: 'Successfully registered with Google and the database!',
    errorMessage: 'Error: {{message}}',
  },
  onboarding: {
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Full Name',
    legalNameLabel: 'Legal name',
    legalNamePlaceholder: 'Legal Name (e.g. Company Ltd.)',
    masterTaxIdLabel: 'Master RFC',
    masterTaxIdPlaceholder: 'Master RFC (12 or 13 characters)',
  },
  errors: {
    unknown: 'The operation could not be completed.',
    authenticationFailed: 'Authentication failed.',
    invalidIdentityResponse: 'The authentication response does not contain a valid token.',
    invalidCredentials: 'The email address or password is incorrect.',
    emailExists: 'An account with this email already exists.',
    invalidEmail: 'Enter a valid email address.',
    weakPassword: 'The password does not meet the security requirements.',
    tooManyAttempts: 'Too many attempts. Please wait before trying again.',
    disabledAccount: 'This account has been disabled.',
    operationNotAllowed: 'Email and password authentication is not available.',
    sessionExpired: 'Your session could not be validated. Sign in again.',
    identityConfiguration: 'The authentication service is not configured correctly.',
    network: 'Unable to connect to the service. Check your connection.',
    invalidResponse: 'The service returned an unreadable response.',
    registrationFailed: 'Registration could not be completed.',
    registrationReverted: 'Database error. Registration successfully reverted.',
    invalidRegistration: 'The registration data could not be accepted.',
    registrationConflict: 'The registration conflicts with existing data.',
    forbidden: 'You do not have permission to perform this operation.',
  } satisfies Record<ErrorCode, string>,
} as const

type StringCatalog<T> = { [Key in keyof T]: T[Key] extends string ? string : StringCatalog<T[Key]> }

export type TranslationCatalog = StringCatalog<typeof en>
