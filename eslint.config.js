import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      'dist-server/**',
      'node_modules/**',
      'docs/**',
      'frontend/src/components/ui/**',
      'frontend/src/api/generated.ts',
      '**/node_modules/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '.vercel/**',
      '**/.vercel/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
);
