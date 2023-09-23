import { browser } from "k6/experimental/browser";
import { check, sleep } from "k6";
import http from "k6/http";

//import { fetch } from "fetc";

export const options = {
  insecureSkipTLSVerify: true,
  scenarios: {
    /*kTestLogin: {
      executor: "constant-vus",
      exec: "kTestLogin",
      vus: 1,
      duration: "45s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },*/
    loginTest: {
      executor: "per-vu-iterations",
      exec: "loginTest",
      vus: 1,
      iterations: 1,
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
    */
    /*
    loginTest: {
      executor: "per-vu-iterations",
      exec: "loginTest",
      vus: 1,
      iterations: 1,
      maxDuration: "60s",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
    */
  },
};

export function portalAvailability() {
  const res = http.get("https://portal-qa.trusaic.com");
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}

export function getMFACode() {
  const domain = "trusaic.testinator.com";
  const inbox = "qa";
  const apiToken = "12b00439466e45ee855b3f3c64e4c612";
  const resInbox = http.get(
    "https://mailinator.com/api/v2/domains/" +
      domain +
      "/inboxes/" +
      inbox +
      "/?limit=1&sort=descending&token=" +
      apiToken
  );
  console.log(resInbox.json("msgs"));
  const messageId = resInbox.json("msgs.0.id");
  console.log(messageId);

  const resMessage = http.get(
    "https://mailinator.com/api/v2/domains/" +
      domain +
      "/inboxes/" +
      inbox +
      "/messages/" +
      messageId +
      "/?token=" +
      apiToken
  );
  //console.log(resMessage.json("parts.0.body"));
  const mail = resMessage.json("parts.0.body");
  //console.log(mail);
  const codeRegex =
    /Security code: <span class=\"security-code-span\" style=\"font-weight: 700; font-size: 105%;\">(\d+)/;
  const match = codeRegex.exec(mail);
  if (match) {
    return match[1];
  } else {
    throw new Error("Could not find 2FA code in email message");
  }
}

export async function loginTest() {
  const page = browser.newPage();
  try {
    // 01. Login Page : Entering User name and password.
    //---------------------------------------------------
    await page.goto("https://portal-qa.trusaic.com");
    page.screenshot({ path: "/prometheus/01_trusaicQa.png" });
    const messagesLink = page.waitForSelector('p[class="login-info-text"]');
    //console.log(messagesLink.textContent());
    page.locator('input[name="Email"]').type("qa@Trusaic.testinator.com");
    page.locator('input[name="Password"]').type("Trusaic@12");
    page.screenshot({ path: "/prometheus/02_trusaicQa.png" });
    const submitButton = page.locator('button[id="trusaic-loginBtn"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    /// Add delay before reading the code.

    // Moved to Code Page
    // 01. Login Page : Entering Code MFA page.
    //---------------------------------------------------
    let mfaCode = getMFACode();
    console.log(mfaCode);
    page.locator('input[name="Code"]').type(mfaCode);
    const mfaButton = page.locator('button[type="submit"]');
    page.screenshot({ path: "/prometheus/03_trusaicQa.png" });
    await Promise.all([page.waitForNavigation(), mfaButton.click()]);
    page.screenshot({ path: "/prometheus/04_trusaicQa.png" });

    check(page, {
      header: (p) =>
        p.locator('span[class="Upload-Title"]').textContent() == "PayParity",
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
    //page.screenshot({ path: "/prometheus/01_homepage2.png" });
  } finally {
    page.close();
  }
}
