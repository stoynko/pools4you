/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  theme: {
    extend: {
      colors: {
        site: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-bg-secondary)",
          warm: "var(--color-bg-warm)",
          surface: "var(--color-surface)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          alt: "var(--color-border-alt)",
        },
        brand: {
          gold: "var(--color-gold)",
          goldHover: "var(--color-gold-hover)",
          goldSubtle: "var(--color-gold-subtle)",
        },
        darkSurface: {
          DEFAULT: "var(--color-dark-bg)",
          elevated: "var(--color-dark-surface)",
          alt: "var(--color-dark-surface-alt)",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        libertinus: ["var(--font-libertinus)"],
      },
      height: {
        header: "var(--header-height)",
        logo: "var(--header-logo-height)",
      },
      minHeight: {
        header: "var(--header-height)",
        button: "48px",
      },
      width: {
        "header-cta": "180px", 
      },
      maxWidth: {
        site: "1280px",
        
      },

      spacing: {
        "btn-x": "28px",
      },

      borderRadius: {
        button: "4px",
      },

      
    },
  },
  plugins: [],
};
