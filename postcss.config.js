    // postcss.config.js or postcss.config.mjs
    module.exports = {
      plugins: {
        '@tailwindcss/postcss': {}, // Use the new package
        autoprefixer: {}, // Keep autoprefixer if you're using it
      },
    };