import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          fontFamily: {
            fredoka: ['Fredoka', 'sans-serif'],
          },
          animation: {
            'fade-in-up': 'fadeInUp 0.5s ease-out',
            'fade-in-down': 'fadeInDown 0.5s ease-out',
            'fade-in': 'fadeIn 0.5s ease-out',
            'float': 'float 3s ease-in-out infinite',
            'pulse-slow': 'pulse 3s ease-in-out infinite',
            'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
            'slide-in-left': 'slideInLeft 0.5s ease-out',
            'slide-in-right': 'slideInRight 0.5s ease-out',
          },
          keyframes: {
            fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeInDown: {
              '0%': { opacity: '0', transform: 'translateY(-20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            float: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
            bounceGentle: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-5px)' },
            },
            slideInLeft: {
              '0%': { opacity: '0', transform: 'translateX(-20px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
            },
            slideInRight: {
              '0%': { opacity: '0', transform: 'translateX(20px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
            },
          },
          backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          },
          boxShadow: {
            'glow': '0 0 20px rgba(99, 102, 241, 0.1)',
            'glow-lg': '0 0 40px rgba(99, 102, 241, 0.15)',
          },
        },
      },
    }),
  ],
    css: {
    transformer: 'postcss', // ✅ Disable lightningcss to prevent native binary issues
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  },
});
