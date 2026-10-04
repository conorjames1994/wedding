/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2A24',      // deep forest ink - primary text & dark sections
        paper: '#F1F3ED',    // soft sage-white background
        moss: '#5F6F52',     // primary accent - buttons, links, active states
        clay: '#B0664D',     // secondary accent - used sparingly (RSVP CTA, highlights)
        blush: '#D8B7AC',    // tertiary - soft fills, tags
        line: '#D8DCD1',     // hairline borders on paper bg
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Work Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
