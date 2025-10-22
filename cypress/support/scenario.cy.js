const BASE_URL = 'https://appqa.enquire.ai';

const CLIENT = { email: 'client@example.com', password: 'clientpass' };
const EXPERTS = [
  { email: 'expert1@example.com', password: 'password1', uid: 'uid-expert1' },
  // ... fill up to 20 experts
];

describe('Enquire scenario test', () => {
  before(() => {
    // Open the UI manually once to log in
    cy.visit('https://your-app.example.com/login');
    // You log in manually in interactive mode here
  });

  beforeEach(() => {
    cy.preserveSession();
  });

  it('Creates 20 questions as client', () => {
    for (let i = 1; i <= 20; i++) {
      cy.request('POST', `${BASE_URL}/questions`, {
        title: `Question ${i}`,
        body: `This is question number ${i}`,
      }).its('status').should('eq', 201);
    }
  });

  it('Admin adds 20 experts to questions', () => {
    // Example: add each expert to each question
    for (let q = 1; q <= 20; q++) {
      EXPERTS.forEach(exp => {
        cy.request('POST', `${BASE_URL}/questions/${q}/experts`, {
          expertUid: exp.uid,
        }).its('status').should('eq', 200);
      });
    }
  });

  it('Experts answer questions', () => {
    EXPERTS.forEach(exp => {
      // You could also log in each expert and store token, but for demo:
      for (let q = 1; q <= 20; q++) {
        cy.request('POST', `${BASE_URL}/questions/${q}/answers`, {
          body: `Answer from ${exp.uid}`,
          expertUid: exp.uid,
        }).its('status').should('eq', 201);
      }
    });
  });

  it('Approves 10 answers per question', () => {
    for (let q = 1; q <= 20; q++) {
      for (let a = 1; a <= 10; a++) {
        cy.request('POST', `${BASE_URL}/questions/${q}/answers/${a}/approve`)
          .its('status').should('eq', 200);
      }
    }
  });
});
