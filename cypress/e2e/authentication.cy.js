import secrets from "../../secrets.env";

describe('Authentication', () => {
  let pageData;
  beforeEach(() => {
    cy.visit('/')
    cy.fixture('permito_data').then((data) => {
      pageData = data
    })
  })

  it('should login with valid credentials', () => {
    cy.intercept('POST', `${pageData.login_e2e_endpoint}`).as('loginRequest')
    cy.get(pageData.sign_in_button).click()
    cy.get(pageData.email_field).type(secrets.userEmail)
    cy.get(pageData.password_field).type(secrets.userPassword)
    cy.get(pageData.submit_button).click()
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)
    cy.url().should('include', pageData.dashboard_url)
  })

  it('should not login with invalid credentials', () => {
    cy.intercept('POST', `${pageData.login_e2e_endpoint}`).as('loginRequest')
    cy.visit('/')
    cy.get(pageData.sign_in_button).click()
    cy.get(pageData.email_field).type(secrets.invalidUserEmail)
    cy.get(pageData.password_field).type(secrets.invalidUserPassword)
    cy.get(pageData.submit_button).click()
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 422 || 401)
    cy.url().should('include', pageData.login_e2e_endpoint)
    cy.contains(pageData.error_message)
  })

  it('should not login with empty credentials', () => {
    cy.get(pageData.sign_in_button).click()
    // 1. Assert the message text
    cy.get(pageData.email_field)
      .invoke('prop', 'validationMessage')
      .should('equal', 'Please fill out this field.');

    // 2. Assert the field is technically invalid (using CSS pseudo-class)
    cy.get(pageData.email_field)
      .should('have.css', 'box-shadow')

    // 3. Detailed validity check
    cy.get(pageData.email_field).then(($input) => {
      const element = $input[0];
      expect(element.validity.valueMissing).to.be.true;
    });

    cy.get(pageData.submit_button).click()
    cy.url().should('include', pageData.login_e2e_endpoint)
  })
})