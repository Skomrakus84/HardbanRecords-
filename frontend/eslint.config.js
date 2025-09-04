import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Add any custom rules here
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
];