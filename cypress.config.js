const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "odw3jm",
  e2e: {
    baseUrl: "https://appqa.enquire.ai",
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
