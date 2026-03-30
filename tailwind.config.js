/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    hover: '#0F766E',
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                    hover: '#1e3a8a',
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                    hover: '#0F766E',
                    light: '#F0FDFA',
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                heading: ['var(--font-manrope)', 'sans-serif'],
                manrope: ['var(--font-manrope)', 'sans-serif'],
            },
            animation: {
                blob: "blob 7s infinite",
                shimmer: "shimmer 3s ease-in-out infinite",
                'glow-border': "glow-border 2s ease-in-out infinite",
                float: "float 20s ease-in-out infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                shimmer: {
                    "0%": {
                        backgroundPosition: "-200% 0",
                    },
                    "100%": {
                        backgroundPosition: "200% 0",
                    },
                },
                'glow-border': {
                    "0%, 100%": {
                        textShadow: "0 0 2px rgba(59, 130, 246, 0.3), 0 0 4px rgba(59, 130, 246, 0.2)",
                    },
                    "50%": {
                        textShadow: "0 0 4px rgba(59, 130, 246, 0.5), 0 0 8px rgba(59, 130, 246, 0.3), 0 0 12px rgba(59, 130, 246, 0.15)",
                    },
                },
                float: {
                    "0%, 100%": {
                        transform: "translateY(0px) translateX(0px)",
                        opacity: "0.15",
                    },
                    "25%": {
                        transform: "translateY(-20px) translateX(10px)",
                        opacity: "0.25",
                    },
                    "50%": {
                        transform: "translateY(-40px) translateX(-5px)",
                        opacity: "0.1",
                    },
                    "75%": {
                        transform: "translateY(-20px) translateX(-10px)",
                        opacity: "0.2",
                    },
                },
            },
        },
    },
    plugins: [],
}
