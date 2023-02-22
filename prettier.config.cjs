/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: 'es5',
  useTabs: true,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  bracketSpacing: false,
  jsxSingleQuote: true,
  tailwindConfig: './tailwind.config.cjs',
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
