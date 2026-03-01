/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    500: '#3B82F6',
                    600: '#2563EB',
                },
                accent: {
                    500: '#F59E0B',
                }
            },
            fontFamily: {
                sans: ['"Open Sans"', 'sans-serif'],
                heading: ['"Poppins"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
