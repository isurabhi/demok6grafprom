/*-------------------------------------------------------------------------------*/
// K6 Built-in modules loads
import { check, sleep } from "k6";
import { browser } from "k6/experimental/browser";
import http from "k6/http";
// custom module loads
import { loadTestConfig } from "./general/options.js";
import { appConstants } from "./general/constants.js";
import { getMfaCode } from "./general/getMfaCode.js";
/*-------------------------------------------------------------------------------*/

// Global variables for the application
export const options = loadTestConfig;
const CONSTS = appConstants;
let pContext = new Object();
//let page = new Object();
let countScSh = 0;
//
function screehShot(page, filename) {
  if (CONSTS.isScreenshotEnabled) {
    if (filename == null || filename == "") {
      ++countScSh;
      page.screenshot({
        path: `${CONSTS.screenshotPath}${countScSh}${CONSTS.screenshotExtn}`,
      });
    } else
      page.screenshot({
        path: `${CONSTS.screenshotPath}${filename}${CONSTS.screenshotExtn}`,
      });
  }
}

/*-------------------------------------------------------------------------------*/
// Setup code runs initially once

export function setup() {
  //console.log(JSON.stringify(options));
  console.log("Starting the scenario runs..");
}
// Tear down code runs finally all scenarios
export function teardown() {
  //page.close();
  console.log("Ending the scenario runs..");
}

/*-------------------------------------------------------------------------------*/
/* 01. Scenario - Portal Availability Test */
export function availabilityTest() {
  const res = http.get(CONSTS.portalUrl, {
    tags: { my_custom_tag: "portal_availability" },
  });
  check(res, {
    "status is 200": (r) => r.status == 200,
  });
  sleep(1);
}
/* ----------------------------------------------------------------------------------------- */

/* 02. Scenario - Login & MFA Code access */
export async function portalLogin() {
  //const page = context.newPage();
  const page = browser.newPage();
  const context = page.context();
  context.setDefaultNavigationTimeout(CONSTS.defaultNavigationTimeout);
  context.setDefaultTimeout(CONSTS.defaultTimeout);
  console.log("context" + context);
  // loading to global variable
  //page = browser.newPage();
  try {
    /// Login Page : Entering User name and password.
    ///---------------------------------------------------
    await page.goto(CONSTS.portalUrl);
    screehShot(page); //1
    const messagesLink = page.locator('p[class="login-info-text"]');
    //console.log(messagesLink.textContent());
    page.locator('input[name="Email"]').type(CONSTS.portalUser);
    page.locator('input[name="Password"]').type(CONSTS.portalPass);
    screehShot(page); //2
    const submitButton = page.locator('button[id="trusaic-loginBtn"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    /// Add delay before reading the code.
    sleep(3); // ms

    /// Navigated to MFA Code Page
    /// 01. Login Page : Entering Code MFA page.
    ///---------------------------------------------------
    let mfaCode = getMfaCode(
      CONSTS.domain,
      CONSTS.inbox,
      CONSTS.mailUrl,
      CONSTS.apiToken
    );
    console.log(mfaCode);
    // entering MFA code
    page.locator('input[name="Code"]').type(mfaCode);
    const mfaButton = page.locator('button[type="submit"]');
    screehShot(page); //3
    await Promise.all([page.waitForNavigation(), mfaButton.click()]);
    await page.waitForNavigation();
    screehShot(page, "homepage"); //4
    check(page, {
      header: (p) =>
        p.locator('span[class="Upload-Title"]').textContent() == "PayParity",
    });

    //
    /*
    const page2 = context.newPage();
    await page2.goto(`${CONSTS.portalUrl}/client-config/employee`);
    await page2.waitForNavigation();
    sleep(3);
    screehShot(page2); //5
    const uploadButton = page2.locator(
      '//button[text()=" Upload employee file "]'
    );
    const analButton = page2.locator(
      'button[class="btn btn__analysis btn__analysis--run primary__btn"]'
    );
    if (uploadButton != undefined) {
      console.log(" Scenario Upload : " + uploadButton.textContent());
    } else if (analButton != undefined) {
      console.log(" analButton exist - so running Analysis");
      console.log(" analButton" + analButton); //
      await Promise.all([analButton.click()]);
      screehShot(page2); //6
      await Promise.all([page.waitForNavigation()]);
      screehShot(page2); //7
    }
    */
    //---------------------
  } catch (e) {
    console.log("Error : portalLogin : " + e);
  } finally {
    //page.close();
  }
}
/* ----------------------------------------------------------------------------------------- */

/* 03. Scenario - Employee Data Page Load */
export async function employeePage() {
  console.log("pContext" + pContext);
  const page = pContext.newPage();
  const context = page.context();
  console.log("context" + context);
  //const page = context.newPage();
  try {
    /// Login Page : Entering User name and password.
    ///---------------------------------------------------
    await page.goto(`${CONSTS.portalUrl}/client-config/employee`);
    screehShot(page); //5
    await Promise.all([page.waitForNavigation()]);
    screehShot(page); //6
  } catch (e) {
    console.log("Error : employeePage : " + e);
  } finally {
    page.close();
  }
}
