import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RegistrationPage extends BasePage {
  readonly registrationPageIdentifier: Locator;
  readonly FullName: Locator;
  readonly Email: Locator;
  readonly Password: Locator;
  readonly termsCheckbox: Locator;
  readonly continueButton: Locator;

  // New fields for validation
  readonly membershipStatus: Locator;
  readonly membershipType: Locator;
  readonly summary: Locator;
  readonly cadre: Locator;
  readonly batch: Locator;
  readonly rank: Locator;
  readonly designation: Locator;
  readonly residentialAddress: Locator;
  readonly officeAddress: Locator;
  readonly areaOfStudy: Locator;
  readonly qualification: Locator;
  readonly department: Locator;
  readonly idNumber: Locator;
  readonly college: Locator;
  readonly admissionYear: Locator;
  readonly mobile: Locator;
  readonly officePhone: Locator;
  readonly residentialPhone: Locator;
  readonly nationality: Locator;
  readonly idDocumentFront: Locator;
  readonly idDocumentBack: Locator;
  readonly affiliation: Locator;
  readonly degree: Locator;
  readonly year: Locator;

  constructor(page: Page) {
    super(page);
    this.registrationPageIdentifier = page.locator('input#userName');
    
    this.FullName = page.locator('input#userName');
    this.Email = page.locator('input#email');
    this.Password = page.locator('input#password');
    this.termsCheckbox = page.getByRole('checkbox', { name: 'I have read and agree to the' });
    this.continueButton = page.getByRole('button', { name: /Next|Continue/i });

    // Initializing new locators using actual DOM names and IDs
    this.membershipStatus = page.locator('input[name="membershipStatus"], select[name="membershipStatus"], #membershipStatus');
    this.membershipType = page.locator('input[name="membershipType"], select[name="membershipType"], #membershipType');
    this.summary = page.locator('textarea[name="about"], #about');
    this.cadre = page.locator('input[name="cadre"], #cadre');
    this.batch = page.locator('input[name="batch"], #batch');
    this.rank = page.locator('input[name="rank"], #rank');
    this.designation = page.locator('input[name="designation"], #designation');
    this.residentialAddress = page.locator('textarea[name="residentialAddress"], #residentialAddress');
    this.officeAddress = page.locator('textarea[name="officeAddress"], #officeAddress');
    this.areaOfStudy = page.locator('input[name="speciality"], #speciality');
    this.qualification = page.locator('input[name="degree"], #degree');
    this.department = page.locator('input[name="department"], #department');
    this.idNumber = page.locator('input[name="staffId"], #staffId');
    this.college = page.locator('input[name="affiliation"], #affiliation');
    this.admissionYear = page.locator('input[name="year"], #year');
    this.mobile = page.locator('input[name="contactNos"]');
    this.officePhone = page.locator('input[name="officePhone"], #officePhone');
    this.residentialPhone = page.locator('input[name="residentialPhone"], #residentialPhone');
    this.nationality = page.locator('select[name="nationality"], #nationality');
    
    this.idDocumentFront = page.locator('input[type="file"]').first();
    this.idDocumentBack = page.locator('input[type="file"]').nth(1);
    
    this.affiliation = page.locator('input[name="affiliation"], #affiliation');
    this.degree = page.locator('input[name="degree"], #degree');
    this.year = page.locator('input[name="year"], #year');
  }

  async fillRegistration(fullName: string, email: string, password: string) {
    console.log(`[RegistrationPage] Registering user: ${fullName} (${email})`);
    await this.fillText(this.FullName, fullName, 'Full Name');
    await this.fillText(this.Email, email, 'Email');
    await this.fillText(this.Password, password, 'Password');
  }

  async acceptTermsAndConditions() {
    console.log(`[RegistrationPage] Checking Terms & Conditions checkbox...`);
    await this.termsCheckbox.check({ force: true });
  }
  
  async submitRegistration() {
    await this.clickElement(this.continueButton, 'Continue Button');
  }
}
