import sonarjs from 'eslint-plugin-sonarjs'
import typescriptParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'dist-ssr/**', 'coverage/**', '.cache/**', '.vite/**', '.vite-temp/**'],
  },
  {
    ...sonarjs.configs.recommended,
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
