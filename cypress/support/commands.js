import "cypress-wait-until";

import "./commands";

function loginToAuth0(username, password, appUrl) {
  cy.visit(appUrl);
  if (appUrl === "https://appqa.enquire.ai/") {
    cy.get("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll").click();
  }

  cy.location("origin", { timeout: 30000 }).should(
    "eq",
    "https://authqa.enquire.ai"
  );
  cy.origin(
    "https://authqa.enquire.ai",
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("input#username", { timeout: 20000 })
        .should("be.visible")
        .clear()
        .type(username);

      cy.get("button._button-login-id").should("be.visible").click();

      cy.get("input#password", { timeout: 20000 })
        .should("be.visible")
        .clear()
        .type(password, { log: false });

      cy.get("button._button-login-password").should("be.visible").click();
    }
  );

  // Extract the subdomain from appUrl
  const subdomain = new URL(appUrl).hostname.split(".")[0];

  // After successful login, return to main domain
  cy.url({ timeout: 20000 }).should("include", `${subdomain}.enquire.ai`);
  cy.url().should("not.include", "authqa.enquire.ai");

  cy.log("⏳ Waiting for JWT token...");
  cy.waitUntil(
    () => cy.getCookie("jwtToken").then((cookie) => !!cookie && !!cookie.value),
    {
      timeout: 30000,
      interval: 1000,
    }
  ).then(() => {
    cy.getCookie("jwtToken").then((cookie) => {
      cy.log("✅ JWT token found:");
      cy.log(cookie.value);
      console.log("JWT Token:", cookie.value);
    });
  });
}

