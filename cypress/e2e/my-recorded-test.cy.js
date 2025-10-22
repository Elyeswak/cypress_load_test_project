// it("logs in via Auth0", () => {
//   cy.visit("https://appqa.enquire.ai/");
//   cy.get("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll").click();
//   // Wait until redirected to auth domain
//   cy.origin("https://authqa.enquire.ai", () => {
//     // Confirm we’re on the login page
//     cy.location("hostname").should("eq", "authqa.enquire.ai");

//     // Type credentials
//     cy.get('input[name="username"], input[type="email"]').type(
//       "dev.team+q1790@enquire.ai"
//     );

//     cy.get('input[name="password"]').type("Test!123456", { log: false });

//     cy.get('button[type="submit"], button[name="action"]').click();
//   });

//   // Now you’re back on appqa after login
//   cy.origin("https://appqa.enquire.ai", () => {
//     cy.location("hostname").should("eq", "appqa.enquire.ai");
//     cy.contains("Dashboard").should("be.visible");
//   });
// });
it('test', function() {
    cy.visit('https://appqa.enquire.ai/')
    
});
