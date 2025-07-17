/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ECB6F',
        black: '#000000',
        light: '#F6F6F6',
        background: '#EAF8ED',
      },
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}; 