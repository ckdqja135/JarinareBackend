/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: '#0062FF',
        lightBlue: '#E7F2FD',
        lightBlueImpossible: '#B2D0FF',
        lightestGray: '#F2F3F5',
        lightGray: '#D9D9D9',
        mediumGray: '#B1B7C1',
        darkGray: '#808080',
        green: '#1EC997',
        red: '#EA4335',
        lightImpossible: '#FEE1DF',
        black: '#000000',
        white: '#ffffff',
      },
      borderRadius: {
        xs: '7.5px',
        sm: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '30px',
      },
      fontSize: {
        xs: '10px',
        sm: '11px',
        tiny: '12px',
        base: '14px',
        md: '16px',
        lg: '18px',
      },
    },
    keyframes: {
      pulse: {
        '50%': { opacity: '0.2' },
      },
      ping: {
        '75%': { transform: 'scale(2)', opacity: 0 },
        '100%': { transform: 'scale(2)', opacity: 0 },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(720deg)' },
      },
      fadein: {
        '0%': {
          opacity: '0.5',
          transform: 'translateY(-10px)',
        },
        '100%': {
          opacity: '1',
          transform: 'translateY(0)',
        },
      },
      intro_fadein: {
        '0%': {
          opacity: '0.5',
        },
        '100%': {
          opacity: '1',
        },
      },
      fadeout: {
        '0%': {
          opacity: '1',
        },
        '100%': {
          opacity: '0',
          transform: 'translateY(-10px)',
        },
      },
      intro_fadeout: {
        '0%': {
          opacity: '1',
        },
        '100%': {
          opacity: '0',
        },
      },
      'slide-up': {
        '0%': { transform: 'translateY(100%)' },
        '100%': { transform: 'translateY(0)' },
      },
      'bounce-in': {
        '0%': { transform: 'scale(0)', opacity: '0' },
        '60%': { transform: 'scale(1.2)', opacity: '1' },
        '80%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)' },
      },
      'fade-up': {
        '0%': { opacity: '0', transform: 'translateY(8px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
    animation: {
      pulse: 'pulse 2s ease-in-out infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;',
      spin: 'spin 1s linear infinite;',
      fadein: 'fadein 0.5s',
      fadeout: 'fadeout 1s',
      intro_fadein: 'intro_fadein 0.5s',
      intro_fadeout: 'intro_fadeout 1s',
      'slide-up': 'slide-up 0.3s ease-out',
      'bounce-in':
        'bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards',
      'fade-up': 'fade-up 0.2s ease-out both',
    },
  },
  plugins: [],
  safelist: [
    {
      pattern:
        /(bg|text)-(blue|rightBlue|lightestGray|lightGray|mediumGray|darkGray|green|red|rightImpossible|black|white|)/,
    },
  ],
};
