import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'design', '.claude', '.lighthouseci', 'test-results', 'playwright-report', 'node_modules', 'tmp'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['scripts/**/*.mjs', 'tools/**/*.{ts,mjs}', '*.config.{js,ts}', 'tests/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Playwright-Fixtures heißen `use`, sind aber keine React-Hooks.
    files: ['tests/e2e/**/*.ts', 'tests/shots/**/*.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
)
