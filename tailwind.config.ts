import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Your files are in the root 'app' folder, not 'src/app'
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 15s linear infinite',
        'gradient': 'gradient 8s linear infinite',
        // /tools terminal. Pure CSS with fill-mode both, deliberately not framer:
        // the text must be present and visible in the served HTML even if JS never
        // runs, so entrance is a reveal rather than a retype.
        'term-line': 'term-line 0.42s cubic-bezier(0.22,1,0.36,1) both',
        'caret': 'caret 1.05s steps(1) infinite',
        'sweep': 'sweep 7s linear infinite',
      },
      keyframes: {
        'term-line': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        caret: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(2000%)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;