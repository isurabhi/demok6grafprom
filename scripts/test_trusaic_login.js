import { browser } from "k6/experimental/browser";
import { check } from "k6";

export const options = {
  scenarios: {
    loginui: {
      executor: "constant-vus",
      exec: "loginpageTest",
      vus: 1,
      duration: "10s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
  thresholds: {
    checks: ["rate==1.0"],
  },
};

export const testconfig = {
  loginurl: "https://portal-qa.trusaic.com",
  username: "Secondary@mailinator.com",
  password: "Trusaic@12",
  passcode: "",
};

export async function loginpageTest() {
  const browser = chromium.launch({
    args: ["no-sandbox"],
    headless: true,
    timeout: "60s", // Or whatever time you want to define
  });

  const page = browser.newPage();

  try {
    await page.goto(testconfig.loginurl);
    page.screenshot({ path: "/prometheus/screenshot.png" });
    /*
    page.locator('input[name="Email"]').type(testconfig.username);
    page.locator('input[name="Password"]').type(testconfig.password);
    const submitButton = page.locator('input[id="trusaic-loginBtn"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);
    check(page, {
      header: (p) =>
        p.locator('p[class="enter-code-title"]').textContent() ==
        "Enter the code sent to",
    });
    */
  } finally {
    page.close();
  }
}
