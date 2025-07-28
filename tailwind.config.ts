import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			backgroundImage: {
				'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
			},
			boxShadow: {
				'inner-white-sm': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.15)',
				'inner-red-sm': 'inset 0 1px 2px 0 rgba(239, 68, 68, 0.25)',
				'inner-blue-sm': 'inset 0 1px 2px 0 rgba(59, 130, 246, 0.25)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
        btn: {
          background: 'hsl(var(--btn-bg))',
          'background-hover': 'hsl(var(--btn-bg-hover))',
          foreground: 'hsl(var(--btn-text))',
          border: 'hsl(var(--btn-border))',
          primary: {
            background: 'hsl(var(--btn-primary-bg))',
            'background-hover': 'hsl(var(--btn-primary-bg-hover))',
            foreground: 'hsl(var(--btn-primary-text))',
          },
          destructive: {
            background: 'hsl(var(--btn-destructive-bg))',
            'background-hover': 'hsl(var(--btn-destructive-bg-hover))',
            foreground: 'hsl(var(--btn-destructive-text))',
          }
        }
			},
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"trophy-glow": {
					'0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))' },
					'50%': { filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 1))' },
				},
				"fade-in-up": {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in-top': {
					from: {
						opacity: '0',
						transform: 'translateY(-100%) scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05)'
					},
					'70%': {
						transform: 'scale(0.9)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"trophy-glow": "trophy-glow 2s ease-in-out infinite",
				"fade-in-up": "fade-in-up 0.5s ease-out forwards",
				"perk-in-1": "fade-in-up 0.5s 0.2s ease-out forwards",
				"perk-in-2": "fade-in-up 0.5s 0.4s ease-out forwards",
				"perk-in-3": "fade-in-up 0.5s 0.6s ease-out forwards",
				"perk-in-4": "fade-in-up 0.5s 0.8s ease-out forwards",
				'slide-in-top': 'slide-in-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
