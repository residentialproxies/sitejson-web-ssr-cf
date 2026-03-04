/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './screens/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clay - Primary warm coral
        clay: {
          50: '#FDF8F6',
          100: '#F9EBE6',
          200: '#F2D5CC',
          300: '#E8B8A8',
          400: '#D97757',
          500: '#C45E3D',
          600: '#A84B2F',
          700: '#8B3D28',
          800: '#723325',
          900: '#5F2D22',
        },
        // Ink - Deep sophisticated dark
        ink: {
          50: '#F4F4F7',
          100: '#E8E8ED',
          200: '#D0D0DB',
          300: '#A9A9BC',
          400: '#7A7A95',
          500: '#5A5A78',
          600: '#474760',
          700: '#3B3B4F',
          800: '#323244',
          900: '#1A1A2E',
          950: '#0F0F1A',
        },
        // Sage - Natural accent
        sage: {
          50: '#F6F7F4',
          100: '#E8EBE3',
          200: '#D1D7C7',
          300: '#B0BAA0',
          400: '#8B9A6D',
          500: '#6B7A4F',
          600: '#52613B',
          700: '#414D30',
          800: '#363F29',
          900: '#2D3524',
        },
        // Ochre - Warm secondary accent
        ochre: {
          50: '#FDF9F3',
          100: '#F9EFDC',
          200: '#F2DEB8',
          300: '#EAC68A',
          400: '#DFA854',
          500: '#D48C2E',
          600: '#C67624',
          700: '#A55D1F',
          800: '#854A1F',
          900: '#6D3D1B',
        },
        // Semantic colors
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'var(--text-xs)',
        'fluid-sm': 'var(--text-sm)',
        'fluid-base': 'var(--text-base)',
        'fluid-lg': 'var(--text-lg)',
        'fluid-xl': 'var(--text-xl)',
        'fluid-2xl': 'var(--text-2xl)',
        'fluid-3xl': 'var(--text-3xl)',
        'fluid-4xl': 'var(--text-4xl)',
        'fluid-5xl': 'var(--text-5xl)',
      },
      spacing: {
        'fluid-1': 'var(--space-1)',
        'fluid-2': 'var(--space-2)',
        'fluid-3': 'var(--space-3)',
        'fluid-4': 'var(--space-4)',
        'fluid-5': 'var(--space-5)',
        'fluid-6': 'var(--space-6)',
        'fluid-8': 'var(--space-8)',
        'fluid-10': 'var(--space-10)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': 'var(--shadow-glow)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
        'spring': 'var(--transition-spring)',
      },
      animation: {
        'aurora': 'aurora 20s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(2%, 2%) rotate(2deg)' },
          '66%': { transform: 'translate(-1%, 1%) rotate(-1deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(ellipse 80% 50% at 20% 40%, var(--clay-100) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, var(--sage-100) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 50% 80%, var(--ochre-100) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
