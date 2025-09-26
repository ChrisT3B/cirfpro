/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CIRFPRO Brand Colors
        'cirfpro': {
          green: {
            DEFAULT: '#29b643',
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#29b643',
            600: '#1f8c33',
            700: '#166425',
            900: '#14532d',
          },
          gray: {
            DEFAULT: '#5a5e64',
            50: '#f8f9fa',
            100: '#e9ecef',
            200: '#dee2e6',
            300: '#ced4da',
            400: '#8b9198',
            500: '#5a5e64',
            600: '#404449',
            700: '#343a40',
          }
        },
      },
      fontFamily: {
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}