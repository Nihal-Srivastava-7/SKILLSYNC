/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A", // Navy Blue
        accent: "#38BDF8", // Sky Blue
        bg: "#F8FAFC", // Light Gray
        text: "#1F2937", // Charcoal
        success: "#10B981", // Emerald
      },
      fontFamily: {
        heading: ['"Poppins"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        accent: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(30,58,138,0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
