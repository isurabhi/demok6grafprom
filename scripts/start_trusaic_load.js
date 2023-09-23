/*-------------------------------------------------------------------------------*/
// K6 Built-in modules loads
import { check, sleep } from "k6";
import { browser } from "k6/experimental/browser";
import http from "k6/http";
// custom module loads
import { loadTestConfig } from "./general/options.js";
import { projectConstants } from "./general/helpers.js";
import { isNumeric } from "./general/helpers.js";
/*-------------------------------------------------------------------------------*/

export const options = loadTestConfig;

/* -- Setup code runs initially once -- */
export function setup() {
  //console.log(JSON.stringify(options));
}

/* -- tear down code runs finally all scenarios -- */
export function teardown() {}

export async function portalLogin() {
  const page = browser.newPage();
  try {
    await page.goto("https://test.k6.io/");
    page.screenshot({ path: "/prometheus/01_homepage2.png" });
  } catch (e) {
    console.log(e);
  } finally {
    page.close();
  }
}

export function availabilityTest() {
  const res = http.get("https://portal-qa.trusaic.com", {
    tags: { my_custom_tag: "portal_availability" },
  });
  check(res, {
    "status is 200": (r) => r.status == 200,
  });
  sleep(1);
}
