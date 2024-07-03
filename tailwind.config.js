/** @type {import('tailwindcss').Config} */


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily:{
     display: ["Poppins", "sans-serif"],
     cursive:["Hachi Maru Pop", "cursive"],
     arsenal:["Arsenal SC", 'sans-serif'],
     roboto:[ "Roboto", 'sans-serif']
    }
  },
  plugins: [],
}