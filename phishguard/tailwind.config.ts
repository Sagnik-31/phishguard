import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-background": "#191c21",
        "on-secondary-fixed": "#011d35",
        "surface-container": "#ecedf5",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#b0c9e8",
        "tertiary-container": "#a06900",
        "inverse-surface": "#2e3036",
        "outline": "#717783",
        "tertiary-fixed": "#ffddb4",
        "inverse-on-surface": "#eff0f8",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#ffb953",
        "on-primary-fixed": "#001c39",
        "surface": "#f8f9ff",
        "on-primary-container": "#fdfcff",
        "on-error-container": "#93000a",
        "outline-variant": "#c1c7d3",
        "on-secondary": "#ffffff",
        "error-container": "#ffdad6",
        "primary-fixed": "#d4e3ff",
        "on-secondary-container": "#4b637e",
        "on-tertiary-fixed": "#291800",
        "surface-dim": "#d8dae1",
        "secondary": "#49607c",
        "on-tertiary-container": "#fffbff",
        "tertiary": "#7f5300",
        "background": "#f8f9ff",
        "primary-fixed-dim": "#a4c9ff",
        "surface-container-highest": "#e1e2e9",
        "surface-variant": "#e1e2e9",
        "secondary-container": "#c7dfff",
        "on-primary-fixed-variant": "#004883",
        "primary-container": "#2976c7",
        "surface-container-high": "#e6e8ef",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed-variant": "#314863",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3fb",
        "on-surface-variant": "#414751",
        "secondary-fixed": "#d1e4ff",
        "on-tertiary-fixed-variant": "#633f00",
        "on-surface": "#191c21",
        "inverse-primary": "#a4c9ff",
        "surface-bright": "#f8f9ff",
        "on-primary": "#ffffff",
        "surface-tint": "#0060ac",
        "primary": "#005da7"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "16px",
        "md": "24px",
        "margin": "32px",
        "xl": "64px",
        "base": "4px",
        "xs": "8px",
        "gutter": "24px",
        "lg": "40px"
      },
      fontFamily: {
        "body-md": ["Inter"],
        "label-sm": ["Inter"],
        "label-md": ["Inter"],
        "body-lg": ["Inter"],
        "h1": ["Inter"],
        "h3": ["Inter"],
        "h2": ["Inter"],
        "body-sm": ["Inter"]
      },
      fontSize: {
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
        "label-md": ["14px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "h1": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "h3": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "h2": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
};

export default config;
