module.exports = getConfig()

function getConfig() {
  const path = require('path')
  return {
    root: true,
    parser:  '@typescript-eslint/parser',
    extends: [
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    ignorePatterns: [
      '**/.*.js',
    ],
    parserOptions: {
      tsconfigRootDir: path.resolve(__dirname),
      project: './tsconfig.json',
      ecmaVersion: 2019,
      sourceType: 'module',
      ecmaFeatures: {
        jsx:true,
      }
    },
    env: {
      browser: true,
      node: true,
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect',
      }
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 0,
      'no-empty-function': 0,
      "@typescript-eslint/no-empty-function": 0,
      "@typescript-eslint/no-namespace": 0,
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
    },
  }
}
