const BASE_URL = "https://appqa.enquire.ai";
const url = "https://appqa.enquire.ai/";

let adminToken;
const questionIds = [];
let expertsMap;

const clients = [
  // { email: "dev.team+q1810@enquire.ai", password: "Test!123456" },
  // { email: "dev.team+q1792@enquire.ai", password: "Test!123456" },
  // { email: "dev.team+q1793@enquire.ai", password: "Test!123456" },
  { email: "dev.team+q1791@enquire.ai", password: "Test!123456" },
];

const admin = {
  email: "ali.colgecen+qasuperadmin@enquire.ai",
  password: "Test!123456",
};

describe("Enquire multi-client NP creation", () => {
  // --- Create NPs for each client ---
  clients.forEach((client, clientIndex) => {
    it(`should log in as client ${clientIndex + 1} and create 2 NPs`, () => {
      cy.session(`auth0-login-${client.email}`, () => {
        cy.loginToAuth0(client.email, client.password, url);
      }).then(() => {
        cy.getCookie("jwtToken")
          .should("exist")
          .then((cookie) => {
            adminToken = cookie.value;
          });
      });

      cy.visit(url);

      for (let i = 1; i <= 1; i++) {
        const title = `Auto NP ${clientIndex + 1}-${i} (${Date.now()})`;
        const question = `Automated NP question ${i} by ${client.email}`;
        cy.log(`Creating NP ${i} for client ${client.email}`);
        cy.createNetworkPulse(title, question, questionIds);
      }
    });
  });

  // --- Admin actions after all clients finish ---
  it("should log in as admin, assign NPs, and add experts", () => {
    cy.log("✅ All created question IDs:", JSON.stringify(questionIds));

    cy.session("auth0-login-admin", () => {
      cy.loginToAuth0(admin.email, admin.password, url);
    });

    cy.visit(url);

    cy.then(() => {
      cy.log(`Assigning ${questionIds.length} NPs to Simon Wien`);
      cy.assignNetworkPulsesToAdmin(questionIds, "Simon Wien");

      cy.log(`Adding experts to ${questionIds.length} NPs...`);
    });

    cy.addExpertsToNetworkPulses(questionIds).then((map) => {
      expertsMap = map;
      cy.log("✅ Expert map collected!");
      console.log("Experts map in test:", expertsMap);
      
      cy.answerQuestionsAsExperts(expertsMap, "This is an automated answer from Cypress.");
    });
  });
});

// it("1. Admin adds experts to questions with manual login every 2 questions", () => {
//   QUESTIONS.forEach((questionId, questionIndex) => {
//     // // Refresh token every 2 questions using manual login
//     // if (questionIndex % 2 === 0) {
//     //   cy.session(`refresh-token-${questionIndex}`, () => {
//     //     cy.visit(BASE_URL);
//     //     cy.pause(); // Manual intervention point
//     //   }).then(() => {
//     //     // Capture refreshed token
//     //     cy.getCookie("jwtToken").should("exist").then((cookie) => {
//     //       adminToken = cookie.value;
//     //       cy.log(`🔑 Refreshed JWT captured before question ${questionId}: ${adminToken.substring(0, 20)}...`);
//     //     });
//     //   });
//     // }

//     // Add experts to the question
//     EXPERTS.forEach((exp) => {
//       cy.then(() => {
//         // Use cy.then to ensure we have the latest token value
//         cy.request({
//           method: "POST",
//           url: `https://api.appqa.enquire.ai/api/v1/organizer/questions/add-expert`,
//           headers: {
//             Authorization: `Bearer ${adminToken}`,
//             "Content-Type": "application/json",
//             Accept: "application/json, text/plain, */*",
//           },
//           body: {
//             questionId,
//             expertProfileIds: [exp.uid],
//           },
//           failOnStatusCode: false,
//         }).then((resp) => {
//           if (resp.status !== 200) {
//             cy.log(
//               `❌ Failed to add expert ${exp.uid} to question ${questionId}: ${resp.status}`
//             );
//             if (resp.status !== 401) {
//               // Don't log full response for auth errors
//               cy.log(JSON.stringify(resp.body, null, 2));
//             }
//           } else {
//             cy.log(`✅ Added expert ${exp.uid} to question ${questionId}`);
//           }
//         });
//       });

//       cy.wait(1500);
//     });
//   });
// });

// it("2. Experts answer questions (one manual login per expert)", () => {
//   EXPERTS.forEach((exp) => {
//     // Fresh login session for each expert
//     cy.session(`manual-login-expert-${exp.uid}`, () => {
//       cy.visit(BASE_URL);
//       cy.pause(); // Manual intervention to switch user
//     }).then(() => {
//       // Capture expert token
//       cy.getCookie("jwtToken")
//         .should("exist")
//         .then((cookie) => {
//           adminToken = cookie.value; // Reusing the variable name but it's actually the expert token
//           cy.log(
//             `🔑 Captured JWT for expert ${exp.uid}: ${adminToken.substring(
//               0,
//               20
//             )}...`
//           );
//         });
//     });

//     // Submit answers for all questions
//     QUESTIONS.forEach((questionId) => {
//       cy.then(() => {
//         cy.request({
//           method: "POST",
//           url: `https://api.appqa.enquire.ai/api/v1/question-responses`,
//           headers: {
//             Authorization: `Bearer ${adminToken}`,
//             "Content-Type": "application/json",
//             Accept: "application/json, text/plain, */*",
//           },
//           body: {
//             text: `Test answer from expert ${exp.uid} for question ${questionId}`,
//             questionId,
//             source: "web",
//             expertProfileId: exp.uid,
//             complianceAcknowledgement: true,
//           },
//           failOnStatusCode: false,
//         }).then((resp) => {
//           if (resp.status !== 201) {
//             cy.log(
//               `⚠️ Failed answer for expert ${exp.uid} on question ${questionId}, status: ${resp.status}`
//             );
//             if (resp.status !== 500 && resp.status !== 401) {
//               // Don't log full response for server/auth errors
//               cy.log(JSON.stringify(resp.body, null, 2));
//             }
//           } else {
//             cy.log(
//               `✅ Answer submitted by expert ${exp.uid} for question ${questionId}`
//             );
//           }
//         });
//       });

//       cy.wait(2000);
//     });
//   });
// });

// it("3. Manual login for final approving", () => {
//   cy.session("manual-login-final", () => {
//     cy.visit(BASE_URL);
//     cy.pause(); // Final manual intervention
//   }).then(() => {
//     cy.getCookie("jwtToken")
//       .should("exist")
//       .then((cookie) => {
//         adminToken = cookie.value;
//         cy.log(`🔑 Final JWT captured: ${adminToken.substring(0, 20)}...`);
//       });
//   });
// });

it("test", function () {});
