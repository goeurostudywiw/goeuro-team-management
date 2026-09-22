/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7E22CE',
            800: '#6B21A8',
            900: '#581C87',
            950: '#3B0764',
          },
          black: '#09090B',
          dark: '#18181B',
          charcoal: '#27272A',
          canvas: '#FAFAFB',
          border: '#E4E4E7',
        },
        // Keep goeuro alias mapped to the purple brand for seamless compatibility
        goeuro: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#A855F7',
          500: '#9333EA',
          600: '#7E22CE',
          700: '#6B21A8',
          800: '#581C87',
          900: '#09090B', // Crisp Notion Black
          950: '#000000', // Pure Black
        },
        gold: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        }
      },
      fontFamily: {
        burmese: ['WaTokeLay', '"Noto Sans Myanmar"', 'Pyidaungsu', 'Padauk', 'sans-serif'],
        watokelay: ['WaTokeLay', '"Noto Sans Myanmar"', 'Pyidaungsu', 'sans-serif'],
        aka: ['Aka03', '"Noto Sans Myanmar"', 'Pyidaungsu', 'sans-serif'],
        phantee: ['Phantee03', '"Noto Sans Myanmar"', 'Pyidaungsu', 'sans-serif'],
        handwritten: ['PhanteeHandwritten', 'cursive', '"Noto Sans Myanmar"', 'sans-serif'],
        atest: ['ATest', '"Noto Sans Myanmar"', 'Pyidaungsu', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'notion-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'notion-modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-purple': '0 0 15px -3px rgba(147, 51, 234, 0.25), 0 0 6px -2px rgba(147, 51, 234, 0.2)',
        'glow-purple-lg': '0 0 35px -5px rgba(147, 51, 234, 0.35), 0 0 15px -3px rgba(147, 51, 234, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.3), 0 0 8px -2px rgba(16, 185, 129, 0.2)',
        'glass-card': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInFast: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-fast': 'fadeInFast 0.15s ease-out forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