Cypress.Commands.add("loginToAuth0", (username, password, appUrl) => {
  const log = Cypress.log({
    displayName: "AUTH0 LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });

  log.snapshot("before");
  loginToAuth0(username, password, appUrl);
  log.snapshot("after");
  log.end();
});

Cypress.Commands.add("askQuestionInChat", (question) => {
  // Click on "New thread" button
  cy.get("button.action-button")
    .contains("New thread")
    .should("be.visible")
    .click();

  cy.log('✅ Clicked "New thread" button');

  // Wait for the textarea to be visible and type the question
  cy.get('textarea[pinputtextarea][placeholder="Type your question here..."]', {
    timeout: 10000,
  })
    .should("be.visible")
    .clear()
    .type(question);

  cy.log(`✅ Typed question: "${question}"`);

  // Submit the question
  cy.get(
    'textarea[pinputtextarea][placeholder="Type your question here..."]'
  ).type("{enter}");

  cy.log("✅ Submitted question");

  // Wait for the streaming to complete and "Ask the experts" button to appear
  cy.log("⏳ Waiting for streaming to complete...");
  cy.waitUntil(
    () =>
      cy.get("button[pbutton]").then(($buttons) => {
        return $buttons
          .toArray()
          .some((btn) => btn.textContent.includes("Ask the experts"));
      }),
    {
      timeout: 60000,
      interval: 1000,
      errorMsg: '"Ask the experts" button did not appear within 60 seconds',
    }
  );

  cy.log('✅ Streaming completed, "Ask the experts" button appeared');

  // Click on "Ask the experts" button
  cy.get("button[pbutton]").contains("Ask the experts").click();

  cy.log('✅ Clicked "Ask the experts" button');

  // Wait for the "Confirm" button to appear
  cy.log('⏳ Waiting for "Confirm" button to appear...');
  cy.waitUntil(
    () =>
      cy.get("button[pbutton]").then(($buttons) => {
        return $buttons
          .toArray()
          .some((btn) => btn.textContent.includes("Confirm"));
      }),
    {
      timeout: 30000,
      interval: 1000,
      errorMsg: '"Confirm" button did not appear within 30 seconds',
    }
  );

  cy.log('✅ "Confirm" button appeared');

  // Click on "Confirm" button
  cy.get("button[pbutton]").contains("Confirm").should("be.visible").click();

  cy.log('✅ Clicked "Confirm" button');
});

Cypress.Commands.add("createNetworkPulse", (title, question, questionIds) => {
  // --- Open "Network Pulses" section ---
  cy.waitUntil(() => cy.contains("Network Pulses").should("be.visible"), {
    timeout: 15000,
    interval: 500,
    errorMsg: "Network Pulses button not visible after 15s",
  });
  cy.contains("Network Pulses").click({ force: true });

  // --- Click Start ---
  cy.waitUntil(() => cy.contains("Start").should("be.visible"), {
    timeout: 15000,
    interval: 500,
    errorMsg: "Start button not visible after 15s",
  });
  cy.contains("Start").click({ force: true });

  // --- Fill basic NP info ---
  cy.get("#title", { timeout: 10000 }).should("be.visible").clear().type(title);
  cy.get("#description").should("be.visible").clear().type(question);

  // Geo and expertise
  cy.get("input#autocomplete").first().type("Tunisia{enter}");
  cy.get("input#autocomplete").eq(1).type("AI{enter}");

  // --- Handle Project selection or creation ---
  cy.waitUntil(() => cy.get('span[role="combobox"]').should("exist"), {
    timeout: 10000,
    interval: 500,
    errorMsg: "Project combobox not found",
  });

  cy.get('span[role="combobox"]')
    .first()
    .then(($combo) => {
      const projectText = $combo.text().trim();

      if (projectText && projectText.length > 0) {
        cy.wrap($combo).click({ force: true });
        cy.contains("li", projectText).click({ force: true });
      } else {
        cy.contains("button", "Create Project")
          .should("be.visible")
          .click({ force: true });

        cy.get("#projectTitle", { timeout: 10000 })
          .should("be.visible")
          .type(`AutoProj-${Date.now()}`);

        cy.get('textarea[placeholder*="short description"]', { timeout: 10000 })
          .should("be.visible")
          .type("Automated test project created by Cypress.");

        cy.waitUntil(
          () => cy.contains("button", "Create").should("not.be.disabled"),
          {
            timeout: 10000,
            interval: 500,
          }
        );
        cy.contains("button", "Create").click({ force: true });
      }
    });

  // --- Wait for Review button ---
  cy.waitUntil(
    () => cy.get("#question-edit-component_submit-question_review"),
    {
      timeout: 15000,
      interval: 500,
      errorMsg: "Review button did not become active",
    }
  );
  cy.get("#question-edit-component_submit-question_review").click({
    force: true,
  });

  // --- Wait for Submit button ---
  cy.waitUntil(
    () => cy.get("#question-view-component_submit-question-question"),
    {
      timeout: 15000,
      interval: 500,
      errorMsg: "Submit button not visible or still disabled",
    }
  );

  // --- Click Submit ---
  cy.get("#question-view-component_submit-question-question").click({
    force: true,
  });

  // --- Wait up to 6s for Approve button, but continue if not found ---
  cy.wait(6000).then(() => {
    const approveButton = Cypress.$('button[label="Approve"]');
    if (approveButton.length > 0) {
      cy.log("Approve button found — clicking it");
      cy.wrap(approveButton.first()).click({ force: true });
    } else {
      cy.log("No Approve button found — continuing");
    }
  });

  // --- Wait for redirect and extract question ID ---
  cy.waitUntil(() => cy.url().should("include", "/question/"), {
    timeout: 20000,
    interval: 500,
    errorMsg: "Did not redirect to question page",
  });

  cy.url().then((currentUrl) => {
    const match = currentUrl.match(/\/question\/(\d+)/);
    if (match) {
      const questionId = match[1];
      if (Array.isArray(questionIds)) {
        questionIds.push(questionId);
      }
    }
  });
  cy.wait(10000);
});

Cypress.Commands.add(
  "assignNetworkPulsesToAdmin",
  (questionIds, adminName = "Simon Wien") => {
    // --- Wait until navigation is fully ready ---
    cy.wait(60000);

    // --- Open Network Pulses page ---
    cy.waitUntil(() => cy.get('a[href="/admin/question"]').should("exist"), {
      timeout: 15000,
      interval: 500,
      errorMsg: "Network Pulses menu link not found",
    });

    cy.get('a[href="/admin/question"]').scrollIntoView().click({ force: true });

    // --- Just wait a few seconds for table to load ---
    cy.log("⏳ Waiting for Network Pulses list to load (static delay)...");
    cy.wait(8000); // adjust if needed (8 seconds)

    // --- Make sure search box is ready ---
    cy.get('input[placeholder="Search"]', { timeout: 20000 })
      .should("be.visible")
      .and("not.be.disabled");

    // --- Process each Question ID ---
    questionIds.forEach((id) => {
      const cleanId = String(id).trim();
      cy.log(`🔍 Assigning question ID: ${cleanId}`);

      // Short delay before typing each ID
      cy.wait(1000);

      // --- Type into Search box ---
      cy.get('input[placeholder="Search"]')
        .click({ force: true })
        .clear({ force: true })
        .focus()
        .type(cleanId, { force: true, delay: 50 });

      // --- Wait a bit for the table to update ---
      cy.wait(3000);

      // --- Check if the question appears ---
      cy.get("table tr", { timeout: 10000 }).should(($rows) => {
        const text = $rows.text();
        expect(text).to.include(cleanId);
      });

      // --- Open dropdown in the same row ---
      cy.contains("tr", cleanId).within(() => {
        cy.get("div.p-dropdown").first().click({ force: true });
      });

      // --- Type admin name and select ---
      cy.get("input.p-dropdown-filter", { timeout: 10000 })
        .should("be.visible")
        .clear({ force: true })
        .type(adminName, { delay: 50, force: true });

      cy.contains("li", adminName, { timeout: 10000 }).click({ force: true });

      cy.wait(1000);
    });
  }
);

Cypress.Commands.add("addExpertsToNetworkPulses", (questionIds) => {
  questionIds.forEach((id) => {
    const cleanId = String(id).trim();
    cy.log(`🔍 Visiting question page for ID: ${cleanId}`);

    // --- Visit question page directly ---
    cy.visit(`/question/${cleanId}`);
    cy.wait(5000); // wait for question page to load

    // --- Click "Add Experts" button ---
    cy.contains("button", "Add Experts", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    cy.wait(3000); // wait for sidebar to open

    // --- Click up to 3 experts in sidebar ---
    cy.get("button")
      .contains("Add to Network Pulse")
      .then(($buttons) => {
        const max = Math.min(3, $buttons.length);
        for (let i = 0; i < max; i++) {
          cy.wrap($buttons[i]).click({ force: true });
          cy.wait(4000); // wait 4 seconds between clicks
        }
      });

    cy.wait(2000); // short pause before next question
  });
});

// More specific error handling
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore specific Auth0 related errors
  if (
    err.message.includes("postMessage") ||
    err.message.includes("Cannot read properties of null") ||
    err.message.includes("auth0")
  ) {
    return false;
  }

  // Don't fail on other common frontend errors during auth flow
  if (
    err.message.includes("ResizeObserver") ||
    err.message.includes("Non-Error promise rejection")
  ) {
    return false;
  }

  return true;
});
