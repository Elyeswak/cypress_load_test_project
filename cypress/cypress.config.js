const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "odw3jm",
  e2e: {
    experimentalStudio: true,
    env: {
      auth0_domain: "enquire-appqa.us.auth0.com",
      auth0_clientId: "qVi7jh9u5IFnEN24YnIi6wMd2oObx7B5",
    },

    setupNodeEvents(on, config) {},
  },
});
