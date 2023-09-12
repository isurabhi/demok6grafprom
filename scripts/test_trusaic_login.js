import { browser } from "k6/experimental/browser";
import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  insecureSkipTLSVerify: true,
  scenarios: {
    kTestLogin: {
      executor: "constant-vus",
      exec: "kTestLogin",
      vus: 1,
      duration: "45s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
    /*portal: {
      executor: "constant-vus",
      exec: "portalAvailability",
      vus: 1,
      duration: "5s",
    },
    loginTest: {
      executor: "constant-vus",
      exec: "loginTest",
      vus: 1,
      duration: "60s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },*/
  },
};

export function portalAvailability() {
  const res = http.get("https://portal-qa.trusaic.com");
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}

export async function loginTest() {
  const page = browser.newPage();
  try {
    await page.goto("https://portal-qa.trusaic.com");

    const messagesLink = page.waitForSelector('p[class="login-info-text"]');
    console.log(messagesLink.textContent());
    page.locator('input[name="Email"]').type("Secondary@mailinator.com");
    page.waitForSelector('input[name="Password"]').type("Trusaic@12");
    const submitButton = page.locator('input[id="trusaic-loginBtn"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);
    check(page, {
      header: (p) =>
        p.locator('p[class="enter-code-title"]').textContent() ==
        "Enter the code sent to",
    });
  } finally {
    page.close();
  }
}

export async function kTestLogin() {
  const page = browser.newPage();
  try {
    await page.goto("https://test.k6.io/my_messages.php");
    sleep(30);
    page.screenshot({ path: "/prometheus/01_homepage.png" });
    // Enter login credentials
    page.waitForSelector('input[name="login"]').type("admin");
    page.waitForSelector('input[name="password"]').type("123");
    page.screenshot({ path: "/prometheus/01_homepage2.png" });
  } finally {
    page.close();
  }
}
