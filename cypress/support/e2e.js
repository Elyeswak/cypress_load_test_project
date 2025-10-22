// cypress/support/e2e.js
// cypress/support/e2e.js
import './commands';
import 'cypress-wait-until';

// Ignore uncaught exceptions so Cypress won't fail due to frontend JS issues
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('postMessage')) {
    // Ignore the postMessage null error
    return false
  }
  return false // or ignore all, safe if you're only doing API tests
})

// Custom command to preserve session after manual login
Cypress.Commands.add('manualLoginOnce', () => {
  cy.session('manual-login', () => {
    // Visit the login page and let the user log in manually
    cy.visit('https://appqa.enquire.ai')

    // Pause execution so you can complete login manually in the browser
    cy.pause()

    // After you resume (press the play ▶ button in Cypress UI),
    // Cypress will save all cookies, localStorage, sessionStorage
    // as part of this session, so future tests reuse it.
  })
})
